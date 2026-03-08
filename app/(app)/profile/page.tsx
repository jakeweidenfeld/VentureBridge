"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveStartupProfile } from "@/app/actions/profile";

const STAGES = ["pre-seed", "seed", "series-a", "series-b", "series-c"] as const;
const STAGE_LABELS: Record<string, string> = {
  "pre-seed": "Pre-Seed", "seed": "Seed", "series-a": "Series A",
  "series-b": "Series B", "series-c": "Series C",
};

const CHECK_SIZES = ["$100K–$500K", "$250K–$1M", "$500K–$2M", "$1M–$3M", "$3M–$5M", "$5M–$10M", "$10M+"];
const BUSINESS_MODELS = ["B2B SaaS", "B2C", "Marketplace", "Usage-based", "Transactional", "Hardware + Software", "Services", "Other"];
const GEOGRAPHIES = ["US / Global", "US Only", "North America", "Europe", "Asia-Pacific", "Latin America", "Middle East / Africa", "Global / Remote-first"];

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

const EMPTY_FORM = {
  company_name: "",
  founded_year: "",
  hq_location: "",
  website: "",
  description: "",
  one_liner: "",
  current_stage: "seed",
  raise_target: "",
  preferred_check_size: "$1M–$3M",
  needs_lead_investor: true,
  primary_sector: "AI / ML",
  secondary_sector: "Infrastructure / Cloud",
  business_model: "B2B SaaS",
  geography: "US / Global",
  current_arr: "",
  mom_growth_pct: "",
  customer_count: "",
  runway_months: "",
  pitch_deck_link: "",
};

type FormState = typeof EMPTY_FORM;

const STORAGE_KEY = "vb_startup_profile";

/** Format cents as display string like "$480,000" */
function centsToDisplay(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function ProfilePage() {
  const [form, setForm] = useState<FormState>(() => {
    // Initialise synchronously from localStorage so the form appears instantly
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) return { ...EMPTY_FORM, ...(JSON.parse(cached) as Partial<FormState>) };
      } catch {}
    }
    return EMPTY_FORM;
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const set = useCallback(
    (key: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    []
  );

  // Load existing profile on mount
  useEffect(() => {
    // Fetch from Supabase (authoritative — overrides localStorage when available)
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data: sp } = await supabase
          .from("startup_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (sp) {
          const fresh: FormState = {
            company_name: sp.company_name ?? "",
            founded_year: sp.founded_year?.toString() ?? "",
            hq_location: sp.hq_location ?? "",
            website: sp.website ?? "",
            description: sp.description ?? "",
            one_liner: sp.one_liner ?? "",
            current_stage: sp.current_stage ?? "seed",
            raise_target: centsToDisplay(sp.raise_target),
            preferred_check_size: sp.preferred_check_size ?? "$1M–$3M",
            needs_lead_investor: sp.needs_lead_investor,
            primary_sector: sp.primary_sector ?? "AI / ML",
            secondary_sector: sp.secondary_sector ?? "",
            business_model: sp.business_model ?? "B2B SaaS",
            geography: sp.geography ?? "US / Global",
            current_arr: centsToDisplay(sp.current_arr),
            mom_growth_pct: sp.mom_growth_pct?.toString() ?? "",
            customer_count: sp.customer_count?.toString() ?? "",
            runway_months: sp.runway_months?.toString() ?? "",
            pitch_deck_link: sp.pitch_deck_link ?? "",
          };
          setForm(fresh);
          // Keep cache in sync with server data
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    const result = await saveStartupProfile(form);
    setSaving(false);
    if (result.error) {
      setToast({ type: "error", msg: result.error });
    } else {
      // Persist locally so the form survives navigation and page reloads
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
      setToast({ type: "success", msg: "Profile saved — matches are being recomputed." });
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="font-mono text-sm text-vb-muted animate-pulse">Loading profile…</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Startup Profile</div>
          <div className="page-subtitle">Your public-facing profile visible to matched investors</div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-vb-blue text-white text-sm font-semibold rounded hover:bg-vb-blue-bright transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save & Publish →"}
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
        {/* Company Identity */}
        <FormSection title="Company Identity">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Name">
              <input type="text" value={form.company_name} onChange={set("company_name")} placeholder="Acme AI" className="vb-input" />
            </Field>
            <Field label="Founded Year">
              <input type="text" value={form.founded_year} onChange={set("founded_year")} placeholder="2023" className="vb-input" />
            </Field>
            <Field label="HQ Location">
              <input type="text" value={form.hq_location} onChange={set("hq_location")} placeholder="San Francisco, CA" className="vb-input" />
            </Field>
            <Field label="Website">
              <input type="text" value={form.website} onChange={set("website")} placeholder="yourcompany.com" className="vb-input" />
            </Field>
            <Field label="One-Line Pitch" fullWidth>
              <input type="text" value={form.one_liner} onChange={set("one_liner")} placeholder="We build AI-powered X that helps Y do Z." className="vb-input" />
            </Field>
            <Field label="Description" fullWidth>
              <textarea value={form.description} onChange={set("description")} placeholder="Describe your company, problem you solve, and why now…" className="vb-textarea" />
            </Field>
          </div>
        </FormSection>

        {/* Funding Preferences */}
        <FormSection title="Funding Preferences">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Current Stage">
              <select value={form.current_stage} onChange={set("current_stage")} className="vb-select">
                {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </Field>
            <Field label="Raise Target ($)">
              <input type="text" value={form.raise_target} onChange={set("raise_target")} placeholder="e.g. 3,000,000" className="vb-input" />
            </Field>
            <Field label="Preferred Check Size">
              <select value={form.preferred_check_size} onChange={set("preferred_check_size")} className="vb-select">
                {CHECK_SIZES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Lead Investor Needed">
              <select
                value={form.needs_lead_investor ? "yes" : "no"}
                onChange={(e) => setForm((f) => ({ ...f, needs_lead_investor: e.target.value === "yes" }))}
                className="vb-select"
              >
                <option value="yes">Yes — seeking lead</option>
                <option value="no">No — syndicate OK</option>
              </select>
            </Field>
          </div>
        </FormSection>

        {/* Niche & Filters */}
        <FormSection title="Niche & Filters">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary Sector">
              <select value={form.primary_sector} onChange={set("primary_sector")} className="vb-select">
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Secondary Sector">
              <select value={form.secondary_sector} onChange={set("secondary_sector")} className="vb-select">
                <option value="">— None —</option>
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Business Model">
              <select value={form.business_model} onChange={set("business_model")} className="vb-select">
                {BUSINESS_MODELS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Geography">
              <select value={form.geography} onChange={set("geography")} className="vb-select">
                {GEOGRAPHIES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
          </div>
        </FormSection>

        {/* Traction Metrics */}
        <FormSection title="Traction Metrics">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Current ARR ($)">
              <input type="text" value={form.current_arr} onChange={set("current_arr")} placeholder="e.g. 480,000" className="vb-input" />
            </Field>
            <Field label="MoM Growth (%)">
              <input type="text" value={form.mom_growth_pct} onChange={set("mom_growth_pct")} placeholder="e.g. 18" className="vb-input" />
            </Field>
            <Field label="Total Customers">
              <input type="text" value={form.customer_count} onChange={set("customer_count")} placeholder="e.g. 34" className="vb-input" />
            </Field>
            <Field label="Runway (Months)">
              <input type="text" value={form.runway_months} onChange={set("runway_months")} placeholder="e.g. 16" className="vb-input" />
            </Field>
          </div>
        </FormSection>

        {/* Documents */}
        <FormSection title="Pitch Deck">
          <label className="vb-label block mb-1.5">DocSend / Google Slides / Notion Link</label>
          <input
            type="text"
            value={form.pitch_deck_link}
            onChange={set("pitch_deck_link")}
            placeholder="https://docsend.com/view/..."
            className="vb-input"
          />
          <p className="text-[12px] text-vb-muted mt-2">
            Paste a shareable link to your pitch deck. Investors will access it directly.
          </p>
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

function Field({ label, children, fullWidth }: { label: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "col-span-2" : ""}`}>
      <label className="vb-label">{label.toUpperCase()}</label>
      {children}
    </div>
  );
}
