import React, { useState } from "react";
import {
  INITIAL_THREATS,
  DFD_NODES,
  Threat,
  ThreatSeverity,
  ThreatStatus,
  StrideCategory
} from "./types";
import InteractiveDfd from "./components/InteractiveDfd";
import ThreatDetailsModal from "./components/ThreatDetailsModal";
import AiAssistant from "./components/AiAssistant";
import ExportReport from "./components/ExportReport";
import MscPortfolio from "./components/MscPortfolio";
import {
  Shield,
  Activity,
  ListFilter,
  Search,
  Sparkles,
  FileSpreadsheet,
  AlertOctagon,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingDown,
  LayoutDashboard,
  Map,
  FileText,
  Calendar,
  Lock,
  GraduationCap
} from "lucide-react";

export default function App() {
  // Global Threat Model Registry State
  const [threats, setThreats] = useState<Threat[]>(INITIAL_THREATS);

  // Layout & Filtering states
  const [activeTab, setActiveTab] = useState<"overview" | "dfd" | "registry" | "ai" | "report" | "portfolio">("overview");
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedStride, setSelectedStride] = useState<string>("All");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Threat Detail Modal focused item
  const [focusedThreat, setFocusedThreat] = useState<Threat | null>(null);

  // Real-time security score algorithm:
  // Starts at 100%. For each non-mitigated threat, subtract based on severity:
  // Critical: -12, High: -8, Medium: -4, Low: -2. Capped between 0 and 100.
  const calculateSecurityScore = () => {
    let baseScore = 100;
    threats.forEach((t) => {
      if (t.status !== "Mitigated") {
        if (t.severity === "Critical") baseScore -= 12;
        else if (t.severity === "High") baseScore -= 8;
        else if (t.severity === "Medium") baseScore -= 4;
        else if (t.severity === "Low") baseScore -= 2;
      }
    });
    return Math.max(0, baseScore);
  };

  const securityScore = calculateSecurityScore();

  // Color mappings for security rating indicator
  const getSecurityScoreColorClass = (score: number) => {
    if (score >= 80) return { text: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-800", bar: "bg-emerald-500" };
    if (score >= 50) return { text: "text-amber-400", bg: "bg-amber-950/40", border: "border-amber-800", bar: "bg-amber-500" };
    return { text: "text-rose-400", bg: "bg-rose-950/40", border: "border-rose-800", bar: "bg-rose-500" };
  };

  const scoreColors = getSecurityScoreColorClass(securityScore);

  // Handlers for merging newly AI generated threats or updating existing ones
  const handleAddThreats = (newThreats: Threat[]) => {
    setThreats((prev) => [...newThreats, ...prev]);
  };

  const handleUpdateThreat = (updatedThreat: Threat) => {
    setThreats((prev) => prev.map((t) => (t.id === updatedThreat.id ? updatedThreat : t)));
    setFocusedThreat(null);
  };

  // Filter logic for threat table/list
  const filteredThreats = threats.filter((t) => {
    const matchesComponent = selectedComponent ? t.impactedComponent === selectedComponent : true;
    const matchesStride = selectedStride !== "All" ? t.category === selectedStride : true;
    const matchesSeverity = selectedSeverity !== "All" ? t.severity === selectedSeverity : true;
    const matchesStatus = selectedStatus !== "All" ? t.status === selectedStatus : true;
    
    const text = (t.title + " " + t.description + " " + t.impactedComponent + " " + t.id).toLowerCase();
    const matchesSearch = text.includes(searchQuery.toLowerCase());

    return matchesComponent && matchesStride && matchesSeverity && matchesStatus && matchesSearch;
  });

  const totalThreatsCount = threats.length;
  const openCount = threats.filter((t) => t.status === "Open").length;
  const inProgressCount = threats.filter((t) => t.status === "In-Progress").length;
  const mitigatedCount = threats.filter((t) => t.status === "Mitigated").length;

  const activeCriticalCount = threats.filter(t => t.severity === "Critical" && t.status !== "Mitigated").length;
  const activeHighCount = threats.filter(t => t.severity === "High" && t.status !== "Mitigated").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative" id="root-container">
      
      {/* Printable Report Wrapper override inside CSS context */}
      <div id="printable-report-wrapper" className="hidden print:block">
        <ExportReport threats={threats} />
      </div>

      {/* Decorative ambient background lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-950/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Global Application Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-emerald-950 border border-emerald-900/60 text-emerald-400">
            <Shield size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight font-mono text-slate-100 uppercase flex items-center gap-1.5">
              APEX AUTO PLATFORM <span className="text-[10px] text-emerald-400 font-semibold border border-emerald-900 bg-emerald-950/40 px-1.5 py-0.5 rounded">THREAT MODELER</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Automotive Import Digital Architecture Security Audit Registry</p>
          </div>
        </div>

        {/* Global Metadata & Timestamp Status */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400">
            <Calendar size={13} className="text-slate-500" />
            <span>UTC: <strong className="text-slate-300 font-medium">2026-06-30 13:50:34</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400">
            <Lock size={13} className="text-emerald-500" />
            <span>Scope: <strong className="text-emerald-400 font-bold uppercase">Automotive Platforms</strong></span>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="app-main-layout">
        
        {/* Left Column: Security Index Panel & Navigation */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Platform Security Rating Dashboard Card */}
          <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Platform Security Index</span>
              <span className={`text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${scoreColors.border} ${scoreColors.text} ${scoreColors.bg}`}>
                {securityScore >= 80 ? "SECURE" : securityScore >= 50 ? "WARNING" : "CRITICAL RISK"}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black font-mono tracking-tighter text-slate-100">
                {securityScore}
              </span>
              <span className="text-xs text-slate-500 font-mono">/100</span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${scoreColors.bar}`}
                style={{ width: `${securityScore}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {securityScore >= 80 ? "Excellent standing. Cryptographic trust boundaries are strictly enforced. Continue monitoring IoT telemetry feeds." :
               securityScore >= 50 ? "Vulnerabilities present. High-risk vectors exist in the API gateway and OBD-II telemetry parser. Remediation required." :
               "Severe security deficit! Unmitigated Critical-level SQL Injection and IDOR vulnerabilities could allow unauthorized vehicle status approval or ledger tampering."}
            </p>
          </div>

          {/* Tab Navigation Menu */}
          <nav className="border border-slate-900 bg-slate-950/20 rounded-xl overflow-hidden font-mono text-xs">
            <button
              id="nav-tab-overview"
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-900 text-left transition-all ${
                activeTab === "overview"
                  ? "bg-slate-900 text-emerald-400 border-r-2 border-r-emerald-500 font-semibold"
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard size={16} />
              <span>OVERVIEW POSTURE</span>
            </button>
            <button
              id="nav-tab-dfd"
              onClick={() => setActiveTab("dfd")}
              className={`w-full flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-900 text-left transition-all ${
                activeTab === "dfd"
                  ? "bg-slate-900 text-emerald-400 border-r-2 border-r-emerald-500 font-semibold"
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <Map size={16} />
              <span>ARCHITECTURE DFD</span>
            </button>
            <button
              id="nav-tab-registry"
              onClick={() => setActiveTab("registry")}
              className={`w-full flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-900 text-left transition-all ${
                activeTab === "registry"
                  ? "bg-slate-900 text-emerald-400 border-r-2 border-r-emerald-500 font-semibold"
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <Activity size={16} />
              <span>THREAT REGISTRY ({filteredThreats.length})</span>
            </button>
            <button
              id="nav-tab-ai"
              onClick={() => setActiveTab("ai")}
              className={`w-full flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-900 text-left transition-all ${
                activeTab === "ai"
                  ? "bg-slate-900 text-emerald-400 border-r-2 border-r-emerald-500 font-semibold"
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <Sparkles size={16} />
              <span>AI SECURITY ADVISOR</span>
            </button>
            <button
              id="nav-tab-report"
              onClick={() => setActiveTab("report")}
              className={`w-full flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-900 text-left transition-all ${
                activeTab === "report"
                  ? "bg-slate-900 text-emerald-400 border-r-2 border-r-emerald-500 font-semibold"
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <FileText size={16} />
              <span>COMPLIANCE REPORT</span>
            </button>
            <button
              id="nav-tab-portfolio"
              onClick={() => setActiveTab("portfolio")}
              className={`w-full flex items-center gap-2.5 px-4 py-3.5 text-left transition-all ${
                activeTab === "portfolio"
                  ? "bg-slate-900 text-emerald-400 border-r-2 border-r-emerald-500 font-semibold"
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <GraduationCap size={16} className="text-emerald-400 animate-pulse" />
              <span>M.Sc. PORTFOLIO</span>
            </button>
          </nav>

          {/* Quick Metrics Statistics */}
          <div className="border border-slate-900 bg-slate-950/20 p-5 rounded-xl space-y-3 font-mono text-[11px]">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Model Statistics</h4>
            <div className="flex justify-between items-center py-1 border-b border-slate-900">
              <span className="text-slate-400">Total Vulnerabilities</span>
              <span className="text-slate-200 font-bold">{totalThreatsCount}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900">
              <span className="text-slate-400">🔴 Open Findings</span>
              <span className="text-red-400 font-bold">{openCount}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900">
              <span className="text-slate-400">🟡 Active Remediation</span>
              <span className="text-amber-400 font-bold">{inProgressCount}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">🟢 Mitigated Controls</span>
              <span className="text-emerald-400 font-bold">{mitigatedCount}</span>
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Content Workspace Panel */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Risk Overview Callout Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-rose-950/20 border border-rose-900/60 p-4 rounded-xl flex items-start gap-3">
                  <AlertOctagon className="text-rose-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-xs font-semibold text-rose-300 font-mono">Unmitigated Criticals</h4>
                    <span className="text-2xl font-black font-mono text-slate-200 block mt-1">{activeCriticalCount}</span>
                    <p className="text-[10px] text-slate-500 mt-1">Direct threats to inventory databases and customs clearance gateways.</p>
                  </div>
                </div>

                <div className="bg-orange-950/20 border border-orange-900/60 p-4 rounded-xl flex items-start gap-3">
                  <AlertOctagon className="text-orange-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-xs font-semibold text-orange-300 font-mono">Active High-Risks</h4>
                    <span className="text-2xl font-black font-mono text-slate-200 block mt-1">{activeHighCount}</span>
                    <p className="text-[10px] text-slate-500 mt-1">Requires immediate software updates or TLS envelope wraps.</p>
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/60 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-300 font-mono">Mitigation Rate</h4>
                    <span className="text-2xl font-black font-mono text-slate-200 block mt-1">
                      {totalThreatsCount > 0 ? Math.round((mitigatedCount / totalThreatsCount) * 100) : 0}%
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Vulnerabilities formally closed via cryptographic controls.</p>
                  </div>
                </div>
              </div>

              {/* Bento Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Methodology Breakdown */}
                <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 border-b border-slate-900 pb-2 flex items-center gap-2">
                    <HelpCircle size={15} className="text-emerald-500" />
                    Security Framework Explainer
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    <p className="text-slate-400 leading-relaxed">
                      We utilize the industry-standard <strong>STRIDE</strong> framework developed by Microsoft to identify threat categories, and rate remediation urgency using <strong>DREAD</strong> composite formulas:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-slate-900/80 p-2.5 rounded border border-slate-850">
                        <strong className="text-slate-300 block mb-0.5 text-[10px] uppercase font-black text-rose-400">S.T.R.I.D.E</strong>
                        <ul className="text-slate-400 space-y-0.5">
                          <li>• Spoofing</li>
                          <li>• Tampering</li>
                          <li>• Repudiation</li>
                          <li>• Info Disclosure</li>
                          <li>• Denial of Service</li>
                          <li>• Privilege Elevation</li>
                        </ul>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded border border-slate-850">
                        <strong className="text-slate-300 block mb-0.5 text-[10px] uppercase font-black text-emerald-400">D.R.E.A.D Matrix</strong>
                        <ul className="text-slate-400 space-y-0.5">
                          <li>• Damage Potential</li>
                          <li>• Reproducibility</li>
                          <li>• Exploitability</li>
                          <li>• Affected Users</li>
                          <li>• Discoverability</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Critical Threats Panel */}
                <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 border-b border-slate-900 pb-2 flex items-center gap-2">
                      <AlertOctagon size={15} className="text-rose-500" />
                      Priority Audit Actions
                    </h3>
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {threats.filter(t => t.severity === "Critical" && t.status !== "Mitigated").map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded border border-slate-850 hover:border-slate-750 transition-colors cursor-pointer"
                          onClick={() => {
                            setFocusedThreat(t);
                          }}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-[9px] font-mono bg-red-950 text-red-400 px-1 py-0.5 rounded border border-red-900">
                              {t.id}
                            </span>
                            <span className="text-xs text-slate-200 truncate">{t.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-red-400 font-bold">Critical</span>
                        </div>
                      ))}
                      {threats.filter(t => t.severity === "Critical" && t.status !== "Mitigated").length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-6 font-mono">No active critical threats! All high-severity targets mitigated.</p>
                      )}
                    </div>
                  </div>

                  <button
                    id="goto-registry-btn"
                    onClick={() => setActiveTab("registry")}
                    className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-semibold font-mono tracking-wide transition-colors cursor-pointer"
                  >
                    VIEW ALL THREATS IN REGISTRY
                  </button>
                </div>
              </div>

              {/* Subsystem Component Risks Card */}
              <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-xl space-y-4">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 border-b border-slate-900 pb-2">
                  System Subsystem Vulnerability Map
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  {DFD_NODES.map((node) => {
                    const nodeThreats = threats.filter(t => t.impactedComponent === node.label);
                    const unmitigatedNodeThreats = nodeThreats.filter(t => t.status !== "Mitigated");
                    
                    return (
                      <div
                        key={node.id}
                        className="bg-slate-950/60 p-4 border border-slate-850 hover:border-slate-750 rounded-xl space-y-2 cursor-pointer transition-all"
                        onClick={() => {
                          setSelectedComponent(node.label);
                          setActiveTab("registry");
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-bold text-slate-500">{node.type}</span>
                          <span className={`w-2 h-2 rounded-full ${unmitigatedNodeThreats.length > 0 ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}></span>
                        </div>
                        <h4 className="font-semibold text-slate-200 truncate leading-snug">{node.label}</h4>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Threats logged:</span>
                          <span className="font-bold text-slate-200">{nodeThreats.length}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Unmitigated:</span>
                          <span className={`font-bold ${unmitigatedNodeThreats.length > 0 ? "text-red-400" : "text-emerald-400"}`}>
                            {unmitigatedNodeThreats.length}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DATA FLOW DIAGRAM (DFD) */}
          {activeTab === "dfd" && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
                <h2 className="text-sm font-semibold text-slate-100">Interactive Trust Boundary Analysis</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Data Flow Diagrams (DFDs) define trust boundaries where privilege levels shift. Clicking any component in the visual graph highlights the microservice boundary, detail specifications, and dynamically isolates its cataloged threats.
                </p>
              </div>

              <InteractiveDfd
                selectedComponent={selectedComponent}
                onSelectComponent={(compName) => setSelectedComponent(compName)}
              />
            </div>
          )}

          {/* TAB 3: THREAT REGISTRY */}
          {activeTab === "registry" && (
            <div className="space-y-6">
              
              {/* Complex Multi-Variable Filter Interface */}
              <div className="border border-slate-900 bg-slate-950/40 p-4 rounded-xl space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search input */}
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                    <input
                      id="threat-search-bar"
                      type="text"
                      placeholder="Search threat title, ID, descriptions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>

                  {/* Dynamic Indicators / Clear Filters button */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    {(selectedComponent || selectedStride !== "All" || selectedSeverity !== "All" || selectedStatus !== "All" || searchQuery) && (
                      <button
                        id="clear-all-filters-btn"
                        onClick={() => {
                          setSelectedComponent(null);
                          setSelectedStride("All");
                          setSelectedSeverity("All");
                          setSelectedStatus("All");
                          setSearchQuery("");
                        }}
                        className="text-xs font-mono font-bold text-red-400 hover:text-red-300 transition-colors px-2 py-1 bg-red-950/40 border border-red-900/60 rounded"
                      >
                        RESET FILTERS
                      </button>
                    )}
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg">
                      Showing <strong className="text-slate-300">{filteredThreats.length}</strong> of <strong className="text-slate-300">{totalThreatsCount}</strong> Vulnerabilities
                    </span>
                  </div>
                </div>

                {/* Filter dropdown selections */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  {/* Component Filter */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold">Component Node</label>
                    <select
                      id="filter-dropdown-component"
                      value={selectedComponent || ""}
                      onChange={(e) => setSelectedComponent(e.target.value || null)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 cursor-pointer focus:outline-none"
                    >
                      <option value="">All Components</option>
                      {DFD_NODES.map((n) => (
                        <option key={n.id} value={n.label}>{n.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* STRIDE Filter */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold">STRIDE Category</label>
                    <select
                      id="filter-dropdown-stride"
                      value={selectedStride}
                      onChange={(e) => setSelectedStride(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 cursor-pointer focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      <option value="Spoofing">Spoofing</option>
                      <option value="Tampering">Tampering</option>
                      <option value="Repudiation">Repudiation</option>
                      <option value="Information Disclosure">Information Disclosure</option>
                      <option value="Denial of Service">Denial of Service</option>
                      <option value="Elevation of Privilege">Elevation of Privilege</option>
                    </select>
                  </div>

                  {/* Severity Filter */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold">Severity Rating</label>
                    <select
                      id="filter-dropdown-severity"
                      value={selectedSeverity}
                      onChange={(e) => setSelectedSeverity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 cursor-pointer focus:outline-none"
                    >
                      <option value="All">All Severities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold">Audit Status</label>
                    <select
                      id="filter-dropdown-status"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 cursor-pointer focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="Mitigated">Mitigated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Threat Interactive Table List */}
              <div className="border border-slate-900 bg-slate-950/20 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-900 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Threat & Target Component</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3 text-center">DREAD</th>
                        <th className="px-5 py-3 text-center">Severity</th>
                        <th className="px-5 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-900/60 font-mono">
                      {filteredThreats.map((t) => {
                        const score = ((t.dread.damage + t.dread.reproducibility + t.dread.exploitability + t.dread.affectedUsers + t.dread.discoverability) / 5).toFixed(1);
                        return (
                          <tr
                            key={t.id}
                            id={`threat-row-${t.id}`}
                            className="hover:bg-slate-900/30 transition-colors cursor-pointer"
                            onClick={() => {
                              setFocusedThreat(t);
                            }}
                          >
                            {/* Threat ID */}
                            <td className="px-5 py-4 font-bold text-slate-400">
                              {t.id}
                            </td>

                            {/* Title & Component */}
                            <td className="px-5 py-4 max-w-[320px]">
                              <div className="font-semibold text-slate-200 truncate leading-snug font-sans">{t.title}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide truncate">{t.impactedComponent}</div>
                            </td>

                            {/* Category */}
                            <td className="px-5 py-4">
                              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded">
                                {t.category}
                              </span>
                            </td>

                            {/* DREAD score */}
                            <td className="px-5 py-4 text-center font-bold text-slate-200">
                              {score}
                            </td>

                            {/* Severity Badge */}
                            <td className="px-5 py-4 text-center">
                              <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                                t.severity === "Critical" ? "bg-rose-950/80 border-rose-800 text-rose-400" :
                                t.severity === "High" ? "bg-orange-950/80 border-orange-900 text-orange-400" :
                                t.severity === "Medium" ? "bg-amber-950/80 border-amber-900 text-amber-400" : "bg-blue-950/80 border-blue-900 text-blue-400"
                              }`}>
                                {t.severity}
                              </span>
                            </td>

                            {/* Status Badge */}
                            <td className="px-5 py-4 text-center">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                t.status === "Mitigated" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                t.status === "In-Progress" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}>
                                {t.status === "Mitigated" ? "🟢 MITIGATED" : t.status === "In-Progress" ? "🟡 IN-PROG" : "🔴 OPEN"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredThreats.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-slate-500 font-sans">
                            No threat matches found matching active query criteria. Modify search strings or drop-down filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: AI SECURITY ANALYST */}
          {activeTab === "ai" && (
            <AiAssistant
              activeThreatModel={threats}
              onAddThreats={(newThreats) => handleAddThreats(newThreats)}
            />
          )}

          {/* TAB 5: COMPLIANCE REPORT EXPORT */}
          {activeTab === "report" && (
            <ExportReport threats={threats} />
          )}

          {/* TAB 6: M.SC. APPLICATIONS PORTFOLIO */}
          {activeTab === "portfolio" && (
            <MscPortfolio />
          )}

        </main>

      </div>

      {/* Global Interactive Threat Details & DREAD Slider Calculator Modal */}
      {focusedThreat && (
        <ThreatDetailsModal
          threat={focusedThreat}
          onClose={() => setFocusedThreat(null)}
          onUpdateThreat={(updated) => handleUpdateThreat(updated)}
        />
      )}

      {/* Humble Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-[10px] font-mono text-slate-600 bg-slate-950/60 flex flex-col gap-1 items-center">
        <div>APEX AUTOMOTIVE IMPORTS DIGITAL PLATFORM THREAT MODELING AUDIT SUITE</div>
        <div>Complies with ISO/SAE 21434 Road Vehicles Cybersecurity Engineering standards & STRIDE frameworks.</div>
      </footer>

    </div>
  );
}
