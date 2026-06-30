import React, { useState, useEffect } from "react";
import { Threat, ThreatStatus, ThreatSeverity, StrideCategory } from "../types";
import { X, ShieldAlert, CheckCircle, Clock, Save, Code, Info } from "lucide-react";

interface ThreatDetailsModalProps {
  threat: Threat;
  onClose: () => void;
  onUpdateThreat: (updatedThreat: Threat) => void;
}

export default function ThreatDetailsModal({
  threat,
  onClose,
  onUpdateThreat,
}: ThreatDetailsModalProps) {
  // Local states for interactive editing
  const [status, setStatus] = useState<ThreatStatus>(threat.status);
  const [remediationNotes, setRemediationNotes] = useState<string>(threat.remediationNotes || "");
  
  // DREAD ratings local state
  const [damage, setDamage] = useState<number>(threat.dread.damage);
  const [reproducibility, setReproducibility] = useState<number>(threat.dread.reproducibility);
  const [exploitability, setExploitability] = useState<number>(threat.dread.exploitability);
  const [affectedUsers, setAffectedUsers] = useState<number>(threat.dread.affectedUsers);
  const [discoverability, setDiscoverability] = useState<number>(threat.dread.discoverability);

  // Sync state if threat changes
  useEffect(() => {
    setStatus(threat.status);
    setRemediationNotes(threat.remediationNotes || "");
    setDamage(threat.dread.damage);
    setReproducibility(threat.dread.reproducibility);
    setExploitability(threat.dread.exploitability);
    setAffectedUsers(threat.dread.affectedUsers);
    setDiscoverability(threat.dread.discoverability);
  }, [threat]);

  // Compute DREAD score in real-time
  const computedScore = parseFloat(((damage + reproducibility + exploitability + affectedUsers + discoverability) / 5).toFixed(1));

  // Determine dynamic severity based on active DREAD score
  const getDynamicSeverity = (score: number): ThreatSeverity => {
    if (score >= 8.0) return "Critical";
    if (score >= 6.0) return "High";
    if (score >= 4.0) return "Medium";
    return "Low";
  };

  const dynamicSeverity = getDynamicSeverity(computedScore);

  const getSeverityBadgeClass = (sev: ThreatSeverity) => {
    switch (sev) {
      case "Critical":
        return "bg-rose-950/80 border-rose-800 text-rose-400";
      case "High":
        return "bg-orange-950/80 border-orange-900 text-orange-400";
      case "Medium":
        return "bg-amber-950/80 border-amber-900 text-amber-400";
      case "Low":
        return "bg-blue-950/80 border-blue-900 text-blue-400";
    }
  };

  const getStatusBadgeClass = (st: ThreatStatus) => {
    switch (st) {
      case "Open":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "In-Progress":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Mitigated":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  const handleSave = () => {
    const updated: Threat = {
      ...threat,
      status,
      remediationNotes,
      severity: dynamicSeverity,
      dread: {
        damage,
        reproducibility,
        exploitability,
        affectedUsers,
        discoverability
      }
    };
    onUpdateThreat(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
              {threat.id}
            </span>
            <span className="text-[10px] uppercase font-bold font-mono tracking-wide px-2 py-0.5 rounded border border-emerald-900 bg-emerald-950/60 text-emerald-400">
              {threat.category}
            </span>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)] grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Details Section */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight leading-tight">
                {threat.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Impacts: <span className="font-semibold text-slate-300">{threat.impactedComponent}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500">Threat Description</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 border border-slate-800/80 rounded-lg">
                {threat.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500">Mitigation Architecture</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 border border-slate-800/80 rounded-lg">
                {threat.mitigation}
              </p>
            </div>

            {/* Code Snippet Box */}
            {threat.customCodeSnippet && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500">
                  <Code size={12} className="text-emerald-500" />
                  <span>Secure Implementation Blueprint</span>
                </div>
                <div className="rounded-lg border border-slate-800 overflow-hidden text-left">
                  <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-[9px] font-mono text-slate-500">TypeScript / Node.js Secure Pattern</span>
                  </div>
                  <pre className="bg-slate-950/80 p-4 overflow-x-auto font-mono text-[11px] text-emerald-400 leading-relaxed">
                    <code>{threat.customCodeSnippet}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* DREAD Risk Calculator & Status Sidebar */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-slate-800 lg:pl-6">
            
            {/* Active Risk Score Box */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-slate-400">Risk Severity</span>
                <span className={`text-[10px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full border ${getSeverityBadgeClass(dynamicSeverity)}`}>
                  {dynamicSeverity}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-100 font-mono tracking-tighter">
                  {computedScore}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ 10.0 DREAD</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    dynamicSeverity === "Critical" ? "bg-red-500" :
                    dynamicSeverity === "High" ? "bg-orange-500" :
                    dynamicSeverity === "Medium" ? "bg-amber-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${computedScore * 10}%` }}
                ></div>
              </div>
            </div>

            {/* DREAD Slider Inputs */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">DREAD Matrix Sliders</h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Info size={11} />
                  <span>Drag to recalculate risk</span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/20 p-4 rounded-xl border border-slate-850">
                {/* Damage */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-mono text-[11px]">Damage Potential (D)</span>
                    <span className="text-emerald-400 font-bold font-mono">{damage}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={damage}
                    onChange={(e) => setDamage(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Reproducibility */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-mono text-[11px]">Reproducibility (R)</span>
                    <span className="text-emerald-400 font-bold font-mono">{reproducibility}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={reproducibility}
                    onChange={(e) => setReproducibility(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Exploitability */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-mono text-[11px]">Exploitability (E)</span>
                    <span className="text-emerald-400 font-bold font-mono">{exploitability}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={exploitability}
                    onChange={(e) => setExploitability(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Affected Users */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-mono text-[11px]">Affected Users (A)</span>
                    <span className="text-emerald-400 font-bold font-mono">{affectedUsers}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={affectedUsers}
                    onChange={(e) => setAffectedUsers(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Discoverability */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-mono text-[11px]">Discoverability (D)</span>
                    <span className="text-emerald-400 font-bold font-mono">{discoverability}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={discoverability}
                    onChange={(e) => setDiscoverability(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500">Status & Remediation</h4>
              <div className="grid grid-cols-3 gap-2">
                {(["Open", "In-Progress", "Mitigated"] as ThreatStatus[]).map((st) => (
                  <button
                    key={st}
                    id={`status-btn-${st}`}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2 text-xs rounded-lg font-medium border transition-all ${
                      status === st
                        ? "bg-slate-800 text-emerald-400 border-emerald-500/50 shadow"
                        : "bg-slate-950/40 text-slate-400 border-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    {st === "Open" && "🔴 Open"}
                    {st === "In-Progress" && "🟡 In-Prog"}
                    {st === "Mitigated" && "🟢 Mitigated"}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Notes */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500">Remediation/Security Notes</h4>
              <textarea
                id="remediation-notes-textarea"
                rows={3}
                placeholder="Log security reviews, patching milestones, or references to deployment PRs..."
                value={remediationNotes}
                onChange={(e) => setRemediationNotes(e.target.value)}
                className="w-full text-xs text-slate-300 bg-slate-950/60 border border-slate-800 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40"
              />
            </div>

            {/* Save Button */}
            <button
              id="save-recalculation-btn"
              type="button"
              onClick={handleSave}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
            >
              <Save size={15} />
              SAVE AUDIT RECALCULATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
