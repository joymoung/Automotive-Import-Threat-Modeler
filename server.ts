import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it in the Secrets panel in AI Studio.");
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API Endpoint: Check API Key configuration
app.get("/api/config", (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = !!apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "";
  res.json({ isConfigured });
});

// 2. API Endpoint: AI-Powered STRIDE Threat Generator for custom components
app.post("/api/analyze-threat", async (req, res) => {
  try {
    const { componentName, componentDescription, existingModelContext } = req.body;

    if (!componentName || !componentDescription) {
      return res.status(400).json({ error: "Component name and description are required." });
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (keyError: any) {
      // Graceful fallback with simulated but realistic threat templates for when the API key is missing.
      // This ensures the application is highly functional and interactive even before key input.
      console.warn("Gemini API key not found, using realistic rule-based threat generator fallback.");
      const fallbackThreats = generateRuleBasedThreats(componentName, componentDescription);
      return res.json({ 
        threats: fallbackThreats, 
        isFallback: true,
        message: "Generated using local rules. To use advanced Gemini AI reasoning, please configure your GEMINI_API_KEY."
      });
    }

    const systemInstruction = `You are an expert Cybersecurity Architect and Threat Modeling expert specializing in the STRIDE and DREAD frameworks. 
Analyze the provided system component of an automotive import digital platform and generate 3 to 5 realistic, high-fidelity security threats in the STRIDE format.

Return ONLY a valid JSON array of threat objects. Do not include markdown code block formatting like \`\`\`json. Return only the raw JSON.
Each threat object must have the following exact TypeScript interface:
{
  title: string;          // A clear, descriptive threat title
  category: "Spoofing" | "Tampering" | "Repudiation" | "Information Disclosure" | "Denial of Service" | "Elevation of Privilege";
  description: string;    // Thorough explanation of the threat, how it occurs, and potential impact
  severity: "Critical" | "High" | "Medium" | "Low";
  impactedComponent: string; // The component name analyzed
  mitigation: string;     // Specific, concrete, and actionable mitigation strategies or code-level recommendations
  dread: {
    damage: number;       // 1 to 10
    reproducibility: number; // 1 to 10
    exploitability: number;  // 1 to 10
    affectedUsers: number;   // 1 to 10
    discoverability: number; // 1 to 10
  }
}`;

    const prompt = `Perform a STRIDE threat modeling analysis for this new platform component:
Component Name: ${componentName}
Description: ${componentDescription}

Context on the existing platform (Automotive Import Digital Platform):
The platform imports foreign cars, manages customs filings via API, coordinates shipping carrier schedules, manages a dealer B2B auction portal, serves direct-to-consumer buyers, and collects OBD-II vehicle telematics data during shipping.

Generate exactly 3 to 4 distinct security threats specific to this component.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const responseText = response.text ? response.text.trim() : "";
    
    // Parse the output
    try {
      const parsedText = responseText.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
      const result = JSON.parse(parsedText);
      res.json({ threats: Array.isArray(result) ? result : [result], isFallback: false });
    } catch (parseError) {
      console.error("Failed to parse Gemini output as JSON. Raw text was:", responseText);
      // fallback if JSON parser fails
      const fallbackThreats = generateRuleBasedThreats(componentName, componentDescription);
      res.json({ threats: fallbackThreats, isFallback: true, rawOutput: responseText });
    }

  } catch (error: any) {
    console.error("Error in /api/analyze-threat:", error);
    res.status(500).json({ error: error.message || "An error occurred during threat analysis." });
  }
});

// 3. API Endpoint: AI Security Chat / Advisor
app.post("/api/security-chat", async (req, res) => {
  try {
    const { messages, threatContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages history array is required." });
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (keyError: any) {
      return res.json({ 
        response: "I can see you're asking about security, but my **GEMINI_API_KEY** is not configured in the Secrets panel yet. Please add your key to enable full intelligent chat. In the meantime, feel free to browse the pre-seeded automotive threat model, configure threats, calculate risk using DREAD, and export reports!",
        isFallback: true 
      });
    }

    // Format previous messages for Gemini
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const conversationHistory = messages.slice(0, -1).map((msg: any) => {
      return `${msg.role === "user" ? "User" : "Security Advisor"}: ${msg.content}`;
    }).join("\n");

    const systemInstruction = `You are a Senior Principal Cybersecurity Architect. You are acting as an interactive Security Advisor for a digital platform owned by 'Apex Auto Imports' — an international car import company.
The platform includes:
1. Customer Booking Portal (browsing, customized vehicle orders)
2. B2B Dealer Auction Hub (wholesale auctions)
3. Logistics & Customs Tracker (Customs API, port delivery status)
4. Telematics Ingestion Hub (OBD-II hardware pings during transit)
5. Administrative DB & ERP integrations

Use your deep knowledge of automotive threat vectors (e.g. GPS spoofing, CAN bus/OBD tampering, customs fraud, supply chain hijacking, SQL injection, IDOR) to answer questions.
Provide highly educational, realistic, and actionable security insights. Write clean, concise responses in Markdown format. Keep the tone professional, direct, and helpful.`;

    const contextPrompt = threatContext 
      ? `Here is the current security context / active threats being reviewed:\n${JSON.stringify(threatContext, null, 2)}\n\n`
      : "";

    const userPrompt = `${contextPrompt}Conversation History:\n${conversationHistory}\n\nUser: ${lastUserMessage}\n\nSecurity Advisor:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ response: response.text || "No response received.", isFallback: false });

  } catch (error: any) {
    console.error("Error in /api/security-chat:", error);
    res.status(500).json({ error: error.message || "An error occurred during the security chat." });
  }
});

// Helper: Rule-based realistic STRIDE threat generator for fallback when API Key is missing
function generateRuleBasedThreats(compName: string, compDesc: string): any[] {
  const name = compName.toLowerCase();
  const desc = compDesc.toLowerCase();
  
  const templates = [
    {
      title: `Unauthorized Privilege Elevation on ${compName}`,
      category: "Elevation of Privilege",
      description: `An attacker exploits weak parameter-binding or insecure Direct Object References (IDOR) in the ${compName} component to access administrative or high-level system operations without proper authorization.`,
      severity: "High",
      impactedComponent: compName,
      mitigation: "Implement robust, role-based access control (RBAC) on all API endpoints. Never trust client-supplied user roles; validate JWT claims server-side for every request.",
      dread: { damage: 8, reproducibility: 7, exploitability: 6, affectedUsers: 7, discoverability: 8 }
    },
    {
      title: `Tampering of Data Transactions in ${compName}`,
      category: "Tampering",
      description: `In-transit data modified during processing within the ${compName}. If communication channels are unencrypted or signatures are unverified, an attacker could manipulate business-critical values (such as pricing, shipping destination, or vehicle VIN).`,
      severity: "Critical",
      impactedComponent: compName,
      mitigation: "Enforce TLS 1.3 for all in-transit communications. Apply SHA-256 digital signatures to all inter-service payloads and enforce database transaction serialization with strict validation schemas.",
      dread: { damage: 9, reproducibility: 5, exploitability: 6, affectedUsers: 5, discoverability: 6 }
    },
    {
      title: `Denial of Service via Resource Exhaustion in ${compName}`,
      category: "Denial of Service",
      description: `An adversary floods the ${compName} with malicious, high-frequency requests or slow-rate payloads (Slowloris), overwhelming backend handlers, depleting connection pools, and blocking legitimate transactions.`,
      severity: "Medium",
      impactedComponent: compName,
      mitigation: "Introduce global and endpoint-specific rate-limiting (e.g., token-bucket algorithm). Deploy a Web Application Firewall (WAF) to filter bad traffic and configure autoscaling with maximum execution time limits on API requests.",
      dread: { damage: 6, reproducibility: 8, exploitability: 7, affectedUsers: 8, discoverability: 5 }
    },
    {
      title: `Sensitive Information Disclosure via Error Leakage`,
      category: "Information Disclosure",
      description: `Internal stack traces, debug logs, database schemas, or secret environmental values from ${compName} are exposed in error messages returned directly to the browser or public API consumers.`,
      severity: "Medium",
      impactedComponent: compName,
      mitigation: "Configure global error handlers that log detailed technical errors to a secure, private logging bucket (e.g. Google Cloud Logging) while returning generic, sanitized error messages and standard HTTP codes to public clients.",
      dread: { damage: 5, reproducibility: 9, exploitability: 8, affectedUsers: 9, discoverability: 7 }
    }
  ];

  // Pick 3 templates
  return templates.slice(0, 3);
}

// 4. Vite and Static Asset Serving Middleware Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
