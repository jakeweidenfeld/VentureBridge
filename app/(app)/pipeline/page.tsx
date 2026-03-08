"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";

type BadgeVariant = "blue" | "green" | "amber" | "red" | "purple" | "gray";

interface PipelineEntry {
  id: number;
  fund: string;
  partner: string;
  stage: string;
  check: string;
  status: string;
  statusVariant: BadgeVariant;
  lastUpdate: string;
}

const PIPELINE: PipelineEntry[] = [
  { id: 1, fund: "Andreessen Horowitz", partner: "Marc Andreessen", stage: "Seed", check: "$5M", status: "Under Review", statusVariant: "amber", lastUpdate: "1d ago" },
  { id: 2, fund: "GV (Google Ventures)", partner: "Dave Munichiello", stage: "Seed", check: "$3M", status: "Intro Sent", statusVariant: "blue", lastUpdate: "5h ago" },
  { id: 3, fund: "Accel Partners", partner: "Rich Wong", stage: "Seed", check: "$4M", status: "Partner Call", statusVariant: "amber", lastUpdate: "2d ago" },
  { id: 4, fund: "Sequoia Capital", partner: "Roelof Botha", stage: "Seed", check: "$2.5M", status: "Matched", statusVariant: "purple", lastUpdate: "2d ago" },
  { id: 5, fund: "Benchmark Capital", partner: "Bill Gurley", stage: "Seed", check: "$3.5M", status: "Intro Sent", statusVariant: "blue", lastUpdate: "3d ago" },
  { id: 6, fund: "Kleiner Perkins", partner: "Mamoon Hamid", stage: "Seed", check: "$2M", status: "Term Sheet", statusVariant: "green", lastUpdate: "4d ago" },
  { id: 7, fund: "Founders Fund", partner: "Peter Thiel", stage: "Seed", check: "$1M", status: "Passed", statusVariant: "red", lastUpdate: "5d ago" },
  { id: 8, fund: "Greylock Partners", partner: "Reid Hoffman", stage: "Seed", check: "$3M", status: "Under Review", statusVariant: "amber", lastUpdate: "3d ago" },
];

const ALL_STATUSES = ["All", "Matched", "Intro Sent", "Under Review", "Partner Call", "Term Sheet", "Passed"];

export default function PipelinePage() {
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = PIPELINE.filter(
    (p) => statusFilter === "All" || p.status === statusFilter
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">My Pipeline</div>
          <div className="page-subtitle">Track every pitch, intro, and term sheet</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 px-10 py-5 border-b border-vb-border bg-vb-navy">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-vb-muted font-mono uppercase tracking-[1px]">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="vb-select"
          >
            {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="px-10 py-8">
        <div className="vb-table-wrap">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="vb-th">Fund</th>
                <th className="vb-th">Partner</th>
                <th className="vb-th">Stage</th>
                <th className="vb-th">Check</th>
                <th className="vb-th">Status</th>
                <th className="vb-th">Last Update</th>
                <th className="vb-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-vb-blue/[0.04] transition-colors cursor-pointer">
                  <td className="vb-td font-semibold">{row.fund}</td>
                  <td className="vb-td text-vb-text-secondary">{row.partner}</td>
                  <td className="vb-td">
                    <span className="vb-badge vb-badge-gray">{row.stage}</span>
                  </td>
                  <td className="vb-td font-mono text-[13px]">{row.check}</td>
                  <td className="vb-td">
                    <Badge variant={row.statusVariant}>{row.status}</Badge>
                  </td>
                  <td className="vb-td font-mono text-[11px] text-vb-muted">{row.lastUpdate}</td>
                  <td className="vb-td">
                    <button className="text-[12px] text-vb-blue hover:underline font-mono">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-vb-muted">
              <div className="text-3xl mb-3">◇</div>
              <div className="text-sm">No entries for this filter</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
