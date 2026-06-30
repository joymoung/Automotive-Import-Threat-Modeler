import React, { useState } from "react";
import { DfdNode, DfdLink, DFD_NODES, DFD_LINKS } from "../types";
import { Shield, Database, Cpu, Globe, Server, User, Link2, HelpCircle } from "lucide-react";

interface InteractiveDfdProps {
  selectedComponent: string | null;
  onSelectComponent: (componentName: string | null) => void;
}

export default function InteractiveDfd({
  selectedComponent,
  onSelectComponent,
}: InteractiveDfdProps) {
  const [hoveredNode, setHoveredNode] = useState<DfdNode | null>(null);

  // Map coordinates for nodes in our diagram layout
  const coords: Record<string, { x: number; y: number }> = {
    portal: { x: 80, y: 180 },
    gateway: { x: 260, y: 180 },
    finance: { x: 260, y: 60 },
    logistics: { x: 260, y: 300 },
    inventory: { x: 480, y: 180 },
    telematics: { x: 480, y: 300 },
    db_core: { x: 700, y: 180 },
    db_secure: { x: 700, y: 60 },
  };

  const getNodeIcon = (id: string, type: string) => {
    const size = 18;
    const style = "text-slate-400";
    if (id === "portal") return <User size={size} className={style} />;
    if (id === "gateway") return <Server size={size} className={style} />;
    if (id === "logistics") return <Globe size={size} className={style} />;
    if (id === "telematics") return <Cpu size={size} className={style} />;
    if (id === "inventory") return <Shield size={size} className={style} />;
    if (id === "finance") return <Shield size={size} className={style} />;
    if (type === "datastore") return <Database size={size} className={style} />;
    return <HelpCircle size={size} className={style} />;
  };

  const getDfdNodeStyle = (node: DfdNode) => {
    const isSelected = selectedComponent === node.label;
    const isHovered = hoveredNode?.id === node.id;

    let borderClass = "border-slate-700 bg-slate-900/80";
    if (isSelected) {
      borderClass = "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/40";
    } else if (isHovered) {
      borderClass = "border-slate-500 bg-slate-800/80 shadow-md";
    }

    let shapeClass = "rounded-lg border-2";
    if (node.type === "interactor") {
      shapeClass = "rounded-md border-2 border-dashed";
    } else if (node.type === "datastore") {
      shapeClass = "border-y-2 border-x-4 rounded-none";
    }

    return `${shapeClass} ${borderClass} transition-all duration-200 cursor-pointer p-3 flex flex-col justify-between w-[150px] h-[85px] shadow-sm select-none`;
  };

  const activeNode = DFD_NODES.find(n => n.label === selectedComponent);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="dfd-container">
      {/* Visual Canvas Area */}
      <div className="lg:col-span-3 border border-slate-800 rounded-xl bg-slate-950/60 p-4 relative overflow-hidden flex flex-col min-h-[460px]">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300 font-mono tracking-wider">APEX IMPORTS: DATA FLOW DIAGRAM (DFD)</span>
          </div>
          <div className="flex gap-4 text-[10px] font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-900 border-2 border-dashed border-slate-600 rounded"></span>
              <span>External Entity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-900 border-2 border-slate-600 rounded"></span>
              <span>Process</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-900 border-y-2 border-x-4 border-slate-600"></span>
              <span>Data Store</span>
            </div>
          </div>
        </div>

        {/* SVG Drawing Canvas & HTML Node overlay */}
        <div className="relative flex-1 min-h-[380px] border border-slate-900 bg-slate-950 rounded-lg overflow-x-auto overflow-y-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>
          
          <svg className="absolute inset-0 w-[880px] h-[380px] pointer-events-none select-none z-0">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
            </defs>

            {/* Draw Links */}
            {DFD_LINKS.map((link) => {
              const start = coords[link.source];
              const end = coords[link.target];
              if (!start || !end) return null;

              // Adjust endpoints so arrows terminate neatly at edge of 150x85 box
              const dx = end.x - start.x;
              const dy = end.y - start.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const uX = dx / len;
              const uY = dy / len;

              // Nodes are 150px wide, 85px high
              // Compute exact intersection offset
              let startOffset = 0;
              let endOffset = 0;

              if (Math.abs(dx) > Math.abs(dy)) {
                // Left-to-right primarily
                startOffset = 75;
                endOffset = 80; // slightly early for arrow
              } else {
                // Up-to-down primarily
                startOffset = 42;
                endOffset = 50;
              }

              // Path starting and ending coords
              const x1 = start.x + 75 + uX * (startOffset);
              const y1 = start.y + 42 + uY * (42);
              const x2 = end.x + 75 - uX * (endOffset);
              const y2 = end.y + 42 - uY * (42);

              const isConnectedToSelected = 
                (activeNode && (link.source === activeNode.id || link.target === activeNode.id));

              return (
                <g key={link.id}>
                  {/* Subtle link path background */}
                  <path
                    d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2} ${x2} ${y2}`}
                    fill="none"
                    stroke={isConnectedToSelected ? "#10b981" : "#1e293b"}
                    strokeWidth={isConnectedToSelected ? "2.5" : "1.5"}
                    strokeDasharray={link.source === "logistics" || link.source === "telematics" ? "4 4" : "none"}
                    markerEnd={`url(#${isConnectedToSelected ? "arrow-active" : "arrow"})`}
                    className="transition-colors duration-200"
                  />
                  {/* Text labels on links */}
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    textAnchor="middle"
                    fill={isConnectedToSelected ? "#34d399" : "#64748b"}
                    fontSize="9"
                    fontFamily="monospace"
                    className="bg-slate-950 font-medium select-none shadow-sm transition-colors duration-200"
                  >
                    {link.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* HTML node overlay positioned exactly above the SVG */}
          <div className="absolute inset-0 w-[880px] h-[380px] pointer-events-auto z-10">
            {DFD_NODES.map((node) => {
              const pos = coords[node.id];
              if (!pos) return null;

              return (
                <div
                  key={node.id}
                  id={`dfd-node-${node.id}`}
                  style={{
                    position: "absolute",
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                  }}
                  className={getDfdNodeStyle(node)}
                  onClick={() => {
                    if (selectedComponent === node.label) {
                      onSelectComponent(null); // Clear filter
                    } else {
                      onSelectComponent(node.label);
                    }
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                      {node.type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {getNodeIcon(node.id, node.type)}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 leading-tight">
                    {node.label}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Component Details Panel (Right hand side) */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/40 p-5 flex flex-col h-full min-h-[460px]">
        {activeNode ? (
          <div className="flex flex-col justify-between h-full flex-1">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded bg-emerald-950/80 border border-emerald-900 text-emerald-400">
                  {getNodeIcon(activeNode.id, activeNode.type)}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{activeNode.label}</h3>
                  <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {activeNode.type}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-bold mb-1">Architecture Role</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  {activeNode.description}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-bold mb-1">Security Boundaries</h4>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  {activeNode.type === "interactor" && (
                    <>
                      <li>Subject to user spoofing & clickjacking</li>
                      <li>Vulnerable to session hijack / browser leaks</li>
                      <li>Client-side input tampered prior to TLS transport</li>
                    </>
                  )}
                  {activeNode.type === "process" && (
                    <>
                      <li>Direct exposure to denial of service floods</li>
                      <li>Insecure gateway mapping can lead to IDOR/BOLA</li>
                      <li>Requires strict authorization validations</li>
                    </>
                  )}
                  {activeNode.type === "datastore" && (
                    <>
                      <li>Highly sensitive; requires encryption at rest</li>
                      <li>Subject to injection tampering (SQLi, NoSQL)</li>
                      <li>Needs read-write auditing logs</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4">
              <button
                id="clear-dfd-filter-btn"
                onClick={() => onSelectComponent(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-mono font-medium transition-colors border border-slate-700"
              >
                Clear Diagram Filter
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center flex-1 py-12">
            <Link2 className="text-slate-600 mb-3" size={32} />
            <h4 className="text-xs font-semibold text-slate-400 font-mono">No Component Selected</h4>
            <p className="text-[11px] text-slate-500 mt-2 max-w-[200px] leading-relaxed">
              Click on any node in the Data Flow Diagram (DFD) to filter threats specifically mapping to that microservice or datastore.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
