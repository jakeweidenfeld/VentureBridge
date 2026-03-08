"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";

interface InboundMatch {
  matchId: string;
  startupId: string;   // startup_profiles.id
  companyName: string;
  sector: string;
  stage: string;
  raiseTarget: string;
  currentArr: string;
  score: number;
  pitchStatus: string | null; // null = no pitch yet
}

function formatCents(cents: number | null | undefined): string {
  if (!cents) return "—";
  const n = cents / 100;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function VcInboxPage() {
  const [matches, setMatches]  = useState<InboundMatch[]>([]);
  const [loading, setLoading]  = useState(true);
  const [filterSector,   setFilterSector]   = useState("All Sectors");
  const [filterStage,    setFilterStage]    = useState("All");
  const [filterMinScore, setFilterMinScore] = useState("Any");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get vc_profiles.id for this user
      const { data: vp } = await supabase
        .from("vc_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!vp) { setLoading(false); return; }

      // Fetch matches + joined startup_profiles
      const { data } = await supabase
        .from("matches")
        .select(`
          id,
          overall_score,
          startup_profiles (
            id,
            company_name,
            primary_sector,
            current_stage,
            raise_target,
            current_arr
          )
        `)
        .eq("vc_id", vp.id)
        .eq("is_active", true)
        .eq("vc_dismissed", false)
        .order("overall_score", { ascending: false });

      if (data) {
        // Also fetch any existing pitches to get status
        const startupIds = data.map(m => {
          const sp = m.startup_profiles as Record<string, unknown> | null;
          return sp?.id as string | undefined;
        }).filter(Boolean) as string[];

        let pitchStatusMap: Record<string, string> = {};
        if (startupIds.length > 0) {
          const { data: pitches } = await supabase
            .from("pitches")
            .select("startup_id, status")
            .eq("vc_id", vp.id)
            .in("startup_id", startupIds);
          if (pitches) {
            pitchStatusMap = Object.fromEntries(pitches.map(p => [p.startup_id, p.status]));
          }
        }

        const mapped: InboundMatch[] = data
          .filter(m => m.startup_profiles)
          .map(m => {
            const sp = m.startup_profiles as Record<string, unknown>;
            const spId = sp.id as string;
            return {
              matchId:     m.id as string,
              startupId:   spId,
              companyName: (sp.company_name as string) ?? "Unknown Startup",
              sector:      (sp.primary_sector as string) ?? "—",
              stage:       (sp.current_stage as string)?.replace(/-/g, " ")
                             .replace(/\b\w/g, c => c.toUpperCase()) ?? "—",
              raiseTarget: formatCents(sp.raise_target as number | null),
              currentArr:  formatCents(sp.current_arr  as number | null),
              score:       Math.round(m.overall_score as number),
              pitchStatus: pitchStatusMap[spId] ?? null,
            };
          });
        setMatches(mapped);
      }
      setLoading(false);
    })();
  }, []);

  const minScoreThreshold = filterMinScore === "70%+" ? 70 : filterMinScore === "80%+" ? 80 : filterMinScore === "90%+" ? 90 : 0;

  const filtered = matches.filter(m => {
    if (filterSector !== "All Sectors" && !m.sector.toLowerCase().includes(filterSector.toLowerCase())) return false;
    if (filterStage  !== "All"         && !m.stage.toLowerCase().includes(filterStage.toLowerCase()))   return false;
    if (m.score < minScoreThreshold) return false;
    return true;
  });

  const newCount = matches.filter(m => !m.pitchStatus).length;

  function pitchBadge(status: string | null) {
    if (!status) return <Badge variant="green">New</Badge>;
    const map: Record<string, { label: string; variant: "blue" | "amber" | "red" | "green" | "purple" }> = {
      matched:       { label: "Matched",    variant: "green"  },
      intro_sent:    { label: "Intro Sent", variant: "blue"   },
      under_review:  { label: "In Review",  variant: "amber"  },
      partner_call:  { label: "Partner ☎",  variant: "purple" },
      term_sheet:    { label: "Term Sheet", variant: "green"  },
      closed:        { label: "Closed",     variant: "green"  },
      passed:        { label: "Passed",     variant: "red"    },
    };
    const b = map[status] ?? { label: status, variant: "blue" as const };
    return <Badge variant={b.variant}>{b.label}</Badge>;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Deal Inbox</div>
          <div className="page-subtitle">Inbound pitches matching your fund thesis</div>
        </div>
        {newCount > 0 && <Badge variant="amber">● {newCount} NEW</Badge>}
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 px-10 py-5 border-b border-vb-border bg-vb-navy">
        {[
          { label: "Sector",    options: ["All Sectors", "AI / ML", "SaaS", "Fintech", "Deep Tech", "Healthtech", "Climate Tech"], value: filterSector, set: setFilterSector },
          { label: "Stage",     options: ["All", "Pre-Seed", "Seed", "Series A"], value: filterStage, set: setFilterStage },
          { label: "Min Match", options: ["Any", "70%+", "80%+", "90%+"], value: filterMinScore, set: setFilterMinScore },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="text-[12px] text-vb-muted font-mono uppercase tracking-[1px]">{f.label}</span>
            <select value={f.value} onChange={e => f.set(e.target.value)} className="vb-select">
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="px-10 py-8">
        {loading ? (
          <div className="text-center py-20 text-vb-muted font-mono text-sm animate-pulse">Loading deal inbox…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-vb-muted">
            <div className="text-4xl mb-4">⬡</div>
            <div className="text-lg font-semibold mb-2 text-vb-text">
              {matches.length === 0 ? "No matches yet" : "No results for these filters"}
            </div>
            <div className="text-sm max-w-sm mx-auto leading-relaxed">
              {matches.length === 0
                ? <>Save your <a href="/vc/thesis" className="text-vb-amber hover:underline">fund thesis</a> to start matching with startups on the platform.</>
                : "Try adjusting your filters to see more deals."}
            </div>
          </div>
        ) : (
          <div className="vb-table-wrap">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="vb-th">Startup</th>
                  <th className="vb-th">Sector</th>
                  <th className="vb-th">Raise</th>
                  <th className="vb-th">ARR</th>
                  <th className="vb-th">Match</th>
                  <th className="vb-th">Status</th>
                  <th className="vb-th">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.matchId} className="hover:bg-vb-blue/[0.04] transition-colors cursor-pointer">
                    <td className="vb-td font-semibold">{row.companyName}</td>
                    <td className="vb-td text-vb-text-secondary">{row.sector}</td>
                    <td className="vb-td font-mono text-[13px]">{row.raiseTarget}</td>
                    <td className="vb-td font-mono text-[13px]">{row.currentArr}</td>
                    <td className="vb-td">
                      <span
                        className="font-display text-[20px]"
                        style={{ color: row.score >= 80 ? "#10b981" : "#f59e0b" }}
                      >
                        {row.score}%
                      </span>
                    </td>
                    <td className="vb-td">{pitchBadge(row.pitchStatus)}</td>
                    <td className="vb-td">
                      <div className="flex gap-2">
                        <button className="text-[12px] font-mono text-vb-blue hover:underline">Review →</button>
                        <button className="text-[12px] font-mono text-vb-muted hover:text-vb-red">Pass</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
