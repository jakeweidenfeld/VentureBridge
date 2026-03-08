"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface FundMatch {
  matchId: string;
  vcProfileId: string;
  fundName: string;
  score: number;
  stage: string;
  checkSize: string;
  geography: string;
  thesis: string;
  keywords: string[];
  thesisScore: number;
  sectorScore: number;
  stageScore: number;
  geoScore: number;
  tractionScore: number;
}

function scoreColor(pct: number) {
  return pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<FundMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("All Stages");
  const [sector, setSector] = useState("All Sectors");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get startup_profiles.id for this user
      const { data: sp } = await supabase
        .from("startup_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!sp) { setLoading(false); return; }

      // Fetch matches + joined vc_profiles
      const { data } = await supabase
        .from("matches")
        .select(`
          id,
          overall_score,
          thesis_score,
          sector_score,
          stage_score,
          geography_score,
          traction_score,
          vc_profiles (
            id,
            fund_name,
            fund_size,
            hq_city,
            investment_stages,
            typical_check_size,
            primary_regions,
            thesis_statement,
            thesis_keywords
          )
        `)
        .eq("startup_id", sp.id)
        .eq("is_active", true)
        .eq("startup_dismissed", false)
        .order("overall_score", { ascending: false });

      if (data) {
        const mapped: FundMatch[] = data
          .filter(m => m.vc_profiles)
          .map(m => {
            const vc = m.vc_profiles as Record<string, unknown>;
            const regions = (vc.primary_regions as string[] | null) ?? [];
            const stages  = (vc.investment_stages as string[] | null) ?? [];
            return {
              matchId:       m.id as string,
              vcProfileId:   vc.id as string,
              fundName:      (vc.fund_name as string) ?? "Unknown Fund",
              score:         Math.round(m.overall_score as number),
              stage:         stages[0] ?? "—",
              checkSize:     (vc.typical_check_size as string) ?? "—",
              geography:     regions.join(", ") || "—",
              thesis:        (vc.thesis_statement as string) ?? "",
              keywords:      (vc.thesis_keywords as string[]) ?? [],
              thesisScore:   Math.round((m.thesis_score   as number) ?? 0),
              sectorScore:   Math.round((m.sector_score   as number) ?? 0),
              stageScore:    Math.round((m.stage_score    as number) ?? 0),
              geoScore:      Math.round((m.geography_score as number) ?? 0),
              tractionScore: Math.round((m.traction_score  as number) ?? 0),
            };
          });
        setMatches(mapped);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = matches.filter((m) => {
    const matchesSearch = !search || m.fundName.toLowerCase().includes(search.toLowerCase());
    const matchesStage  = stage === "All Stages"   || m.stage.toLowerCase().includes(stage.toLowerCase());
    const matchesSector = sector === "All Sectors" || m.keywords.some(k => k.toLowerCase().includes(sector.toLowerCase()));
    return matchesSearch && matchesStage && matchesSector;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Fund Matches</div>
          <div className="page-subtitle">Matched based on your stage, sector, and traction</div>
        </div>
        <a href="/pitch" className="vb-btn-primary text-sm">Submit Pitch →</a>
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 flex-wrap px-10 py-5 border-b border-vb-border bg-vb-navy">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-vb-muted font-mono uppercase tracking-[1px]">Search</span>
          <input
            type="text"
            placeholder="Search funds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="vb-input w-52"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-vb-muted font-mono uppercase tracking-[1px]">Stage</span>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="vb-select">
            <option>All Stages</option>
            <option>Pre-Seed</option>
            <option>Seed</option>
            <option>Series A</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-vb-muted font-mono uppercase tracking-[1px]">Sector</span>
          <select value={sector} onChange={(e) => setSector(e.target.value)} className="vb-select">
            <option>All Sectors</option>
            <option>AI-first</option>
            <option>Fintech</option>
            <option>Deep Tech</option>
            <option>SaaS</option>
            <option>Climate Tech</option>
            <option>Bio / Health</option>
          </select>
        </div>
      </div>

      {/* Match Grid */}
      <div className="px-10 py-8">
        {loading ? (
          <div className="text-center py-20 text-vb-muted">
            <div className="font-mono text-sm animate-pulse">Loading matches…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-vb-muted">
            {matches.length === 0 ? (
              <>
                <div className="text-4xl mb-4">⬡</div>
                <div className="text-lg font-semibold mb-2 text-vb-text">No matches yet</div>
                <div className="text-sm max-w-sm mx-auto leading-relaxed">
                  Save and publish your{" "}
                  <a href="/profile" className="text-vb-blue hover:underline">startup profile</a>{" "}
                  to generate matches with VCs on the platform.
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4">⬡</div>
                <div className="text-lg font-semibold mb-2">No results for these filters</div>
                <div className="text-sm">Try adjusting your search or filters</div>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((fund) => (
              <div
                key={fund.matchId}
                className="bg-vb-panel border border-vb-border rounded-lg p-5 cursor-pointer hover:border-vb-blue hover:-translate-y-px transition-all relative overflow-hidden"
              >
                {/* Left accent bar based on score */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ background: scoreColor(fund.score) }}
                />

                <div className="flex justify-between items-start mb-3">
                  <div className="font-bold text-[15px] text-vb-text">{fund.fundName}</div>
                  <div className="font-display text-[28px]" style={{ color: scoreColor(fund.score) }}>
                    {fund.score}%
                  </div>
                </div>

                <div className="text-[13px] text-vb-text-secondary mb-2.5">
                  {fund.stage} · {fund.checkSize}
                  {fund.geography && fund.geography !== "—" ? ` · ${fund.geography.split(",")[0].replace(/[🇺🇸🌍🇬🇧🇮🇳🇪🇺🇸🇬🇮🇱🌎]/g, "").trim()}` : ""}
                </div>

                {fund.thesis && (
                  <p className="text-[13px] text-vb-text-secondary mb-3 leading-[1.5] line-clamp-2">
                    {fund.thesis}
                  </p>
                )}

                {/* Score breakdown */}
                <div className="flex flex-col gap-1.5 my-3">
                  {[
                    { label: "Thesis",    pct: fund.thesisScore   },
                    { label: "Sector",    pct: fund.sectorScore   },
                    { label: "Stage",     pct: fund.stageScore    },
                    { label: "Geography", pct: fund.geoScore      },
                    { label: "Traction",  pct: fund.tractionScore },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className="font-mono text-[9px] tracking-[1px] text-vb-muted uppercase w-20 flex-shrink-0">{row.label}</span>
                      <div className="flex-1 h-[5px] bg-vb-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${row.pct}%`, background: scoreColor(row.pct) }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-vb-muted w-7 text-right">{row.pct}%</span>
                    </div>
                  ))}
                </div>

                {/* Keywords */}
                {fund.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {fund.keywords.slice(0, 4).map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 bg-vb-blue/10 border border-vb-blue/20 rounded text-[11px] text-vb-blue-bright font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <a
                  href={`/pitch?vc=${fund.vcProfileId}`}
                  className="block w-full mt-4 py-2 bg-vb-blue/10 border border-vb-blue/25 text-vb-blue-bright text-[13px] font-semibold rounded hover:bg-vb-blue hover:text-white transition-all text-center"
                >
                  Submit Pitch →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
