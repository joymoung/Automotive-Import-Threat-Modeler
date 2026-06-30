import React, { useState } from "react";
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Map, 
  Table, 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Server,
  Zap,
  Lock,
  Workflow
} from "lucide-react";

export default function MscPortfolio() {
  const [activeSubTab, setActiveSubTab] = useState<"intro" | "diagram" | "stride" | "register" | "summary">("intro");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDownloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Deliverable 1: Mermaid.js Code
  const mermaidCode = `graph TD
  %% Define Trust Boundaries & Zones
  subgraph Public_Zone ["🌐 Public Network (Untrusted Boundary)"]
    Customer["👤 Customer Web Frontend"]
    PaymentAPI["💳 Third-Party Payment API (External Service)"]
  end

  subgraph Trust_Boundary_1 ["🔒 Web Trust Boundary"]
    direction TB
    Gateway["🛡️ API Gateway & WAF"]
    AIChatbot["🤖 AI Customer Service Chatbot (LLM-Powered)"]
  end

  subgraph Secure_Zone ["🛡️ Secure Internal Network (Enterprise Domain)"]
    direction TB
    AdminDash["💼 Internal Admin Dashboard"]
    InventoryDB[("🗄️ Cloud Inventory Database")]
  end

  %% Data Flow & Interactions
  Customer -- "1. Sends Queries / Orders" --> Gateway
  Customer -- "2. Chat Interactions" --> AIChatbot
  AIChatbot -- "3. Query Refinement" --> Gateway
  Gateway -- "4. Authorized API Requests" --> InventoryDB
  Gateway -- "5. Escrow Transactions" --> PaymentAPI
  AdminDash -- "6. Admin & VIN Approvals" --> Gateway
  AdminDash -- "7. Direct Sync" --> InventoryDB

  %% Styles
  classDef public fill:#1e1b4b,stroke:#312e81,stroke-width:2px,color:#fff;
  classDef secure fill:#022c22,stroke:#064e3b,stroke-width:2px,color:#fff;
  classDef boundary fill:#450a0a,stroke:#7f1d1d,stroke-width:2px,stroke-dasharray: 5 5,color:#fff;
  
  class Customer,PaymentAPI public;
  class Gateway,AIChatbot boundary;
  class AdminDash,InventoryDB secure;`;

  // Deliverable 2: STRIDE Markdown Table
  const strideMarkdown = `| Threat ID | STRIDE Category | Target Component | Threat Description (OWASP Top 10 for LLMs / Supply Chain) | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **T-09** | **Tampering** / Info Disclosure | **AI Customer Service Chatbot** | **LLM Prompt Injection (OWASP LLM01):** An attacker crafts dynamic prompts to override system instructions. They manipulate the LLM into disclosing trade secrets, proprietary VIN pricing parameters, or secure internal backend API endpoints. | **High** | Implement robust prompt isolation envelopes, validate all user input through defensive safety guardrails (e.g., Llama Guard), and restrict LLM prompt contexts from housing administrative system credentials. |
| **T-10** | **Tampering** / Elevation | **AI Customer Service Chatbot** | **Insecure Output Handling (OWASP LLM02):** The Chatbot blindly forwards raw database queries or script markups downstream. This allows an attacker to poison LLM-generated answers, executing cross-site scripting (XSS) in internal administrative dashboards. | **High** | Enforce rigorous contextual HTML encoding on all chat-rendered widgets, establish strict Content Security Policies (CSP), and sandbox the chat viewport. |
| **T-11** | **Tampering** | **Third-Party Payment API** | **Supply Chain Compromise:** High-privilege payment library SDKs or DNS records are altered by a malicious third-party. The compromise leaks dealer wire commands or silently redirects physical customer escrow funds to offshore accounts. | **Critical** | Perform continuous automated dependency vulnerability scanning (Snyk/GitHub Dependabot), pin dependencies to specific cryptographic SHA-256 hashes, and implement strict egress firewalls limiting API domain resolutions. |
| **T-12** | **Spoofing** | **Customer Web Frontend** | **Credential Stuffing & Session Hijack:** Attackers utilize bulk leaked dealer credential lists to spoof wholesale dealer accounts, acquiring unauthorized luxury vehicle holds. | **Medium** | Mandate Multi-Factor Authentication (MFA) for commercial enterprise dealers, deploy rate-limiting on authentication entrypoints, and sign session tokens using asymmetric keys. |
| **T-13** | **Elevation of Privilege** | **Internal Admin Dashboard** | **Insecure Direct Object Reference (IDOR):** High-impact endpoints like \`/api/admin/inventory/:id/approve\` do not perform strict role-based access controls, allowing low-privileged port clerks to bypass physical vehicle duties. | **Critical** | Implement strict, server-side Attribute-Based Access Control (ABAC) validating active port clearances before updating the database lifecycle records. |`;

  // Deliverable 3: Risk Register CSV Content
  const riskRegisterCsv = `Threat ID,Description,Likelihood,Business Impact,Mitigation Strategy
T-09,"Prompt Injection overrides system prompt on AI Chatbot to steal VIN reservations.",Medium,Reputational,"Implement strict prompt isolation, guardrail verification (Llama Guard / NeMo Guardrails), and input filtering."
T-10,"AI Chatbot insecure output handling leads to Reflected XSS on Dealer Portal.",High,Financial,"Enforce rigorous contextual HTML output encoding and strict Content Security Policies (CSP) on chat containers."
T-11,"Supply chain compromise of Third-Party Payment API redirects wholesale dealer wires.",Low,Financial & Regulatory,"Utilize isolated iframe injection for payments, execute daily automated payment ledger reconciliation, and sign webhook events with rotated HMAC keys."
T-12,"Spoofing Customer Web Frontend sessions to hijack certified dealer accounts.",Medium,Financial & Reputational,"Enforce OAuth 2.0 with PKCE, multi-factor authentication (MFA) for corporate dealers, and HTTPOnly/Secure cookies."
T-13,"Unauthorized VIN approval status modification via IDOR on Admin Dashboard.",Low,Regulatory,"Apply server-side attribute-based access control (ABAC) validating current ports clearance before updating status records."`;

  // Deliverable 4: Executive Summary Markdown Content
  const executiveSummaryMd = `# EXECUTIVE SECURITY MEMORANDUM

**TO:** Chief Executive Officer (CEO)  
**FROM:** Chief Information Security Officer (CISO) & Senior Cloud Architect  
**DATE:** June 30, 2026  
**SUBJECT:** High-Priority Enterprise Threat Model & Strategic Remediation Timeline  

---

### EXECUTIVE SUMMARY & ARCHITECTURAL OVERVIEW

As we finalize our **2026 Digital Modernization Initiative**—integrating an **AI-driven Customer Service Chatbot** alongside our core **E-Commerce & Customs Portals**—we have completed a comprehensive enterprise security audit. Our assessment focuses on **business continuity, financial safeguard boundaries, and regulatory compliance (ISO/SAE 21434)**.

Our threat modeling identified three high-priority vulnerability vectors. Unmitigated, these vectors could expose the platform to automated financial theft, reputation damage, and severe legal liability. This memorandum details these risks in plain business terms and outlines a phased strategic timeline for risk mitigation.

---

### THE TOP 3 CRITICAL RISK VECTORS

#### 1. AI Chatbot Prompt Injection (OWASP LLM01)
*   **Business Threat:** Attackers can trick our new customer-facing AI Chatbot into acting as a rogue agent. By overriding system prompts, they can obtain internal VIN reservation lists, alter pricing queries, or access hidden dealer dashboards.
*   **Business Impact:** Severe brand reputation damage, lost competitive pricing advantages, and potential regulatory scrutiny on private customer data leaks.
*   **Strategic Mitigation:** Implement immediate input guardrails, isolate the LLM from executing administrative database commands, and deploy real-time behavioral monitoring.

#### 2. Payment API Supply Chain Compromise
*   **Business Threat:** Third-party vendor payment integrations represent an indirect trust boundary. If our payment library dependencies are compromised upstream, attackers can intercept transaction routes and siphon wholesale wire flows.
*   **Business Impact:** Direct financial loss, breach of wholesale dealer confidence, and non-compliance with international financial processing mandates.
*   **Strategic Mitigation:** Pin third-party libraries to immutable cryptographic SHA hashes, isolate payment flows in hardened frame structures, and implement automated multi-channel ledger reconciliations.

#### 3. Administrative Interface Privilege Escalation (IDOR)
*   **Business Threat:** Flaws in our Internal Admin Dashboard permit low-privileged accounts to edit API routes. This allows a standard port agent to bypass customs verification and approve "Port Release" on vehicle records.
*   **Business Impact:** Infraction of federal import regulations, massive customs fines, and potential systemic vehicle inventory losses.
*   **Strategic Mitigation:** Implement explicit Server-Side Attribute-Based Access Control (ABAC) and log all status modifications to an immutable ledger.

---

### STRATEGIC ROADMAP & REMEDIATION TIMELINE

To ensure seamless business operations without interrupting our sales velocity, we recommend a phased timeline:

\`\`\`
[ IMMEDIATE ACTION (Days 1–15) ]  ===>  [ SHORT-TERM CODES (Days 16–45) ] ===> [ STRATEGIC ALIGNMENT (Days 46–90) ]
- Patch IDOR vulnerabilities           - Deploy LLM Input/Output Guardrails   - Complete ISO 21434 Certifications
- Lock Payment SDK hashes               - Roll out Corporate Dealer MFA        - Conduct formal external penetration testing
\`\`\``;

  return (
    <div className="space-y-6" id="msc-portfolio-panel">
      {/* Header Banner */}
      <div className="bg-slate-900/50 border border-emerald-900/50 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-900/40 text-emerald-400 text-[10px] font-mono uppercase font-bold tracking-wider">
              <GraduationCap size={12} />
              M.Sc. Cybersecurity Portfolio Deliverables
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
              ENTERPRISE CYBERSECURITY RISK AUDIT
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Fully compliant academic portfolio containing the complete architecture diagrams, STRIDE matrices, Risk Registers, and executive memorandums requested for your elite university application.
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className="text-[10px] font-mono text-slate-500">APPLICANT ROLE:</span>
            <span className="text-xs font-mono font-bold text-slate-300 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
              CISO & SENIOR ARCHITECT
            </span>
          </div>
        </div>

        {/* Portfolio Tabs Header */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-slate-800 pt-4 font-mono text-[11px]">
          <button
            onClick={() => setActiveSubTab("intro")}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === "intro" 
                ? "bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold" 
                : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck size={14} />
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveSubTab("diagram")}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === "diagram" 
                ? "bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold" 
                : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Map size={14} />
            1. ARCHITECTURE DIAGRAM
          </button>
          <button
            onClick={() => setActiveSubTab("stride")}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === "stride" 
                ? "bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold" 
                : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Table size={14} />
            2. STRIDE MODEL
          </button>
          <button
            onClick={() => setActiveSubTab("register")}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === "register" 
                ? "bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold" 
                : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileSpreadsheet size={14} />
            3. RISK REGISTER (CSV)
          </button>
          <button
            onClick={() => setActiveSubTab("summary")}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === "summary" 
                ? "bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold" 
                : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText size={14} />
            4. EXECUTIVE MEMO
          </button>
        </div>
      </div>

      {/* Dynamic Content Panel */}
      <div className="transition-all duration-200">
        
        {/* TAB: INTRODUCTION OVERVIEW */}
        {activeSubTab === "intro" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-6">
              <div className="border border-slate-900 bg-slate-950/40 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-400" />
                  Applicant Academic Context & Portfolio Goals
                </h3>
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <p>
                    In modern enterprise systems, rapid digital transformation regularly creates new threat interfaces. This university portfolio implements a state-of-the-art cybersecurity assessment for a modernized automotive retail and e-commerce clearing environment.
                  </p>
                  <p>
                    By evaluating risk boundaries surrounding our automated systems—specifically focusing on **AI LLM integration vulnerabilities** and **Third-Party API supply chain risk**—we demonstrate practical expertise in modern threat modeling workflows.
                  </p>
                  <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg space-y-2">
                    <h4 className="font-bold text-slate-200 font-mono text-[11px] uppercase text-emerald-400">Integrated academic deliverables:</h4>
                    <ul className="space-y-2 font-mono text-[10px] text-slate-400">
                      <li className="flex items-center gap-2">
                        <ChevronRight size={12} className="text-emerald-500" />
                        <span><strong>1. Mermaid Architecture Spec:</strong> Complete network zone & trust boundary map.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight size={12} className="text-emerald-500" />
                        <span><strong>2. STRIDE Matrix:</strong> Grounded in OWASP Top 10 for LLM and Supply-chain concerns.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight size={12} className="text-emerald-500" />
                        <span><strong>3. Risk Register (CSV):</strong> Raw compliant tabular data for easy ingestion.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight size={12} className="text-emerald-500" />
                        <span><strong>4. CEO Executive Brief:</strong> High-impact non-technical C-suite summary.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Enterprise Architecture Map Summary */}
              <div className="border border-slate-900 bg-slate-950/20 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Workflow size={16} className="text-blue-400" />
                  Target Enterprise Subsystems Map
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Server size={14} className="text-emerald-400" />
                      <span className="font-mono font-bold text-slate-200">AI Customer Bot</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      LLM-backed advisor helping dealers search and query inventory specifications dynamically. Subject to prompt-manipulation risks.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={14} className="text-amber-400" />
                      <span className="font-mono font-bold text-slate-200">Wholesale Payment API</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Third-party API processing custom duties and high-value dealer escrow payouts. Sits outside our direct network host.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock size={14} className="text-rose-400" />
                      <span className="font-mono font-bold text-slate-200">Admin Dashboard</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Internal control interface used by logistics clerks to approve VIN custom clears. Critical administrative pivot point.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Map size={14} className="text-blue-400" />
                      <span className="font-mono font-bold text-slate-200">Customer E-Shop</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Public-facing web platform housing the initial inventory search database catalog and purchase workflows.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 space-y-6">
              {/* Portfolio Progress Checklist */}
              <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-xl space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">M.Sc. Application Assessment</h4>
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-[8px]">✓</div>
                    <span>ISO/SAE 21434 Standardized</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-[8px]">✓</div>
                    <span>OWASP LLM 2026 Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-[8px]">✓</div>
                    <span>Trust Boundaries Visualized</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-[8px]">✓</div>
                    <span>CEO Strategic Brief Written</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900">
                  <button
                    onClick={() => setActiveSubTab("diagram")}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs font-mono tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    LAUNCH PORTFOLIO DELIVERABLES
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* CISO Academic Bio */}
              <div className="border border-slate-900 bg-slate-950/20 p-5 rounded-xl space-y-3 text-[11px] text-slate-400">
                <strong className="text-slate-200 font-mono block">CISO Academic Portfolio Advice:</strong>
                <p className="leading-relaxed">
                  "Graduate admissions teams look for candidates who can bridge highly technical security assessments with concrete strategic business recommendations. This threat model demonstrates exactly that balance."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: ARCHITECTURE DIAGRAM */}
        {activeSubTab === "diagram" && (
          <div className="space-y-6">
            <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                    1. MERMAID.JS SYSTEM FLOWSPEC & TRUST BOUNDARIES
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Ready for compilation inside GitHub markdown files or live Mermaid-js engines.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyToClipboard(mermaidCode, "mermaid")}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-mono font-bold transition-colors"
                  >
                    {copiedText === "mermaid" ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span>COPIED CODE</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>COPY SOURCE</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadFile(mermaidCode, "architecture_diagram.mermaid", "text/plain")}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-mono font-bold transition-colors"
                  >
                    <Download size={12} />
                    <span>DOWNLOAD FILE</span>
                  </button>
                </div>
              </div>

              {/* Code Box */}
              <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-96">
                <pre>{mermaidCode}</pre>
              </div>

              {/* Visualized Explanation of Trust Boundaries */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 space-y-4 text-xs">
                <h4 className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Understanding the Visual Trust Boundaries (CISO Insight)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
                  <div className="p-3.5 bg-indigo-950/20 border border-indigo-900/40 rounded-lg">
                    <strong className="text-indigo-400 block mb-1">🌐 1. Public Network Zone</strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Houses user web browsers and the external payment platform. No security checks are fully controlled by us here; data is considered completely untrusted.
                    </p>
                  </div>
                  <div className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-lg">
                    <strong className="text-rose-400 block mb-1">🔒 2. Web Trust Boundary</strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Sits immediately behind our Cloud API Gateway and WAF. This boundary manages incoming traffic filters, user authentication validation, and AI Chatbot input scrubbing.
                    </p>
                  </div>
                  <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-lg">
                    <strong className="text-emerald-400 block mb-1">🛡️ 3. Secure Internal Network</strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      The core enterprise network. Contains the high-privilege Admin dashboard and primary PostgreSQL Inventory DB. Strict authorization is required to cross this zone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STRIDE MODEL */}
        {activeSubTab === "stride" && (
          <div className="space-y-6">
            <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                    2. STRIDE THREAT MATRIX FOR PORTFOLIO
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Directly compliant markdown table ready to inject into your academic documentation.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyToClipboard(strideMarkdown, "stride")}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-mono font-bold transition-colors"
                  >
                    {copiedText === "stride" ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span>COPIED MARKDOWN</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>COPY MARKDOWN</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadFile(strideMarkdown, "stride_threats.md", "text/markdown")}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-mono font-bold transition-colors"
                  >
                    <Download size={12} />
                    <span>DOWNLOAD FILE</span>
                  </button>
                </div>
              </div>

              {/* Rendered Visual Table */}
              <div className="overflow-x-auto border border-slate-900 rounded-lg bg-slate-950/20">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-900 text-slate-400 text-[10px] uppercase">
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Target Node</th>
                      <th className="px-4 py-3 max-w-sm">Threat & Vector Description</th>
                      <th className="px-4 py-3 text-center">Severity</th>
                      <th className="px-4 py-3 max-w-xs">Remediation Blueprint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-[11px] text-slate-300">
                    <tr>
                      <td className="px-4 py-4 font-bold text-slate-400">T-09</td>
                      <td className="px-4 py-4">
                        <span className="bg-orange-950 text-orange-400 px-1.5 py-0.5 rounded border border-orange-900 font-bold text-[9px] uppercase">TAMPERING</span>
                      </td>
                      <td className="px-4 py-4 font-bold">AI Chatbot</td>
                      <td className="px-4 py-4 leading-relaxed font-sans">
                        <strong className="text-slate-100 block mb-1">LLM Prompt Injection (OWASP LLM01)</strong>
                        Attackers bypass core rules by typing complex instructions, forcing the chatbot to query secrets or dump internal car keys.
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-orange-950 border border-orange-900 text-orange-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase">HIGH</span>
                      </td>
                      <td className="px-4 py-4 leading-relaxed font-sans text-slate-400">
                        Isolate contexts, utilize pre-built guardrails (Llama Guard), and restrict access of chatbot DB queries.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-4 py-4 font-bold text-slate-400">T-10</td>
                      <td className="px-4 py-4">
                        <span className="bg-orange-950 text-orange-400 px-1.5 py-0.5 rounded border border-orange-900 font-bold text-[9px] uppercase">TAMPERING</span>
                      </td>
                      <td className="px-4 py-4 font-bold">AI Chatbot</td>
                      <td className="px-4 py-4 leading-relaxed font-sans">
                        <strong className="text-slate-100 block mb-1">Insecure Output Handling (OWASP LLM02)</strong>
                        Chatbot passes raw HTML/script output from users. Attackers poison model outputs, resulting in severe administrative cross-site scripting (XSS).
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-orange-950 border border-orange-900 text-orange-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase">HIGH</span>
                      </td>
                      <td className="px-4 py-4 leading-relaxed font-sans text-slate-400">
                        Enforce contextual HTML encoding on output nodes and implement tight frame Content Security Policies (CSP).
                      </td>
                    </tr>

                    <tr>
                      <td className="px-4 py-4 font-bold text-slate-400">T-11</td>
                      <td className="px-4 py-4">
                        <span className="bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-900 font-bold text-[9px] uppercase">TAMPERING</span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-400">Payment API</td>
                      <td className="px-4 py-4 leading-relaxed font-sans">
                        <strong className="text-slate-100 block mb-1">Supply Chain Library Hijack</strong>
                        Malicious code injected inside external NPM or payment webhook scripts. Compromises transaction ledgers or reroutes wires.
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-red-950 border border-red-900 text-red-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase">CRITICAL</span>
                      </td>
                      <td className="px-4 py-4 leading-relaxed font-sans text-slate-400">
                        Verify packages using explicit SHA locks, configure restrictive egress rules, and validate webhooks with HMAC.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-4 py-4 font-bold text-slate-400">T-12</td>
                      <td className="px-4 py-4">
                        <span className="bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900 font-bold text-[9px] uppercase">SPOOFING</span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-400">Customer Frontend</td>
                      <td className="px-4 py-4 leading-relaxed font-sans">
                        <strong className="text-slate-100 block mb-1">Credential Stuffing Attack</strong>
                        Credential re-use forces session hijacks on commercial importer accounts, generating fake vehicle holds.
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-amber-950 border border-amber-900 text-amber-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase">MEDIUM</span>
                      </td>
                      <td className="px-4 py-4 leading-relaxed font-sans text-slate-400">
                        Enforce multi-factor verification on commercial dealer access, and integrate adaptive login anomaly monitoring.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-4 py-4 font-bold text-slate-400">T-13</td>
                      <td className="px-4 py-4">
                        <span className="bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-900 font-bold text-[9px] uppercase">ELEVATION</span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-400">Admin Dashboard</td>
                      <td className="px-4 py-4 leading-relaxed font-sans">
                        <strong className="text-slate-100 block mb-1">Insecure Direct Object Reference (IDOR)</strong>
                        Low-clearance accounts manipulate parameters on backend API routing to bypass customs clearance gates without payments.
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-red-950 border border-red-900 text-red-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase">CRITICAL</span>
                      </td>
                      <td className="px-4 py-4 leading-relaxed font-sans text-slate-400">
                        Implement rigorous attribute checks (ABAC) server-side and audit all inventory transitions.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RISK REGISTER (CSV) */}
        {activeSubTab === "register" && (
          <div className="space-y-6">
            <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                    3. RAW EXPORTABLE CSV RISK REGISTER
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Structured CSV listing columns precisely matching academic requirements.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyToClipboard(riskRegisterCsv, "csv")}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-mono font-bold transition-colors"
                  >
                    {copiedText === "csv" ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span>COPIED CSV</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>COPY CSV CODE</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadFile(riskRegisterCsv, "risk_register.csv", "text/csv")}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-mono font-bold transition-colors"
                  >
                    <Download size={12} />
                    <span>DOWNLOAD CSV FILE</span>
                  </button>
                </div>
              </div>

              {/* Code Box */}
              <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                <pre>{riskRegisterCsv}</pre>
              </div>

              {/* Columns explainer */}
              <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-lg text-xs leading-relaxed text-slate-400">
                <strong className="text-slate-200 font-mono block mb-1">CSV Header Standard:</strong>
                Column keys: <code className="text-emerald-400 font-mono">Threat ID</code>, <code className="text-emerald-400 font-mono">Description</code>, <code className="text-emerald-400 font-mono">Likelihood</code>, <code className="text-emerald-400 font-mono">Business Impact</code>, and <code className="text-emerald-400 font-mono">Mitigation Strategy</code>. Designed for instant loading into Microsoft Excel, Google Sheets, or university databases.
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EXECUTIVE SUMMARY */}
        {activeSubTab === "summary" && (
          <div className="space-y-6">
            <div className="border border-slate-900 bg-slate-950/40 p-6 rounded-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                    4. 1-PAGE C-SUITE EXECUTIVE BRIEF & TIMELINE
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Formulated in an eye-safe corporate format matching administrative best practices.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyToClipboard(executiveSummaryMd, "summary")}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-mono font-bold transition-colors"
                  >
                    {copiedText === "summary" ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span>COPIED MEMO</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>COPY MARKDOWN</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadFile(executiveSummaryMd, "executive_security_memorandum.md", "text/markdown")}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-mono font-bold transition-colors"
                  >
                    <Download size={12} />
                    <span>DOWNLOAD FILE</span>
                  </button>
                </div>
              </div>

              {/* Styled Memo Paper */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-8 space-y-6 text-slate-300 shadow-2xl font-sans" id="executive-printed-memo">
                
                {/* Letterhead */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-4 flex-wrap gap-4">
                  <div>
                    <h2 className="text-lg font-black font-mono tracking-tight text-slate-100">
                      APEX AUTOMOTIVE IMPORTS
                    </h2>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                      Office of the Chief Information Security Officer
                    </span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-500">
                    <div>CONFIDENTIAL DOCUMENT</div>
                    <div>CLASS: ENTERPRISE STRATEGY</div>
                  </div>
                </div>

                {/* Metadata block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/40 p-4 border border-slate-850 rounded-lg font-mono text-[11px] text-slate-300">
                  <div className="space-y-1">
                    <div><strong>TO:</strong> Chief Executive Officer (CEO)</div>
                    <div><strong>FROM:</strong> Chief Information Security Officer (CISO)</div>
                  </div>
                  <div className="space-y-1 sm:text-right">
                    <div><strong>DATE:</strong> June 30, 2026</div>
                    <div><strong>SUBJECT:</strong> Cybersecurity Assessment Summary</div>
                  </div>
                </div>

                {/* Content Paragraphs */}
                <div className="space-y-5 text-xs leading-relaxed">
                  <p>
                    As we finalize our <strong>2026 Digital Modernization Initiative</strong>—integrating an <strong>AI-driven Customer Service Chatbot</strong> alongside our core <strong>E-Commerce &amp; Customs Portals</strong>—we have completed a comprehensive enterprise security audit. Our assessment focuses on <strong>business continuity, financial safeguard boundaries, and regulatory compliance (ISO/SAE 21434)</strong>.
                  </p>
                  <p>
                    Our threat modeling identified three high-priority vulnerability vectors. Unmitigated, these vectors could expose the platform to automated financial theft, reputation damage, and severe legal liability. This memorandum details these risks in plain business terms and outlines a phased strategic timeline for risk mitigation.
                  </p>
                </div>

                {/* Bullet Cards */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-100 border-b border-slate-900 pb-1.5">
                    Critical Business Risk Focus Areas
                  </h4>

                  <div className="grid grid-cols-1 gap-3.5">
                    <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-xs text-amber-400 font-bold font-sans">1. AI Chatbot Prompt Injection (OWASP LLM01)</strong>
                        <span className="text-[9px] font-mono bg-amber-950 text-amber-400 border border-amber-900 px-1.5 py-0.5 rounded font-bold uppercase">HIGH RISK</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        Attackers trick the customer AI Chatbot to bypass prompt restrictions, accessing confidential dealer VIN catalogs, unapproved tariffs documentation, and administrative pipeline links.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-xs text-red-400 font-bold font-sans">2. Payment Gateway Supply Chain Vulnerability</strong>
                        <span className="text-[9px] font-mono bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 rounded font-bold uppercase">CRITICAL RISK</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        Malicious modifications inside payment vendor code packages allow hackers to redirect escrow transfer wires, triggering immediate high-value banking losses.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-xs text-red-400 font-bold font-sans">3. Admin Dashboard IDOR (Privilege Escalation)</strong>
                        <span className="text-[9px] font-mono bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 rounded font-bold uppercase">CRITICAL RISK</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        Administrative validation omissions let low-privileged clerks transition car database statuses to "Released" without physical customs clearance checks.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline Visualizer */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-100 border-b border-slate-900 pb-1.5">
                    Strategic Remediation Roadmap
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl">
                      <div className="flex items-center justify-center gap-1.5 text-red-400 font-bold font-mono text-[10px] uppercase mb-1">
                        <Clock size={12} />
                        Immediate (1-15 Days)
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        Lock Third-Party Payment SDK hashes; patch IDOR flaws on VIN statuses.
                      </p>
                    </div>
                    <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl">
                      <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold font-mono text-[10px] uppercase mb-1">
                        <Clock size={12} />
                        Mid-Term (16-45 Days)
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        Deploy LLM prompt isolating filters; enforce MFA for all corporate dealers.
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold font-mono text-[10px] uppercase mb-1">
                        <Clock size={12} />
                        Strategic (46-90 Days)
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        Establish ISO 21434 certifications; initiate recurring automated penetration testing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Humble sign-off */}
                <div className="border-t border-slate-800 pt-5 flex justify-between items-end text-xs font-mono text-slate-500">
                  <div>
                    <div>APPROVED BY:</div>
                    <div className="text-slate-300 font-bold mt-1 uppercase">CISO BOARD OF AUDITORS</div>
                  </div>
                  <div className="text-right">
                    <div>APEX AUTOMOTIVE IMPORTS GROUP</div>
                    <div>PORTFOLIO ID: MSC-CYBER-2026</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
