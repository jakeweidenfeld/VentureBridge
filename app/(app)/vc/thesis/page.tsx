"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveVcThesis } from "@/app/actions/profile";

const GEO_REGIONS = [
  "🇺🇸 United States", "🌍 Global / Remote", "🇬🇧 United Kingdom",
  "🇮🇳 India", "🇪🇺 Europe", "🇸🇬 Southeast Asia", "🇮🇱 Israel", "🌎 LatAm",
];

const THESIS_KEYWORDS = [
  "AI-first", "Infrastructure", "Category-defining", "Deep Tech",
  "Marketplace", "Consumer", "Developer Tools", "Vertical SaaS",
  "Fintech", "Bio / Health", "Climate Tech", "Defense Tech",
  "EdTech", "PropTech", "Cybersecurity", "Robotics",
  "AdTech", "GovTech", "Space Tech", "Web3", "Enterprise",
];

const EXCLUSIONS = [
  "Crypto / Web3", "Pre-revenue hardware", "E-commerce", "Brick & Mortar",
  "Non-tech services", "Gambling / iGaming", "Adult content",
  "Biotech", "EdTech", "Media", "Gaming", "AgriTech",
];

const STAGE_OPTIONS = [
  "Pre-Seed Only", "Pre-Seed + Seed", "Seed Only", "Seed + Series A",
  "Series A Only", "Series A + Series B", "All Stages",
];
const CHECK_SIZE_OPTIONS = [
  "$100K–$500K", "$250K–$1M", "$500K–$2M", "$2M–$5M",
  "$2M–$15M", "$5M–$25M", "$10M–$50M", "$50M+",
];
const MIN_ARR_OPTIONS = [
  "$0 — idea stage OK", "$50K+", "$100K+", "$250K+",
  "$500K+", "$1M+", "$5M+",
];
const HQ_REQ_OPTIONS = [
  "Must be in primary region", "Anywhere — remote-first OK",
  "US only, no exceptions", "Open to relocation for investment",
];

function KeywordChip({
  label, active, onToggle, danger,
}: { label: string; active: boolean; onToggle: () => void; danger?: boolean }) {
  const activeStyle = danger
    ? "bg-red-500/10 border-red-500/25 text-red-400"
    : "bg-vb-blue text-white border-vb-blue";
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[12px] font-mono transition-all cursor-pointer ${active ? activeStyle : "bg-vb-blue/10 border-vb-blue/25 text-vb-blue-bright"}`}
    >
      {label}
      {active && <span className="text-[10px] opacity-60">●</span>}
    </button>
  );
}

function toggleSet(set: Set<string>, setFn: (s: Set<string>) => void, val: string) {
  const next = new Set(set);
  next.has(val) ? next.delete(val) : next.add(val);
  setFn(next);
}

const STORAGE_KEY = "vb_vc_thesis";

interface ThesisCache {
  fundName: string; fundSize: string; hqCity: string; yearFounded: string;
  managingPartners: string; portfolioCount: string; thesisStatement: string;
  hqReq: string; investmentStages: string; checkSize: string;
  leadOrFollow: string; proRata: string; minArr: string; boardSeat: string;
  memoLink: string; geo: string[]; keywords: string[]; exclusions: string[];
}

function readCache(): ThesisCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ThesisCache) : null;
  } catch { return null; }
}

function writeCache(c: ThesisCache) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch {}
}

export default function VcThesisPage() {
  // Initialise text fields from localStorage synchronously (instant restore)
  const cached = readCache();

  // Multi-select chip state (arrays in cache → Sets here)
  const [activeGeo,        setActiveGeo]        = useState(() => new Set<string>(cached?.geo        ?? []));
  const [activeKeywords,   setActiveKeywords]    = useState(() => new Set<string>(cached?.keywords   ?? []));
  const [activeExclusions, setActiveExclusions]  = useState(() => new Set<string>(cached?.exclusions ?? []));

  // Text / select field state
  const [fundName,         setFundName]         = useState(cached?.fundName         ?? "");
  const [fundSize,         setFundSize]         = useState(cached?.fundSize         ?? "");
  const [hqCity,           setHqCity]           = useState(cached?.hqCity           ?? "");
  const [yearFounded,      setYearFounded]      = useState(cached?.yearFounded      ?? "");
  const [managingPartners, setManagingPartners] = useState(cached?.managingPartners ?? "");
  const [portfolioCount,   setPortfolioCount]   = useState(cached?.portfolioCount   ?? "");
  const [thesisStatement,  setThesisStatement]  = useState(cached?.thesisStatement  ?? "");
  const [hqReq,            setHqReq]            = useState(cached?.hqReq            ?? HQ_REQ_OPTIONS[0]);
  const [investmentStages, setInvestmentStages] = useState(cached?.investmentStages ?? "Seed + Series A");
  const [checkSize,        setCheckSize]        = useState(cached?.checkSize        ?? "$2M–$15M");
  const [leadOrFollow,     setLeadOrFollow]     = useState(cached?.leadOrFollow     ?? "Lead only");
  const [proRata,          setProRata]          = useState(cached?.proRata          ?? "Always required");
  const [minArr,           setMinArr]           = useState(cached?.minArr           ?? "$100K+");
  const [boardSeat,        setBoardSeat]        = useState(cached?.boardSeat        ?? "Yes — always");
  const [memoLink,         setMemoLink]         = useState(cached?.memoLink         ?? "");

  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Fetch from Supabase in background (authoritative — overrides localStorage)
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: vp } = await supabase
          .from("vc_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (vp) {
          setFundName(vp.fund_name ?? "");
          setFundSize(vp.fund_size ?? "");
          setHqCity(vp.hq_city ?? "");
          setYearFounded(vp.year_founded?.toString() ?? "");
          setManagingPartners(vp.managing_partners ?? "");
          setPortfolioCount(vp.portfolio_count ?? "");
          setThesisStatement(vp.thesis_statement ?? "");
          setHqReq(vp.hq_requirement ?? HQ_REQ_OPTIONS[0]);
          setInvestmentStages(vp.investment_stages?.[0] ?? "Seed + Series A");
          setCheckSize(vp.typical_check_size ?? "$2M–$15M");
          setLeadOrFollow(vp.lead_or_follow ?? "Lead only");
          setProRata(vp.pro_rata_rights ?? "Always required");
          setMinArr(vp.min_arr ?? "$100K+");
          setBoardSeat(vp.board_seat ?? "Yes — always");
          setMemoLink(vp.memo_link ?? "");
          const geo        = vp.primary_regions ?? [];
          const keywords   = vp.thesis_keywords ?? [];
          const exclusions = vp.excluded_sectors ?? [];
          setActiveGeo(new Set(geo));
          setActiveKeywords(new Set(keywords));
          setActiveExclusions(new Set(exclusions));
          // Keep localStorage in sync with server data
          writeCache({
            fundName: vp.fund_name ?? "", fundSize: vp.fund_size ?? "",
            hqCity: vp.hq_city ?? "", yearFounded: vp.year_founded?.toString() ?? "",
            managingPartners: vp.managing_partners ?? "", portfolioCount: vp.portfolio_count ?? "",
            thesisStatement: vp.thesis_statement ?? "", hqReq: vp.hq_requirement ?? HQ_REQ_OPTIONS[0],
            investmentStages: vp.investment_stages?.[0] ?? "Seed + Series A",
            checkSize: vp.typical_check_size ?? "$2M–$15M", leadOrFollow: vp.lead_or_follow ?? "Lead only",
            proRata: vp.pro_rata_rights ?? "Always required", minArr: vp.min_arr ?? "$100K+",
            boardSeat: vp.board_seat ?? "Yes — always", memoLink: vp.memo_link ?? "",
            geo, keywords, exclusions,
          });
        }
      } catch {}
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    const result = await saveVcThesis({
      fund_name: fundName,
      fund_size: fundSize,
      hq_city: hqCity,
      year_founded: yearFounded,
      managing_partners: managingPartners,
      portfolio_count: portfolioCount,
      thesis_statement: thesisStatement,
      thesis_keywords: Array.from(activeKeywords),
      primary_regions: Array.from(activeGeo),
      hq_requirement: hqReq,
      investment_stages: investmentStages,
      typical_check_size: checkSize,
      lead_or_follow: leadOrFollow,
      pro_rata_rights: proRata,
      min_arr: minArr,
      board_seat: boardSeat,
      excluded_sectors: Array.from(activeExclusions),
      memo_link: memoLink,
    });
    setSaving(false);
    if (result.error) {
      setToast({ type: "error", msg: result.error });
    } else {
      // Persist locally so the form survives navigation and page reloads
      writeCache({
        fundName, fundSize, hqCity, yearFounded, managingPartners, portfolioCount,
        thesisStatement, hqReq, investmentStages, checkSize, leadOrFollow,
        proRata, minArr, boardSeat, memoLink,
        geo: Array.from(activeGeo),
        keywords: Array.from(activeKeywords),
        exclusions: Array.from(activeExclusions),
      });
      setToast({ type: "success", msg: "Thesis saved — matches are being recomputed." });
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Fund Thesis Profile</div>
          <div className="page-subtitle">Define your investment thesis — this drives all startup matching</div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-vb-blue text-white text-sm font-semibold rounded hover:bg-vb-blue-bright transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save Thesis →"}
        </button>
      </div>

      {toast && (
        <div className={`mx-10 mt-4 px-4 py-3 rounded border text-[13px] font-mono ${
          toast.type === "success"
            ? "bg-vb-green/10 border-vb-green/30 text-vb-green"
            : "bg-vb-red/10 border-vb-red/30 text-vb-red"
        }`}>
          {toast.type === "success" ? "✓ " : "✕ "}{toast.msg}
        </div>
      )}

      <div className="px-10 py-8 max-w-4xl">
        {/* Fund Identity */}
        <FormSection title="Fund Identity">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fund Name">
              <input type="text" value={fundName} onChange={e => setFundName(e.target.value)} placeholder="Acme Ventures" className="vb-input" />
            </Field>
            <Field label="Fund Size">
              <input type="text" value={fundSize} onChange={e => setFundSize(e.target.value)} placeholder="$200M" className="vb-input" />
            </Field>
            <Field label="Fund HQ City">
              <input type="text" value={hqCity} onChange={e => setHqCity(e.target.value)} placeholder="San Francisco, CA" className="vb-input" />
            </Field>
            <Field label="Year Founded">
              <input type="text" value={yearFounded} onChange={e => setYearFounded(e.target.value)} placeholder="2019" className="vb-input" />
            </Field>
            <Field label="Managing Partners">
              <input type="text" value={managingPartners} onChange={e => setManagingPartners(e.target.value)} placeholder="Jane Smith, John Doe" className="vb-input" />
            </Field>
            <Field label="Portfolio Companies">
              <input type="text" value={portfolioCount} onChange={e => setPortfolioCount(e.target.value)} placeholder="40+" className="vb-input" />
            </Field>
          </div>
        </FormSection>

        {/* Geographic Focus */}
        <FormSection title="Geographic Focus">
          <div className="bg-vb-navy border border-vb-border rounded-lg p-5 mb-4">
            <div className="font-mono text-[9px] tracking-[2px] text-vb-muted uppercase mb-2">Primary Investment Regions</div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {GEO_REGIONS.map((r) => (
                <KeywordChip key={r} label={r} active={activeGeo.has(r)} onToggle={() => toggleSet(activeGeo, setActiveGeo, r)} />
              ))}
            </div>
            <div className="mt-4">
              <div className="font-mono text-[9px] tracking-[2px] text-vb-muted uppercase mb-1.5">Startup HQ Requirement</div>
              <select value={hqReq} onChange={e => setHqReq(e.target.value)} className="vb-select w-72 mt-1.5">
                {HQ_REQ_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </FormSection>

        {/* Investment Thesis */}
        <FormSection title="Investment Thesis">
          <div className="bg-vb-navy border border-vb-border rounded-lg p-5 mb-4">
            <div className="font-mono text-[9px] tracking-[2px] text-vb-muted uppercase mb-1.5">Thesis Statement</div>
            <textarea
              value={thesisStatement}
              onChange={e => setThesisStatement(e.target.value)}
              placeholder="We back bold founders who leverage software and AI to reshape trillion-dollar industries…"
              className="vb-textarea mt-1.5"
            />
            <div className="mt-4">
              <div className="font-mono text-[9px] tracking-[2px] text-vb-muted uppercase mb-2">Thesis Keywords — used for matching</div>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {THESIS_KEYWORDS.map((kw) => (
                  <KeywordChip key={kw} label={kw} active={activeKeywords.has(kw)} onToggle={() => toggleSet(activeKeywords, setActiveKeywords, kw)} />
                ))}
              </div>
            </div>
          </div>
        </FormSection>

        {/* Stage & Deal Preferences */}
        <FormSection title="Stage & Deal Preferences">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Investment Stages">
              <select value={investmentStages} onChange={e => setInvestmentStages(e.target.value)} className="vb-select">
                {STAGE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Typical Check Size">
              <select value={checkSize} onChange={e => setCheckSize(e.target.value)} className="vb-select">
                {CHECK_SIZE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Lead vs Follow">
              <select value={leadOrFollow} onChange={e => setLeadOrFollow(e.target.value)} className="vb-select">
                <option>Lead only</option>
                <option>Will follow</option>
                <option>Both</option>
              </select>
            </Field>
            <Field label="Pro-Rata Rights">
              <select value={proRata} onChange={e => setProRata(e.target.value)} className="vb-select">
                <option>Always required</option>
                <option>Preferred</option>
                <option>Flexible</option>
              </select>
            </Field>
            <Field label="Min Traction (ARR)">
              <select value={minArr} onChange={e => setMinArr(e.target.value)} className="vb-select">
                {MIN_ARR_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Board Seat">
              <select value={boardSeat} onChange={e => setBoardSeat(e.target.value)} className="vb-select">
                <option>Yes — always</option>
                <option>Observer only</option>
                <option>Flexible</option>
              </select>
            </Field>
          </div>
        </FormSection>

        {/* Niche Exclusions */}
        <FormSection title="Niche Exclusions">
          <div className="bg-vb-navy border border-vb-border rounded-lg p-5">
            <div className="font-mono text-[9px] tracking-[2px] text-vb-muted uppercase mb-2">We do NOT invest in</div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {EXCLUSIONS.map((ex) => (
                <KeywordChip
                  key={ex}
                  label={ex + (activeExclusions.has(ex) ? " ✕" : "")}
                  active={activeExclusions.has(ex)}
                  onToggle={() => toggleSet(activeExclusions, setActiveExclusions, ex)}
                  danger
                />
              ))}
            </div>
          </div>
        </FormSection>

        {/* Fund Materials */}
        <FormSection title="Fund Materials for Startups">
          <p className="text-[14px] text-vb-text-secondary mb-5 leading-[1.6]">
            Share a link to your fund memo or Notion doc. Matched startups will see this to understand your value-add, portfolio, and what working with your fund looks like.
          </p>
          <label className="vb-label block mb-1.5">MEMO / NOTION DOC LINK</label>
          <input
            type="text"
            value={memoLink}
            onChange={e => setMemoLink(e.target.value)}
            placeholder="https://notion.so/..."
            className="vb-input"
          />
        </FormSection>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="font-display text-[22px] tracking-[1px] mb-4 pb-2.5 border-b border-vb-border">{title}</div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="vb-label">{label.toUpperCase()}</label>
      {children}
    </div>
  );
}
