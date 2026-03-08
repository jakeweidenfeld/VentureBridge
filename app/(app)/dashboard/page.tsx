"use client";

import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/Card";
import { useUser } from "@/components/providers/UserProvider";

const PIPELINE_STAGES = [
  { label: "Matched", count: 31, color: "#1d6ef5" },
  { label: "Intro Sent", count: 14, color: "#3b82f6" },
  { label: "Under Review", count: 8, color: "#f59e0b" },
  { label: "Partner Call", count: 3, color: "#b45309" },
  { label: "Term Sheet", count: 1, color: "#10b981" },
  { label: "Closed", count: 0, color: "#334155" },
];

const RECENT_ACTIVITY = [
  { initials: "A16", color: "rgba(29,110,245,.15)", textColor: "#1d6ef5", name: "Andreessen Horowitz", meta: "Viewed your pitch deck", badge: "Viewed" as const, badgeVariant: "blue" as const, time: "2h ago" },
  { initials: "GV", color: "rgba(16,185,129,.15)", textColor: "#10b981", name: "GV (Google Ventures)", meta: "Sent intro request", badge: "Intro" as const, badgeVariant: "green" as const, time: "5h ago" },
  { initials: "AC", color: "rgba(245,158,11,.15)", textColor: "#f59e0b", name: "Accel Partners", meta: "Moved to partner review", badge: "Review" as const, badgeVariant: "amber" as const, time: "1d ago" },
  { initials: "S2", color: "rgba(139,92,246,.15)", textColor: "#a78bfa", name: "Sequoia Capital", meta: "New match — 94% fit", badge: "Matched" as const, badgeVariant: "purple" as const, time: "2d ago" },
];

const PROFILE_STRENGTH = [
  { label: "Pitch Deck", pct: 100, status: "Complete", color: "#10b981", textColor: "text-vb-green" },
  { label: "Financials", pct: 100, status: "Complete", color: "#10b981", textColor: "text-vb-green" },
  { label: "Team Profiles", pct: 60, status: "In Progress", color: "#f59e0b", textColor: "text-vb-amber" },
  { label: "Traction Metrics", pct: 100, status: "Complete", color: "#10b981", textColor: "text-vb-green" },
  { label: "Use of Funds", pct: 0, status: "Missing", color: "#ef4444", textColor: "text-vb-red" },
];

export default function DashboardPage() {
  const user = useUser();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">{user.displayName} · {user.displaySubtitle}</div>
        </div>
        <Badge variant="green">● PROFILE LIVE</Badge>
      </div>

      {/* KPIs */}
      <div className="px-10 pt-8 pb-0">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <StatCard label="Match Score" value={<><span className="text-vb-blue">91</span><span className="text-[20px]">%</span></>} delta="↑ +7 this week" deltaType="up" />
          <StatCard label="Active Pitches" value="14" delta="3 awaiting review" deltaType="neutral" />
          <StatCard label="Investor Views" value="237" delta="↑ +42 last 7 days" deltaType="up" />
          <StatCard label="Intro Requests" value="6" delta="↑ 2 new today" deltaType="up" />
        </div>

        {/* Pipeline */}
        <div className="mb-4">
          <div className="font-mono text-[10px] tracking-[2px] text-vb-muted uppercase mb-2.5">
            Funding Pipeline
          </div>
          <div className="flex bg-vb-panel border border-vb-border rounded-lg overflow-hidden">
            {PIPELINE_STAGES.map((stage, i) => (
              <div
                key={stage.label}
                className={`flex-1 p-4 cursor-pointer hover:bg-vb-blue/[0.06] transition-colors ${i < PIPELINE_STAGES.length - 1 ? "border-r border-vb-border" : ""}`}
              >
                <div className="font-mono text-[11px] text-vb-muted uppercase tracking-[1px] mb-2.5">{stage.label}</div>
                <div className="font-display text-[28px] mb-1">{stage.count}</div>
                <div className="h-[3px] rounded-sm mt-2.5" style={{ background: stage.color }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity + Profile Strength */}
      <div className="px-10 pt-4 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {/* Recent Activity */}
          <div>
            <div className="font-mono text-[10px] tracking-[2px] text-vb-muted uppercase mb-2.5">Recent Activity</div>
            <div className="bg-vb-panel border border-vb-border rounded-lg overflow-hidden">
              {RECENT_ACTIVITY.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3.5 px-5 py-3.5 border-b border-vb-border/50 last:border-0 hover:bg-vb-blue/[0.04] transition-colors cursor-pointer"
                >
                  <div
                    className="w-[38px] h-[38px] rounded-md flex items-center justify-center font-display text-[16px] flex-shrink-0"
                    style={{ background: item.color, color: item.textColor }}
                  >
                    {item.initials}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-vb-text">{item.name}</div>
                    <div className="text-[13px] text-vb-text-secondary mt-0.5">{item.meta}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                    <div className="font-mono text-[11px] text-vb-muted mt-1">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Strength */}
          <div>
            <div className="font-mono text-[10px] tracking-[2px] text-vb-muted uppercase mb-2.5">Profile Strength</div>
            <div className="bg-vb-panel border border-vb-border rounded-lg p-5">
              <div className="flex flex-col gap-3.5">
                {PROFILE_STRENGTH.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span>{item.label}</span>
                      <span className={item.textColor}>{item.status}</span>
                    </div>
                    <div className="h-1 bg-vb-border rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-300"
                        style={{ width: `${item.pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="/profile"
                className="block w-full mt-5 px-6 py-2.5 bg-vb-blue text-white text-center text-sm font-semibold rounded hover:bg-vb-blue-bright transition-colors"
              >
                Complete Profile →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
