import React from "react";
import { Threat, DFD_NODES } from "../types";
import { FileText, Printer, Shield, Eye, Database, Globe, Download } from "lucide-react";

interface ExportReportProps {
  threats: Threat[];
}

export default function ExportReport({ threats }: ExportReportProps) {
  const getDreadScore = (t: Threat) => {
    return ((t.dread.damage + t.dread.reproducibility + t.dread.exploitability + t.dread.affectedUsers + t.dread.discoverability) / 5).toFixed(1);
  };

  const criticalCount = threats.filter(t => t.severity === "Critical").length;
  const highCount = threats.filter(t => t.severity === "High").length;
  const mediumCount = threats.filter(t => t.severity === "Medium").length;
  const lowCount = threats.filter(t => t.severity === "Low").length;
  const mitigatedCount = threats.filter(t => t.status === "Mitigated").length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(threats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "apex_auto_threat_model_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6" id="report-tab-container">
      {/* Configuration bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Security Audit Executive Export</h3>
          <p className="text-xs text-slate-400 mt-1">Compile and export the platform threat model into a printable audit document or structured JSON files.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            id="download-json-report-btn"
            onClick={handleDownloadJson}
            className="flex-1 sm:flex-initial py-2 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold font-mono border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={14} />
            JSON EXPORT
          </button>
          <button
            id="trigger-print-report-btn"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Printer size={14} />
            PRINT REPORT / PDF
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white text-slate-950 rounded-xl p-8 max-w-4xl mx-auto shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0" id="printable-report">
        
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="text-slate-900" size={24} />
              <span className="font-mono text-xs tracking-widest font-black uppercase text-slate-500">APEX AUTO IMPORTS</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
              DIGITAL PLATFORM THREAT MODEL REPORT
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Methodology: STRIDE & DREAD Risk Assessment Framework
            </p>
          </div>
          <div className="text-right text-xs font-mono text-slate-600 space-y-1">
            <div>Document ID: <strong className="font-semibold text-slate-900">APX-SEC-2026-R1</strong></div>
            <div>Generated: <span className="text-slate-900">{new Date().toLocaleDateString()}</span></div>
            <div>Version: <span className="text-slate-900">1.0.4-RELEASE</span></div>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-black font-mono tracking-wider uppercase text-slate-800 border-b border-slate-300 pb-1 mb-3">
              1. Executive Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              This formal security threat model documents the vulnerabilities, risk surfaces, and required cryptographic mitigations for the <strong>Apex Auto Imports Digital Platform</strong>. The architecture incorporates wholesale dealer web portals, logistics and customs integrations, and real-time cellular OBD-II vehicle tracking systems. Using the STRIDE framework, our cybersecurity engineering team mapped trust boundaries and identified active threat vectors. Risk levels were assessed using the composite DREAD matrix, establishing prioritizations for architectural remediations.
            </p>
          </div>

          {/* Quick Metrics Bento */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Total Threats</span>
              <span className="text-xl font-bold font-mono text-slate-900 block mt-1">{threats.length}</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
              <span className="text-[10px] font-mono text-rose-600 block uppercase font-bold">Critical</span>
              <span className="text-xl font-bold font-mono text-rose-700 block mt-1">{criticalCount}</span>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <span className="text-[10px] font-mono text-orange-600 block uppercase font-bold">High Risk</span>
              <span className="text-xl font-bold font-mono text-orange-700 block mt-1">{highCount}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <span className="text-[10px] font-mono text-amber-600 block uppercase font-bold">Medium / Low</span>
              <span className="text-xl font-bold font-mono text-amber-700 block mt-1">{mediumCount + lowCount}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center col-span-2 md:col-span-1">
              <span className="text-[10px] font-mono text-emerald-600 block uppercase font-bold">Mitigated</span>
              <span className="text-xl font-bold font-mono text-emerald-700 block mt-1">{mitigatedCount} / {threats.length}</span>
            </div>
          </div>

          {/* DFD Mapping Nodes */}
          <div>
            <h2 className="text-sm font-black font-mono tracking-wider uppercase text-slate-800 border-b border-slate-300 pb-1 mb-3">
              2. Trust Boundaries & Modeled Components
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono">
                    <th className="p-2 border-r border-slate-200">Component Name</th>
                    <th className="p-2 border-r border-slate-200">Type</th>
                    <th className="p-2">Role & Responsibility</th>
                  </tr>
                </thead>
                <tbody>
                  {DFD_NODES.map((node) => (
                    <tr key={node.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-bold text-slate-950 font-mono">{node.label}</td>
                      <td className="p-2 border-r border-slate-200 capitalize font-mono text-slate-600">{node.type}</td>
                      <td className="p-2 text-slate-700">{node.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comprehensive Findings */}
          <div className="break-before-page">
            <h2 className="text-sm font-black font-mono tracking-wider uppercase text-slate-800 border-b border-slate-300 pb-1 mb-4">
              3. Detailed STRIDE STRATEGIC Findings
            </h2>
            
            <div className="space-y-6">
              {threats.map((t) => {
                const dreadScore = getDreadScore(t);
                return (
                  <div key={t.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3 shadow-sm break-inside-avoid">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 border border-slate-350">{t.id}</span>
                          <span className="text-[9px] uppercase font-mono font-bold border border-slate-400 px-1.5 py-0.5 rounded text-slate-600 bg-white">
                            {t.category}
                          </span>
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                            t.status === "Mitigated" ? "bg-emerald-50 text-emerald-700 border-emerald-350" :
                            t.status === "In-Progress" ? "bg-amber-50 text-amber-700 border-amber-350" : "bg-red-50 text-red-700 border-red-350"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold font-mono text-slate-900 mt-1.5 uppercase tracking-tight">{t.title}</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Component: <span className="font-bold text-slate-700">{t.impactedComponent}</span></p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-slate-900">{dreadScore} / 10.0</div>
                        <span className={`text-[9px] font-mono font-bold uppercase block mt-0.5 ${
                          t.severity === "Critical" ? "text-rose-600" :
                          t.severity === "High" ? "text-orange-600" :
                          t.severity === "Medium" ? "text-amber-600" : "text-blue-600"
                        }`}>
                          {t.severity} Severity
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10.5px]">
                      <div className="space-y-1">
                        <strong className="text-[9px] font-mono uppercase text-slate-500 font-black block">Threat Context:</strong>
                        <p className="text-slate-700 leading-relaxed">{t.description}</p>
                      </div>
                      <div className="space-y-1">
                        <strong className="text-[9px] font-mono uppercase text-slate-500 font-black block">Architectural Mitigation:</strong>
                        <p className="text-slate-700 leading-relaxed">{t.mitigation}</p>
                      </div>
                    </div>

                    {t.remediationNotes && (
                      <div className="bg-slate-200/50 border border-slate-300 p-2.5 rounded text-[10px] font-mono text-slate-700">
                        <strong className="text-slate-900">Audit/Remediation Notes:</strong> {t.remediationNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Trail Signatures */}
          <div className="pt-12 border-t border-slate-400 break-inside-avoid mt-12">
            <h3 className="text-xs font-black font-mono tracking-wider uppercase text-slate-800 mb-6">
              4. Signatures & Compliance Attestation
            </h3>
            <div className="grid grid-cols-2 gap-12 text-[11px] font-mono">
              <div className="border-t border-slate-300 pt-3 space-y-1">
                <div className="text-slate-500">Prepared By:</div>
                <div className="font-bold text-slate-900">Security Engineering Lead</div>
                <div className="text-slate-400">Apex Auto Imports Ltd.</div>
                <div className="h-6"></div>
                <div className="border-b border-dashed border-slate-300 w-32"></div>
                <div className="text-[9px] text-slate-400">Date</div>
              </div>
              <div className="border-t border-slate-300 pt-3 space-y-1">
                <div className="text-slate-500">Approved By:</div>
                <div className="font-bold text-slate-900">Chief Information Security Officer (CISO)</div>
                <div className="text-slate-400">Apex Auto Imports Ltd.</div>
                <div className="h-6"></div>
                <div className="border-b border-dashed border-slate-300 w-32"></div>
                <div className="text-[9px] text-slate-400">Date</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
