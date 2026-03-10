import Link from "next/link";

const PLANS = [
  {
    badge: "Individual",
    badgeColor: "blue" as const,
    emoji: "👤",
    title: "Angel Investor",
    subtitle: "Source and close quality deals faster. Built for angels writing $10K–$500K checks who move on conviction.",
    price: "$1,000",
    period: "/month",
    priceNote: null,
    cta: "Apply as Individual →",
    ctaHref: "/apply",
    featured: false,
    sections: [
      {
        heading: "DEAL FLOW",
        items: [
          "Matching founders based on investment thesis",
          "Basic company profiles & founder bios",
          "Filter by sector, stage, and geography",
          "Direct founder messaging",
        ],
      },
      {
        heading: "PORTFOLIO & NETWORK",
        items: [
          "Co-investor discovery for syndication",
          "Public investor profile for inbound deal flow",
        ],
      },
    ],
  },
  {
    badge: "PLUS · PRE-SEED → SERIES A",
    badgeColor: "amber" as const,
    emoji: "🏦",
    title: "Early-Stage Fund",
    subtitle: "Systematize sourcing and diligence. For funds deploying $500K–$5M checks across an active portfolio.",
    price: "Flexible",
    period: " plans",
    priceNote: "Tailored to fund size & team seats",
    cta: "Apply as a Fund →",
    ctaHref: "/apply",
    featured: true,
    sections: [
      {
        heading: "DEAL FLOW",
        items: [
          "Unlimited founder matches for up to 10 active roles",
          "AI-ranked deal flow based on your thesis",
          "Direct founder messaging",
          "Promoted fund profile to founders in your thesis",
        ],
      },
      {
        heading: "DILIGENCE & OPERATIONS",
        items: [
          "Collaborate and share across up to 10 active members",
          "Deal pipeline with stage tracking",
          "Public investor profile for inbound deal flow",
          "Basic portfolio analytics dashboard",
        ],
      },
    ],
  },
  {
    badge: "SERIES B+ · INSTITUTIONAL",
    badgeColor: "purple" as const,
    emoji: "🏛️",
    title: "Institutional Fund",
    subtitle: "Deploy capital at scale with AI-powered sourcing, deep diligence infrastructure, and LP-ready reporting for funds with check sizes over $5M.",
    price: "Annual billing",
    period: "",
    priceNote: "Based on AUM",
    cta: "Contact Us →",
    ctaHref: "mailto:team@venturebridge.vc",
    featured: false,
    sections: [
      {
        heading: "DEAL FLOW AT SCALE",
        items: [
          "Unlimited founder matches across all active mandates",
          "Advanced filters: traction metrics, founder pedigree, cap table, geography",
          "Unlimited outreach with AI-personalized messaging",
          "Startups funneled from early-stage funds to institutional fund",
          "Proprietary deal flow via VentureBridge network exclusives",
        ],
      },
      {
        heading: "DILIGENCE INFRASTRUCTURE",
        items: [
          "AI diligence summaries & red flag detection",
          "Comparable deal benchmarking (valuation, terms)",
        ],
      },
      {
        heading: "TEAM & LP OPERATIONS",
        items: [
          "Licenses for up to 40 team members with role-based access",
          "LP-ready portfolio reporting & activity logs",
          "CRM integrations (Salesforce, Affinity, Notion)",
          "API access & custom data exports",
        ],
      },
    ],
  },
];

const BADGE_STYLES = {
  blue:   "bg-vb-blue/10 border-vb-blue/30 text-vb-blue-bright",
  amber:  "bg-vb-amber/15 border-vb-amber/40 text-vb-amber",
  purple: "bg-purple-500/10 border-purple-500/30 text-purple-300",
};

const CHECK_STYLES = {
  blue:   "text-vb-blue",
  amber:  "text-vb-amber",
  purple: "text-purple-400",
};

const CTA_STYLES = {
  blue:   "bg-vb-blue text-white hover:bg-vb-blue-bright hover:shadow-[0_8px_24px_rgba(29,110,245,0.3)]",
  amber:  "bg-vb-amber text-vb-black hover:bg-amber-400 hover:shadow-[0_8px_24px_rgba(245,158,11,0.3)]",
  purple: "bg-purple-600 text-white hover:bg-purple-500 hover:shadow-[0_8px_24px_rgba(147,51,234,0.3)]",
};

const CARD_STYLES = {
  blue:   "border-vb-border bg-vb-panel",
  amber:  "border-vb-amber/40 bg-gradient-to-b from-vb-amber/[0.06] to-vb-panel",
  purple: "border-purple-500/30 bg-gradient-to-b from-purple-500/[0.05] to-vb-panel",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-vb-black text-vb-text">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-[60px] bg-vb-black/90 backdrop-blur-md border-b border-vb-border">
        <Link href="/" className="flex items-center gap-2 font-display text-[26px] tracking-[2px] text-vb-text no-underline">
          <span className="w-2 h-2 rounded-full bg-vb-amber animate-vb-pulse" />
          <span>Venture</span>
          <span className="text-vb-blue">Bridge</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/" className="px-4 py-1.5 text-[13px] text-vb-muted hover:text-vb-text transition-colors">
            ← Home
          </Link>
          <Link href="/login" className="px-4 py-1.5 text-[13px] text-vb-muted hover:text-vb-text transition-colors border border-transparent hover:border-vb-border rounded">
            Log In
          </Link>
          <Link href="/signup" className="px-4 py-1.5 text-[13px] bg-vb-blue text-white rounded hover:bg-vb-blue-bright transition-colors font-medium">
            Sign Up Free →
          </Link>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="pt-[60px]">
        <div className="px-8 py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow opacity-40" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-vb-blue/10 border border-vb-blue/25 rounded-full px-4 py-1.5 text-[11px] font-mono font-semibold tracking-[1.5px] text-vb-blue uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-vb-blue animate-vb-pulse" />
              Investor Pricing
            </div>
            <h1 className="font-display text-[clamp(48px,7vw,88px)] leading-[0.92] tracking-[1px] mb-5">
              INVEST SMARTER.
              <br />
              <span className="text-vb-blue">CLOSE FASTER.</span>
            </h1>
            <p className="text-[18px] text-vb-text-secondary leading-[1.7] max-w-[560px] mx-auto">
              Every plan is designed for a different stage of your investing journey.
              From solo angels to institutional funds — VentureBridge scales with you.
            </p>
          </div>
        </div>

        {/* ── Pricing Cards ── */}
        <div className="px-8 pb-24">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan) => (
              <div
                key={plan.title}
                className={`relative rounded-2xl border p-8 flex flex-col ${CARD_STYLES[plan.badgeColor]} ${plan.featured ? "ring-1 ring-vb-amber/40 scale-[1.02]" : ""}`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-vb-amber text-vb-black text-[11px] font-bold font-mono tracking-[1.5px] uppercase px-4 py-1 rounded-full whitespace-nowrap">
                    ✦ Most Popular
                  </div>
                )}

                {/* Badge */}
                <div className={`inline-flex items-center self-start px-2.5 py-1 rounded border text-[10px] font-mono font-semibold tracking-[1.5px] uppercase mb-4 ${BADGE_STYLES[plan.badgeColor]}`}>
                  {plan.badge}
                </div>

                {/* Title block */}
                <div className="mb-6">
                  <div className="text-3xl mb-2">{plan.emoji}</div>
                  <h2 className="font-display text-[26px] tracking-[1px] mb-2">{plan.title}</h2>
                  <p className="text-[13px] text-vb-text-secondary leading-[1.65]">{plan.subtitle}</p>
                </div>

                {/* Price */}
                <div className="mb-7 pb-7 border-b border-vb-border">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-[36px] tracking-[1px]">{plan.price}</span>
                    {plan.period && (
                      <span className="text-[14px] text-vb-muted">{plan.period}</span>
                    )}
                  </div>
                  {plan.priceNote && (
                    <div className="text-[12px] text-vb-muted font-mono mt-1">{plan.priceNote}</div>
                  )}
                </div>

                {/* Feature sections */}
                <div className="flex flex-col gap-6 flex-1 mb-8">
                  {plan.sections.map((section) => (
                    <div key={section.heading}>
                      <div className="font-mono text-[10px] tracking-[2px] text-vb-muted uppercase mb-3 flex items-center gap-2">
                        <span className="w-4 h-px bg-vb-border inline-block" />
                        {section.heading}
                      </div>
                      <ul className="flex flex-col gap-2.5">
                        {section.items.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-[13px] text-vb-text leading-[1.5]">
                            <span className={`mt-0.5 flex-shrink-0 text-[14px] font-bold ${CHECK_STYLES[plan.badgeColor]}`}>✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {plan.ctaHref.startsWith("mailto:") ? (
                  <a
                    href={plan.ctaHref}
                    className={`w-full py-3.5 rounded-lg text-[14px] font-bold text-center transition-all hover:-translate-y-0.5 ${CTA_STYLES[plan.badgeColor]}`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className={`w-full py-3.5 rounded-lg text-[14px] font-bold text-center transition-all hover:-translate-y-0.5 block ${CTA_STYLES[plan.badgeColor]}`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ row ── */}
        <div className="border-t border-vb-border px-8 py-16 bg-vb-navy">
          <div className="max-w-[860px] mx-auto">
            <h2 className="font-display text-[32px] tracking-[1px] mb-10 text-center">Common Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  q: "Do startups pay anything?",
                  a: "No. VentureBridge is completely free for founders. Investors pay to access curated, matched deal flow.",
                },
                {
                  q: "How does the approval process work?",
                  a: "Every investor application is reviewed by our team before access is granted. We verify fund credentials and investment activity to keep deal quality high.",
                },
                {
                  q: "Can I upgrade or downgrade my plan?",
                  a: "Yes. You can move between Individual and Plus at any time. Institutional plans are negotiated annually.",
                },
                {
                  q: "What counts as an 'active role'?",
                  a: "An active role is an investment mandate you're actively sourcing for — e.g. a Series A SaaS deal in fintech.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="text-vb-blue font-bold mt-0.5 flex-shrink-0">?</span>
                    <span className="text-[15px] font-semibold text-vb-text">{q}</span>
                  </div>
                  <p className="text-[13px] text-vb-text-secondary leading-[1.65] pl-5">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="bg-vb-black border-t border-vb-border px-10 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-[20px] tracking-[2px]">
            <span className="w-2 h-2 rounded-full bg-vb-amber inline-block" />
            <span>Venture</span>
            <span className="text-vb-blue">Bridge</span>
          </div>
          <div className="text-[12px] text-vb-muted font-mono">
            © {new Date().getFullYear()} VentureBridge · All rights reserved
          </div>
        </footer>
      </div>
    </div>
  );
}
