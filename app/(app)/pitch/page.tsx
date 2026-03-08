"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitPitch } from "@/app/actions/profile";

const STAGES = [
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed",     label: "Seed"     },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B" },
  { value: "series-c", label: "Series C" },
];

const SECTORS = [
  "AI / ML", "SaaS", "Fintech", "Healthtech", "Biotech",
  "E-commerce", "Marketplace", "Consumer", "Enterprise Software",
  "Developer Tools", "Infrastructure / Cloud", "Cybersecurity",
  "Deep Tech", "Hardware / Robotics", "Climate Tech", "EdTech",
  "PropTech", "Logistics / Supply Chain", "HR Tech", "LegalTech",
  "AdTech / MarTech", "Gaming", "Social / Media", "GovTech",
  "Defense Tech", "Space Tech", "AgriTech", "FoodTech",
  "InsurTech", "RegTech", "Mobility / Transport", "Web3 / Crypto", "Other",
];

interface TargetFund {
  vcProfileId: string;
  fundName: string;
  score: number;
}

function formatCents(cents: number | null | undefined): string {
  if (!cents) return "";
  return (cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function PitchForm() {
  const searchParams = useSearchParams();
  const preselectedVcId = searchParams.get("vc");

  const [companyName,      setCompanyName]      = useState("");
  const [stage,            setStage]            = useState("seed");
  const [sector,           setSector]           = useState("AI / ML");
  const [fundingAsk,       setFundingAsk]       = useState("");
  const [oneLiner,         setOneLiner]         = useState("");
  const [problemSolution,  setProblemSolution]  = useState("");
  const [currentArr,       setCurrentArr]       = useState("");
  const [momGrowth,        setMomGrowth]        = useState("");
  const [customerCount,    setCustomerCount]    = useState("");
  const [runwayMonths,     setRunwayMonths]     = useState("");
  const [deckLink,         setDeckLink]         = useState("");

  const [availableFunds,  setAvailableFunds]   = useState<TargetFund[]>([]);
  const [selectedFundIds, setSelectedFundIds]  = useState<Set<string>>(new Set());

  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: sp } = await supabase
        .from("startup_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (sp) {
        setCompanyName(sp.company_name ?? "");
        setStage(sp.current_stage ?? "seed");
        setSector(sp.primary_sector ?? "AI / ML");
        setFundingAsk(formatCents(sp.raise_target));
        setOneLiner(sp.one_liner ?? "");
        setCurrentArr(formatCents(sp.current_arr));
        setRunwayMonths(sp.runway_months?.toString() ?? "");
        setMomGrowth(sp.mom_growth_pct?.toString() ?? "");
        setCustomerCount(sp.customer_count?.toString() ?? "");
        setDeckLink(sp.pitch_deck_link ?? "");

        const { data: matchData } = await supabase
          .from("matches")
          .select("overall_score, vc_profiles ( id, fund_name )")
          .eq("startup_id", sp.id)
          .eq("is_active", true)
          .order("overall_score", { ascending: false })
          .limit(10);

        if (matchData) {
          const funds: TargetFund[] = matchData
            .filter(m => m.vc_profiles)
            .map(m => {
              const vc = m.vc_profiles as Record<string, unknown>;
              return { vcProfileId: vc.id as string, fundName: vc.fund_name as string, score: Math.round(m.overall_score as number) };
            });
          setAvailableFunds(funds);
          if (preselectedVcId) {
            setSelectedFundIds(new Set([preselectedVcId]));
          } else {
            setSelectedFundIds(new Set(funds.slice(0, 3).map(f => f.vcProfileId)));
          }
        }
      }
      setLoading(false);
    })();
  }, [preselectedVcId]);

  const toggleFund = (id: string) => {
    setSelectedFundIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedFundIds.size === 0) {
      setToast({ type: "error", msg: "Select at least one target fund." });
      return;
    }
    setSubmitting(true);
    setToast(null);
    const result = await submitPitch({
      company_name:    companyName,
      stage,
      sector,
      funding_ask:     fundingAsk,
      one_liner:       oneLiner,
      problem_solution: problemSolution,
      current_arr:     currentArr,
      mom_growth_pct:  momGrowth,
      customer_count:  customerCount,
      runway_months:   runwayMonths,
      pitch_deck_link: deckLink,
      target_vc_ids:   Array.from(selectedFundIds),
    });
    setSubmitting(false);
    if (result.error) {
      setToast({ type: "error", msg: result.error });
    } else {
      setSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="font-mono text-sm text-vb-muted animate-pulse">Loading…</span>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-5xl mb-5">🚀</div>
        <h2 className="font-display text-[32px] tracking-[1px] mb-3">Pitch Submitted!</h2>
        <p className="text-vb-text-secondary max-w-sm leading-relaxed mb-6">
          Your pitch has been sent to {selectedFundIds.size} fund{selectedFundIds.size !== 1 ? "s" : ""}. You&apos;ll be notified when they view your deck or reach out.
        </p>
        <a href="/matches" className="vb-btn-primary text-sm">View Fund Matches →</a>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Submit Pitch</div>
          <div className="page-subtitle">Send your deck and data room to matched funds</div>
        </div>
      </div>

      {toast && (
        <div className={`mx-10 mt-4 px-4 py-3 rounded border text-[13px] font-mono ${
          toast.type === "error"
            ? "bg-vb-red/10 border-vb-red/30 text-vb-red"
            : "bg-vb-green/10 border-vb-green/30 text-vb-green"
        }`}>
          {toast.type === "error" ? "✕ " : "✓ "}{toast.msg}
        </div>
      )}

      <div className="px-10 py-8 max-w-4xl">
        {/* Company Overview */}
        <section className="mb-8">
          <div className="font-display text-[22px] tracking-[1px] mb-4 pb-2.5 border-b border-vb-border">Company Overview</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="vb-label">COMPANY NAME</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme AI" className="vb-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="vb-label">STAGE</label>
              <select value={stage} onChange={e => setStage(e.target.value)} className="vb-select">
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="vb-label">SECTOR</label>
              <select value={sector} onChange={e => setSector(e.target.value)} className="vb-select">
                {SECTORS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="vb-label">FUNDING ASK ($)</label>
              <input type="text" value={fundingAsk} onChange={e => setFundingAsk(e.target.value)} placeholder="e.g. 2,500,000" className="vb-input" />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="vb-label">ONE-LINE PITCH</label>
              <input type="text" value={oneLiner} onChange={e => setOneLiner(e.target.value)} placeholder="We build AI-powered X that helps Y do Z." className="vb-input" />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="vb-label">PROBLEM & SOLUTION</label>
              <textarea value={problemSolution} onChange={e => setProblemSolution(e.target.value)} placeholder="Describe the problem you solve and how…" className="vb-textarea" />
            </div>
          </div>
        </section>

        {/* Traction */}
        <section className="mb-8">
          <div className="font-display text-[22px] tracking-[1px] mb-4 pb-2.5 border-b border-vb-border">Traction & Metrics</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="vb-label">CURRENT ARR ($)</label>
              <input type="text" value={currentArr} onChange={e => setCurrentArr(e.target.value)} placeholder="e.g. 480,000" className="vb-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="vb-label">MOM GROWTH (%)</label>
              <input type="text" value={momGrowth} onChange={e => setMomGrowth(e.target.value)} placeholder="e.g. 18" className="vb-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="vb-label">CUSTOMERS</label>
              <input type="text" value={customerCount} onChange={e => setCustomerCount(e.target.value)} placeholder="e.g. 34" className="vb-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="vb-label">RUNWAY (MONTHS)</label>
              <input type="text" value={runwayMonths} onChange={e => setRunwayMonths(e.target.value)} placeholder="e.g. 16" className="vb-input" />
            </div>
          </div>
        </section>

        {/* Pitch Deck */}
        <section className="mb-8">
          <div className="font-display text-[22px] tracking-[1px] mb-4 pb-2.5 border-b border-vb-border">Pitch Deck</div>
          <label className="vb-label block mb-1.5">DOCSEND / GOOGLE SLIDES LINK</label>
          <input type="text" value={deckLink} onChange={e => setDeckLink(e.target.value)} placeholder="https://docsend.com/view/..." className="vb-input" />
        </section>

        {/* Target Funds */}
        <section className="mb-8">
          <div className="font-display text-[22px] tracking-[1px] mb-4 pb-2.5 border-b border-vb-border">Target Funds</div>
          {availableFunds.length === 0 ? (
            <div className="bg-vb-navy border border-vb-border rounded-lg p-5 text-[14px] text-vb-text-secondary">
              No matches yet.{" "}
              <a href="/profile" className="text-vb-blue hover:underline">Save your startup profile</a>{" "}
              first to generate fund matches.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2.5 mb-4">
                {availableFunds.map(fund => {
                  const selected = selectedFundIds.has(fund.vcProfileId);
                  return (
                    <button
                      key={fund.vcProfileId}
                      onClick={() => toggleFund(fund.vcProfileId)}
                      className={`flex items-center gap-2 px-3 py-1.5 border rounded text-[13px] font-mono transition-all ${
                        selected
                          ? "bg-vb-blue/10 border-vb-blue/40 text-vb-blue-bright"
                          : "bg-vb-navy border-vb-border text-vb-muted hover:border-vb-blue/40"
                      }`}
                    >
                      <span>{fund.fundName}</span>
                      <span className={`text-[11px] ${selected ? "text-vb-blue" : "text-vb-muted"}`}>{fund.score}%</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[13px] text-vb-muted">
                {selectedFundIds.size} fund{selectedFundIds.size !== 1 ? "s" : ""} selected.{" "}
                <a href="/matches" className="text-vb-blue hover:underline">View all matches →</a>
              </p>
            </>
          )}
        </section>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedFundIds.size === 0}
            className="px-6 py-2.5 bg-vb-blue text-white text-sm font-semibold rounded hover:bg-vb-blue-bright transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : `Submit Pitch to ${selectedFundIds.size} Fund${selectedFundIds.size !== 1 ? "s" : ""} →`}
          </button>
          <a href="/profile" className="px-6 py-2.5 bg-vb-panel border border-vb-border text-vb-text text-sm font-semibold rounded hover:border-vb-blue transition-colors">
            Edit Profile
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PitchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <span className="font-mono text-sm text-vb-muted animate-pulse">Loading…</span>
      </div>
    }>
      <PitchForm />
    </Suspense>
  );
}
