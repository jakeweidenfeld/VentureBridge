"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { applyAsInvestor } from "@/app/actions/apply";

const FUND_SIZE_OPTIONS = [
  "Under $10M",
  "$10M – $50M",
  "$50M – $100M",
  "$100M – $250M",
  "$250M – $500M",
  "$500M – $1B",
  "$1B+",
];

const CHECK_SIZE_OPTIONS = [
  "$25K – $100K",
  "$100K – $500K",
  "$250K – $1M",
  "$500K – $2M",
  "$1M – $5M",
  "$5M – $15M",
  "$15M – $50M",
  "$50M+",
];

const STAGE_OPTIONS = [
  { label: "Pre-Seed", value: "pre-seed" },
  { label: "Seed", value: "seed" },
  { label: "Series A", value: "series-a" },
  { label: "Series B", value: "series-b" },
  { label: "Series C+", value: "series-c" },
];

const SECTOR_OPTIONS = [
  "AI / ML", "SaaS", "Fintech", "Healthtech", "Biotech",
  "E-commerce", "Marketplace", "Consumer", "Enterprise Software",
  "Developer Tools", "Infrastructure / Cloud", "Cybersecurity",
  "Deep Tech", "Hardware / Robotics", "Climate Tech", "EdTech",
  "PropTech", "Logistics / Supply Chain", "HR Tech", "LegalTech",
  "Defense Tech", "Space Tech", "AgriTech", "Web3 / Crypto",
  "Gaming", "Social / Media", "GovTech", "Other",
];

function Chip({
  label, active, onToggle, color = "blue",
}: {
  label: string; active: boolean; onToggle: () => void; color?: "blue" | "amber";
}) {
  const activeClass =
    color === "amber"
      ? "bg-vb-amber/15 border-vb-amber/50 text-vb-amber"
      : "bg-vb-blue/15 border-vb-blue/50 text-vb-blue-bright";
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[12px] font-mono transition-all cursor-pointer ${
        active ? activeClass : "bg-vb-navy border-vb-border text-vb-muted hover:border-vb-blue/30 hover:text-vb-text"
      }`}
    >
      {label}
      {active && <span className="text-[10px] opacity-70">✓</span>}
    </button>
  );
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

export default function ApplyPage() {
  const router = useRouter();

  // Form state
  const [fundName, setFundName]         = useState("");
  const [fundSize, setFundSize]         = useState("");
  const [checkSize, setCheckSize]       = useState("");
  const [stages, setStages]             = useState<string[]>([]);
  const [yearFounded, setYearFounded]   = useState("");
  const [hqCity, setHqCity]             = useState("");
  const [sectors, setSectors]           = useState<string[]>([]);
  const [thesis, setThesis]             = useState("");

  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");

  // Page states: loading | apply | pending | approved
  const [pageState, setPageState]       = useState<"loading" | "apply" | "pending" | "approved">("loading");
  const [existingApp, setExistingApp]   = useState<Record<string, unknown> | null>(null);

  // On mount — check if user already has a vc_profile row
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: vp } = await supabase
        .from("vc_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!vp) {
        setPageState("apply");
      } else if (vp.is_published) {
        setPageState("approved");
        router.replace("/vc/inbox");
      } else {
        setExistingApp(vp);
        setPageState("pending");
      }
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundName.trim()) { setError("Fund / investor name is required."); return; }
    if (stages.length === 0) { setError("Please select at least one investment stage."); return; }
    if (sectors.length === 0) { setError("Please select at least one sector."); return; }
    setError("");
    setSaving(true);

    const result = await applyAsInvestor({
      fund_name: fundName,
      fund_size: fundSize,
      typical_check_size: checkSize,
      investment_stages: stages,
      year_founded: yearFounded,
      hq_city: hqCity,
      thesis_keywords: sectors,
      thesis_statement: thesis,
    });

    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setPageState("pending");
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-vb-black flex items-center justify-center">
        <span className="font-mono text-sm text-vb-muted animate-pulse">Loading…</span>
      </div>
    );
  }

  // ── Pending / submitted ─────────────────────────────────────────────────
  if (pageState === "pending") {
    return (
      <div className="min-h-screen bg-vb-black flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[540px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-display text-[24px] tracking-[2px] text-vb-text mb-10 justify-center no-underline">
            <span className="w-2 h-2 rounded-full bg-vb-amber animate-vb-pulse" />
            <span>Venture</span><span className="text-vb-blue">Bridge</span>
          </Link>

          <div className="bg-vb-panel border border-vb-border rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-vb-amber/15 border border-vb-amber/30 flex items-center justify-center mx-auto mb-5 text-3xl">
              ⏳
            </div>
            <div className="inline-flex items-center gap-2 bg-vb-amber/10 border border-vb-amber/25 rounded-full px-4 py-1.5 text-[11px] font-mono font-semibold tracking-[1.5px] text-vb-amber uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-vb-amber animate-vb-pulse" />
              Under Review
            </div>
            <h2 className="font-display text-[32px] tracking-[1px] mb-3">Application Submitted</h2>
            <p className="text-[15px] text-vb-text-secondary leading-[1.7] max-w-[360px] mx-auto mb-8">
              Thanks for applying to VentureBridge. Our team reviews every investor
              application manually — you&apos;ll hear back within <strong className="text-vb-text">2–3 business days</strong>.
            </p>

            {/* Summary of what was submitted */}
            {existingApp && (
              <div className="bg-vb-navy border border-vb-border rounded-xl p-5 text-left mb-8 space-y-2.5">
                <div className="font-mono text-[10px] tracking-[2px] text-vb-muted uppercase mb-3">Your Application</div>
                {[
                  ["Fund Name", existingApp.fund_name as string],
                  ["Fund Size", existingApp.fund_size as string],
                  ["Typical Check", existingApp.typical_check_size as string],
                  ["Location", existingApp.hq_city as string],
                  ["Year Founded", existingApp.year_founded ? String(existingApp.year_founded) : null],
                ].map(([label, val]) =>
                  val ? (
                    <div key={label as string} className="flex items-baseline gap-2 text-[13px]">
                      <span className="text-vb-muted w-28 flex-shrink-0">{label}</span>
                      <span className="text-vb-text font-medium">{val}</span>
                    </div>
                  ) : null
                )}
                {Array.isArray(existingApp.investment_stages) && existingApp.investment_stages.length > 0 && (
                  <div className="flex items-start gap-2 text-[13px]">
                    <span className="text-vb-muted w-28 flex-shrink-0">Stages</span>
                    <span className="text-vb-text font-medium">{(existingApp.investment_stages as string[]).join(", ")}</span>
                  </div>
                )}
                {Array.isArray(existingApp.thesis_keywords) && existingApp.thesis_keywords.length > 0 && (
                  <div className="flex items-start gap-2 text-[13px]">
                    <span className="text-vb-muted w-28 flex-shrink-0 mt-0.5">Sectors</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(existingApp.thesis_keywords as string[]).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 bg-vb-blue/10 border border-vb-blue/20 rounded text-[11px] text-vb-blue-bright font-mono">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-[13px] text-vb-muted">
              Questions? Email us at{" "}
              <a href="mailto:team@venturebridge.vc" className="text-vb-blue hover:underline">
                team@venturebridge.vc
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Application form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-vb-black px-4 py-16">
      <div className="w-full max-w-[680px] mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-[24px] tracking-[2px] text-vb-text mb-10 justify-center no-underline">
          <span className="w-2 h-2 rounded-full bg-vb-amber animate-vb-pulse" />
          <span>Venture</span><span className="text-vb-blue">Bridge</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-vb-amber/10 border border-vb-amber/25 rounded-full px-4 py-1.5 text-[11px] font-mono font-semibold tracking-[1.5px] text-vb-amber uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-vb-amber" />
            Investor Application
          </div>
          <h1 className="font-display text-[clamp(32px,5vw,48px)] leading-none tracking-[1px] mb-3">
            APPLY TO JOIN
            <br />
            <span className="text-vb-amber">AS AN INVESTOR</span>
          </h1>
          <p className="text-[15px] text-vb-text-secondary leading-[1.7] max-w-[460px] mx-auto">
            VentureBridge is invite-and-apply only for investors. Tell us about your fund and
            we&apos;ll review your application within 2–3 business days.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section 1: Fund Identity ─────────────────────────── */}
          <div className="bg-vb-panel border border-vb-border rounded-xl p-7">
            <h2 className="font-display text-[18px] tracking-[1px] text-vb-amber mb-5 flex items-center gap-2">
              <span className="font-mono text-[13px] text-vb-muted">01</span> Fund Identity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="vb-label">Fund / Investor Name <span className="text-vb-red">*</span></label>
                <input
                  type="text"
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  placeholder="e.g. Sequoia Capital, Jane Doe (Angel)"
                  className="vb-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="vb-label">Year Fund Began</label>
                <input
                  type="number"
                  value={yearFounded}
                  onChange={(e) => setYearFounded(e.target.value)}
                  placeholder="e.g. 2018"
                  min={1950}
                  max={new Date().getFullYear()}
                  className="vb-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="vb-label">Location (City / Region)</label>
                <input
                  type="text"
                  value={hqCity}
                  onChange={(e) => setHqCity(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="vb-input"
                />
              </div>

            </div>
          </div>

          {/* ── Section 2: Investment Profile ───────────────────── */}
          <div className="bg-vb-panel border border-vb-border rounded-xl p-7">
            <h2 className="font-display text-[18px] tracking-[1px] text-vb-amber mb-5 flex items-center gap-2">
              <span className="font-mono text-[13px] text-vb-muted">02</span> Investment Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

              <div className="flex flex-col gap-1.5">
                <label className="vb-label">Fund Size</label>
                <select value={fundSize} onChange={(e) => setFundSize(e.target.value)} className="vb-input">
                  <option value="">Select range…</option>
                  {FUND_SIZE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="vb-label">Average Check Size</label>
                <select value={checkSize} onChange={(e) => setCheckSize(e.target.value)} className="vb-input">
                  <option value="">Select range…</option>
                  {CHECK_SIZE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

            </div>

            <div className="flex flex-col gap-2">
              <label className="vb-label">Stage Focus <span className="text-vb-red">*</span></label>
              <p className="text-[12px] text-vb-muted -mt-1 mb-1">Select all stages you actively invest in</p>
              <div className="flex flex-wrap gap-2">
                {STAGE_OPTIONS.map((s) => (
                  <Chip
                    key={s.value}
                    label={s.label}
                    active={stages.includes(s.value)}
                    onToggle={() => setStages(toggle(stages, s.value))}
                    color="amber"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Section 3: Focus Areas ───────────────────────────── */}
          <div className="bg-vb-panel border border-vb-border rounded-xl p-7">
            <h2 className="font-display text-[18px] tracking-[1px] text-vb-amber mb-5 flex items-center gap-2">
              <span className="font-mono text-[13px] text-vb-muted">03</span> What You Invest In
            </h2>

            <div className="flex flex-col gap-2 mb-5">
              <label className="vb-label">Sectors / Company Types <span className="text-vb-red">*</span></label>
              <p className="text-[12px] text-vb-muted -mt-1 mb-1">Select all sectors you actively invest in</p>
              <div className="flex flex-wrap gap-2">
                {SECTOR_OPTIONS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    active={sectors.includes(s)}
                    onToggle={() => setSectors(toggle(sectors, s))}
                    color="blue"
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="vb-label">Investment Thesis <span className="text-[11px] text-vb-muted font-normal">(optional)</span></label>
              <textarea
                value={thesis}
                onChange={(e) => setThesis(e.target.value)}
                rows={4}
                placeholder="Describe your fund's investment philosophy, what excites you, what you look for in a founder…"
                className="vb-input resize-none"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-[13px] text-vb-red bg-vb-red/10 border border-vb-red/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-vb-amber text-vb-black text-[15px] font-bold rounded-lg hover:bg-amber-400 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(245,158,11,0.25)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Submitting application…" : "Submit Application →"}
          </button>

          <p className="text-center text-[13px] text-vb-muted pb-4">
            Already applied?{" "}
            <Link href="/login" className="text-vb-blue hover:underline">Log in to check your status</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
