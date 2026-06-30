import React, { useState, useRef, useEffect } from "react";
import { Threat, ThreatSeverity, StrideCategory, ThreatStatus } from "../types";
import { Send, Sparkles, Cpu, ShieldCheck, Loader2, RefreshCw, AlertTriangle, MessageSquare } from "lucide-react";

interface AiAssistantProps {
  onAddThreats: (threats: Threat[]) => void;
  activeThreatModel: Threat[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AiAssistant({ onAddThreats, activeThreatModel }: AiAssistantProps) {
  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello, I am your Security Architect Advisor. I'm fully versed in STRIDE threat modeling and automotive digital infrastructure. Ask me about the Apex Automotive Platform, potential attack vectors (like GPS spoofing or database injection), or how to secure specific microservices.",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Custom Component Modeler States
  const [compName, setCompName] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [modelerLoading, setModelerLoading] = useState(false);
  const [modelerLoadingMessage, setModelerLoadingMessage] = useState("");
  const [generatedThreats, setGeneratedThreats] = useState<Threat[]>([]);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [showKeyWarning, setShowKeyWarning] = useState(false);

  useEffect(() => {
    // Check if API key is configured
    fetch("/api/config")
      .then(r => r.json())
      .then(data => {
        setShowKeyWarning(!data.isConfigured);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Loading Messages loop
  const startModelerLoadingStatus = () => {
    const statuses = [
      "Mapping trust boundaries...",
      "Identifying entry/exit points...",
      "Analyzing against STRIDE threat vectors...",
      "Calculating DREAD risk factors...",
      "Synthesizing actionable mitigations..."
    ];
    let i = 0;
    setModelerLoadingMessage(statuses[0]);
    const interval = setInterval(() => {
      i = (i + 1) % statuses.length;
      setModelerLoadingMessage(statuses[i]);
    }, 1800);
    return interval;
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: chatInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      // Bundle last 6 messages for context
      const chatHistory = messages.concat(userMsg).slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/security-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          threatContext: activeThreatModel.map(t => ({ id: t.id, title: t.title, severity: t.severity, status: t.status }))
        })
      });

      const data = await res.json();
      
      const replyMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.response || "No response received.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, replyMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content: "⚠️ I encountered an error communicating with the security service backend. Please make sure the server is fully running and try again.",
        timestamp: new Date()
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAnalyzeComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim() || !compDesc.trim() || modelerLoading) return;

    setGeneratedThreats([]);
    setModelerLoading(true);
    const interval = startModelerLoadingStatus();

    try {
      const res = await fetch("/api/analyze-threat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          componentName: compName,
          componentDescription: compDesc
        })
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.error) {
        throw new Error(data.error);
      }

      setIsFallbackMode(!!data.isFallback);

      // Map the returned objects into full Threat shapes
      const mapped: Threat[] = data.threats.map((t: any, idx: number) => {
        const score = parseFloat(((t.dread.damage + t.dread.reproducibility + t.dread.exploitability + t.dread.affectedUsers + t.dread.discoverability) / 5).toFixed(1));
        return {
          id: `T-AI-${Math.floor(Math.random() * 900) + 100}`,
          title: t.title,
          category: t.category as StrideCategory,
          description: t.description,
          severity: t.severity as ThreatSeverity,
          status: "Open" as ThreatStatus,
          impactedComponent: compName,
          mitigation: t.mitigation,
          dread: t.dread,
          customCodeSnippet: t.customCodeSnippet || `// Safe implementation check for ${compName}\n// Ensure all inputs are strictly typed and authenticated`
        };
      });

      setGeneratedThreats(mapped);
    } catch (err: any) {
      clearInterval(interval);
      alert(`Threat analysis failed: ${err.message || "Unknown error"}`);
    } finally {
      setModelerLoading(false);
    }
  };

  const handleMergeThreats = () => {
    if (generatedThreats.length === 0) return;
    onAddThreats(generatedThreats);
    setGeneratedThreats([]);
    setCompName("");
    setCompDesc("");
    alert(`Successfully added ${generatedThreats.length} threats into your Platform Threat Model Registry! You can view them in the Threat Registry tab.`);
  };

  // Basic formatter for Markdown-like syntax in chat
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold syntax
      let formatted = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const matches = [...formatted.matchAll(boldRegex)];
      
      let elements: React.ReactNode[] = [];
      let lastIdx = 0;
      
      if (matches.length > 0) {
        matches.forEach((match, mIdx) => {
          const textBefore = formatted.substring(lastIdx, match.index);
          const boldText = match[1];
          elements.push(<span key={`n-${mIdx}`}>{textBefore}</span>);
          elements.push(<strong key={`b-${mIdx}`} className="text-emerald-400 font-semibold">{boldText}</strong>);
          lastIdx = (match.index || 0) + match[0].length;
        });
        elements.push(<span key="final">{formatted.substring(lastIdx)}</span>);
      } else {
        elements.push(<span key="line">{formatted}</span>);
      }

      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={i} className="ml-4 list-disc mt-1 text-slate-300 pl-1">{elements}</li>;
      }
      if (line.startsWith("### ")) {
        return <h4 key={i} className="text-xs font-bold font-mono text-slate-200 mt-4 mb-1 uppercase tracking-wide border-b border-slate-800 pb-0.5">{elements}</h4>;
      }
      if (line.trim() === "") {
        return <div key={i} className="h-2"></div>;
      }
      return <p key={i} className="mt-1.5 leading-relaxed text-slate-300">{elements}</p>;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ai-tab-container">
      {/* Key Status Bar */}
      {showKeyWarning && (
        <div className="lg:col-span-12 bg-amber-950/40 border border-amber-900/60 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-xs font-semibold text-amber-300 font-mono">Gemini API Key is currently running on Local Fallback</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              We did not detect an active custom key in `.env`. The system is utilizing a highly realistic template engine to simulate threat generations. To unlock advanced, context-aware LLM security audits and reasoning, add your key to <strong>GEMINI_API_KEY</strong> in the **Settings &gt; Secrets** panel in AI Studio!
            </p>
          </div>
        </div>
      )}

      {/* Column 1: AI Security Chat Advisor */}
      <div className="lg:col-span-7 border border-slate-800 rounded-xl bg-slate-900/40 flex flex-col h-[540px]">
        {/* Chat Title bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 rounded-t-xl">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-emerald-500" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">Security Chat Advisor</h3>
          </div>
          <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded">
            STRIDE Expert
          </span>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${
                m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3.5 rounded-xl border ${
                  m.role === "user"
                    ? "bg-emerald-600 text-slate-950 border-emerald-500 rounded-br-none"
                    : "bg-slate-950/80 text-slate-300 border-slate-800 rounded-bl-none shadow-sm"
                }`}
              >
                {m.role === "user" ? (
                  <p className="leading-relaxed font-medium whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <div className="space-y-1 text-left">{renderMessageContent(m.content)}</div>
                )}
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                {m.role === "user" ? "You" : "Advisor"} • {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {chatLoading && (
            <div className="flex items-center gap-2 text-slate-500 mr-auto p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl rounded-bl-none">
              <Loader2 size={13} className="animate-spin text-emerald-500" />
              <span className="text-[11px] font-mono">Thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSendChat} className="p-3 border-t border-slate-850 bg-slate-950/40 rounded-b-xl flex gap-2">
          <input
            id="chat-input-field"
            type="text"
            placeholder="Ask about GPS spoofing mitigations or database injection vector details..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={chatLoading}
            className="flex-1 bg-slate-900/85 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
          <button
            id="chat-submit-btn"
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-lg transition-colors cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* Column 2: Custom Component Threat Modeler */}
      <div className="lg:col-span-5 border border-slate-800 rounded-xl bg-slate-900/40 p-5 flex flex-col h-[540px] overflow-hidden">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800/85 pb-2.5">
          <Sparkles size={16} className="text-emerald-500" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">Custom System Threat Modeler</h3>
        </div>

        {generatedThreats.length === 0 ? (
          /* Input Form to model component */
          <form onSubmit={handleAnalyzeComponent} className="flex-1 flex flex-col justify-between h-full">
            <div className="space-y-4 overflow-y-auto pr-1">
              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                Design a new subsystem (e.g. <em>Automated Customs Webhook</em>, or <em>Escrow Wiring Microservice</em>) below to run a dedicated STRIDE & DREAD analysis on trust boundaries and data flow entries.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">Component Name</label>
                <input
                  id="custom-component-name"
                  type="text"
                  required
                  placeholder="e.g. OBD-II Key-Fob Signal Relay Handler"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  disabled={modelerLoading}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">Architectural Description</label>
                <textarea
                  id="custom-component-desc"
                  required
                  rows={4}
                  placeholder="e.g. This microservice listens on port 8080 for webhooks dispatched by transport vessels. It parses XML manifests detailing active RFID pings, matches them against local shipping records, and logs physical coordinates into our Core Database."
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  disabled={modelerLoading}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 leading-relaxed"
                />
              </div>
            </div>

            {modelerLoading ? (
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl flex flex-col items-center text-center justify-center space-y-3.5 my-4">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <div>
                  <h4 className="text-xs font-bold text-slate-300 font-mono">Running Security Audits...</h4>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">{modelerLoadingMessage}</p>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-850">
                <button
                  id="analyze-component-submit-btn"
                  type="submit"
                  disabled={!compName.trim() || !compDesc.trim()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <Cpu size={14} />
                  AI-ANALYZE COMPONENT
                </button>
              </div>
            )}
          </form>
        ) : (
          /* Results Panel to Merge threats */
          <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="flex justify-between items-center bg-emerald-950/30 border border-emerald-900/60 p-3 rounded-lg mb-2">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 font-mono">Analysis Complete</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Found {generatedThreats.length} vulnerabilities for <strong>{compName}</strong>
                  </p>
                </div>
                {isFallbackMode && (
                  <span className="text-[9px] font-mono bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-900/40">
                    Rule-Based
                  </span>
                )}
              </div>

              {generatedThreats.map((t, idx) => {
                const computedScore = ((t.dread.damage + t.dread.reproducibility + t.dread.exploitability + t.dread.affectedUsers + t.dread.discoverability) / 5).toFixed(1);
                return (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-200">{t.title}</h4>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-slate-800 border border-slate-750 text-slate-400 rounded">
                          {t.category}
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400">{computedScore}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{t.description}</p>
                    <div className="bg-slate-900 border border-slate-850 p-2.5 rounded text-[10px] text-slate-300">
                      <strong className="text-slate-400 font-bold block mb-0.5 font-mono uppercase tracking-wider text-[9px]">Mitigation Suggestion:</strong>
                      {t.mitigation}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-850 grid grid-cols-2 gap-3 mt-4">
              <button
                id="reset-modeler-btn"
                type="button"
                onClick={() => {
                  setGeneratedThreats([]);
                  setCompName("");
                  setCompDesc("");
                }}
                className="py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-mono font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                Reset Form
              </button>
              <button
                id="add-generated-threats-btn"
                type="button"
                onClick={handleMergeThreats}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck size={14} />
                ADD TO REGISTRY
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
