"use client";

import { useState } from "react";

const STARTUPS = [
  { id: 1, name: "Meridian AI", sector: "AI / ML", stage: "Seed", arr: "$480K", growth: "18%", customers: 34, hq: "San Francisco, CA", score: 94, tags: ["B2B SaaS", "Infrastructure", "AI-first"] },
  { id: 2, name: "Stackform", sector: "SaaS", stage: "Seed", arr: "$720K", growth: "22%", customers: 58, hq: "New York, NY", score: 87, tags: ["DevOps", "Enterprise", "Cloud"] },
  { id: 3, name: "Neurova", sector: "AI / ML", stage: "Pre-Seed", arr: "$220K", growth: "31%", customers: 12, hq: "Boston, MA", score: 82, tags: ["Healthcare AI", "LLM", "Clinical"] },
  { id: 4, name: "FlowBridge", sector: "Fintech", stage: "Seed", arr: "$560K", growth: "14%", customers: 91, hq: "Austin, TX", score: 76, tags: ["Payments", "B2B", "API-first"] },
  { id: 5, name: "Phalanx Security", sector: "Deep Tech", stage: "Seed", arr: "$300K", growth: "27%", customers: 20, hq: "Washington, DC", score: 79, tags: ["Cybersecurity", "Zero-trust", "Enterprise"] },
  { id: 6, name: "QuantumLoop", sector: "Deep Tech", stage: "Pre-Seed", arr: "$150K", growth: "42%", customers: 6, hq: "San Francisco, CA", score: 73, tags: ["Quantum Computing", "Deep Tech", "Research"] },
];

export default function VcBrowsePage() {
  const [search, setSearch] = useState("");

  const filtered = STARTUPS.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.sector.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Browse Startups</div>
          <div className="page-subtitle">Discover companies across the VentureBridge network</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 px-10 py-5 border-b border-vb-border bg-vb-navy flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-vb-muted font-mono uppercase tracking-[1px]">Search</span>
          <input
            type="text"
            placeholder="Search startups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="vb-input w-52"
          />
        </div>
        {[
          { label: "Stage", opts: ["All", "Seed", "Pre-Seed"] },
          { label: "Sector", opts: ["All", "AI / ML", "SaaS", "Fintech", "Deep Tech"] },
          { label: "ARR", opts: ["Any", "$0–$100K", "$100K–$1M", "$1M+"] },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="text-[12px] text-vb-muted font-mono uppercase tracking-[1px]">{f.label}</span>
            <select className="vb-select">
              {f.opts.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="px-10 py-8">
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-vb-panel border border-vb-border rounded-lg p-5 cursor-pointer hover:border-vb-blue hover:-translate-y-px transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-[15px] text-vb-text">{s.name}</div>
                  <div className="text-[13px] text-vb-text-secondary mt-0.5">{s.sector} · {s.stage}</div>
                </div>
                <div
                  className="font-display text-[22px]"
                  style={{ color: s.score >= 85 ? "#10b981" : "#f59e0b" }}
                >
                  {s.score}%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 bg-vb-navy rounded p-3">
                {[
                  { label: "ARR", value: s.arr },
                  { label: "Growth", value: s.growth },
                  { label: "Customers", value: s.customers },
                ].map((kpi) => (
                  <div key={kpi.label} className="text-center">
                    <div className="font-mono text-[9px] text-vb-muted uppercase tracking-[1px] mb-1">{kpi.label}</div>
                    <div className="font-display text-[18px] text-vb-text">{kpi.value}</div>
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-1.5 bg-vb-amber/[0.08] border border-vb-amber/20 rounded px-2.5 py-0.5 text-[11px] text-vb-amber font-mono mb-3">
                📍 {s.hq}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {s.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-vb-subtle/30 border border-vb-border rounded text-[11px] text-vb-text-secondary font-mono">
                    {tag}
                  </span>
                ))}
              </div>

              <button className="w-full py-1.5 bg-vb-blue/10 border border-vb-blue/25 text-vb-blue-bright text-[13px] font-semibold rounded hover:bg-vb-blue hover:text-white transition-all">
                View Profile →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
