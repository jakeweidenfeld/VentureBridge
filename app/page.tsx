"use client";

import Link from "next/link";

const LIVE_MATCHES = [
  { color: "#10b981", label: "Meridian AI ↔ a16z", score: "94%" },
  { color: "#f59e0b", label: "Stackform ↔ Accel", score: "87%" },
  { color: "#1d6ef5", label: "Neurova ↔ GV", score: "82%" },
];

const HOW_STEPS = [
  {
    num: "01",
    icon: "🏗️",
    title: "Build Your Profile",
    desc: "Create a detailed startup or investor profile — stage, sector, thesis, traction, geography, and more. The richer your profile, the smarter your matches.",
    color: "#1d6ef5",
  },
  {
    num: "02",
    icon: "⚡",
    title: "Get AI-Matched",
    desc: "Our matching engine scores every fund or startup against your profile across thesis alignment, sector fit, stage, geography, and traction benchmarks.",
    color: "#6366f1",
  },
  {
    num: "03",
    icon: "📨",
    title: "Submit Your Pitch",
    desc: "Send targeted pitches to matched funds with your deck, financials, and one-pager. Track when your deck is opened, who viewed it, and for how long.",
    color: "#f59e0b",
  },
  {
    num: "04",
    icon: "🤝",
    title: "Close the Round",
    desc: "Move from matched to term sheet with full visibility into every step. VentureBridge tracks your entire funnel from first contact to signed docs.",
    color: "#10b981",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-vb-black text-vb-text">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-[60px] bg-vb-black/90 backdrop-blur-md border-b border-vb-border">
        <div className="flex items-center gap-2 font-display text-[26px] tracking-[2px]">
          <span className="w-2 h-2 rounded-full bg-vb-amber animate-vb-pulse" />
          <span>Venture</span>
          <span className="text-vb-blue">Bridge</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#who"
            className="px-4 py-1.5 text-[13px] text-vb-muted hover:text-vb-text transition-colors"
          >
            Who It&apos;s For
          </a>
          <a
            href="#how"
            className="px-4 py-1.5 text-[13px] text-vb-muted hover:text-vb-text transition-colors"
          >
            How It Works
          </a>
          <Link
            href="/pricing"
            className="px-4 py-1.5 text-[13px] text-vb-muted hover:text-vb-text transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="px-4 py-1.5 text-[13px] text-vb-muted hover:text-vb-text transition-colors border border-transparent hover:border-vb-border rounded"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 text-[13px] bg-vb-blue text-white rounded hover:bg-vb-blue-bright transition-colors font-medium"
          >
            Sign Up Free →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col justify-center px-20 pt-[60px] overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow" />
        <div
          className="absolute inset-0 bg-vb-grid bg-grid"
          style={{
            maskImage:
              "radial-gradient(ellipse 90% 80% at 50% 50%, black 20%, transparent 80%)",
          }}
        />

        <div className="relative z-10 max-w-[780px]">
          <div className="inline-flex items-center gap-2.5 bg-vb-amber/10 border border-vb-amber/25 rounded-full px-4 py-1.5 text-[12px] font-semibold tracking-[1.5px] text-vb-amber uppercase mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-vb-amber animate-vb-pulse" />
            The AI VC Economy — Seed Round Access for Everyone
          </div>

          <h1 className="font-display text-[clamp(64px,9vw,110px)] leading-[0.92] tracking-[1px] mb-7">
            GROW YOUR
            <br />
            <span className="text-vb-blue">VENTURE.</span>
            <br />
            <span className="text-[0.65em] tracking-[2px] text-vb-text-secondary">
              FIND THE FUND THAT BELIEVES IN YOU.
            </span>
          </h1>

          <p className="text-[19px] text-vb-text-secondary leading-[1.65] max-w-[560px] mb-11 font-normal">
            VentureBridge is the smartest funnel between early-stage startups
            and the investors who are built to back them — closing the
            seed-to-Series A gap one match at a time.
          </p>

          <div className="flex items-center gap-3.5 flex-wrap">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-md bg-vb-blue text-white text-[15px] font-bold hover:bg-vb-blue-bright hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(29,110,245,0.3)] transition-all"
            >
              Get Started Free →
            </Link>
            <a
              href="#how"
              className="px-8 py-4 rounded-md bg-transparent text-vb-text text-[15px] font-semibold border-[1.5px] border-vb-border hover:border-vb-blue hover:text-vb-blue transition-all"
            >
              See How It Works
            </a>
          </div>

        </div>

        {/* Floating live-match badge */}
        <div className="absolute right-[8%] top-[30%] bg-vb-panel border border-vb-border rounded-xl p-4 flex flex-col gap-2.5 z-10 min-w-[220px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] animate-float">
          <div className="font-mono text-[9px] tracking-[2px] text-vb-muted uppercase mb-2">
            Live Match Activity
          </div>
          {LIVE_MATCHES.map((m) => (
            <div key={m.label} className="flex items-center gap-2.5 text-[13px]">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
              <span className="text-vb-text-secondary flex-1">{m.label}</span>
              <span className="font-mono text-[12px] font-bold text-vb-text">{m.score}</span>
            </div>
          ))}
          <div className="mt-2 pt-2.5 border-t border-vb-border text-[11px] text-vb-muted font-mono">
            ● 3 new matches in the last hour
          </div>
        </div>
      </section>

      {/* ── Who It's For ── */}
      <section id="who" className="px-20 py-24">
        <div className="font-mono text-[11px] tracking-[3px] text-vb-blue uppercase mb-3.5 flex items-center gap-2.5">
          <span className="w-6 h-0.5 bg-vb-blue inline-block" />
          Who It&apos;s For
        </div>
        <h2 className="font-display text-[clamp(40px,5vw,64px)] leading-none tracking-[1px] mb-4">
          BUILT FOR BOTH SIDES
          <br />
          OF THE TABLE
        </h2>
        <p className="text-[17px] text-vb-text-secondary leading-[1.7] max-w-[560px] mb-14">
          Whether you&apos;re a founder hunting for your first institutional check,
          or a fund searching for the next breakout company — VentureBridge was
          built for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl p-9 border-[1.5px] border-vb-blue/25 bg-gradient-to-br from-vb-blue/12 to-vb-blue/[0.04] hover:-translate-y-1 transition-transform">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-display text-[32px] tracking-[1px] mb-3 text-vb-blue-bright">For Startups</h3>
            <p className="text-[15px] text-vb-text-secondary leading-[1.7] mb-6">
              Early-stage founders navigating the seed crunch, trying to find funds
              that actually align with their vision, stage, and sector — without
              cold emailing into the void.
            </p>
            <ul className="flex flex-col gap-2.5 mb-7">
              {[
                "Get matched to funds based on your thesis, sector, and ARR — not just a warm intro",
                "Track every pitch in a live pipeline with deck-view analytics",
                "Understand exactly what each fund needs before you reach out",
                "Move from seed to Series A with confidence and a clear roadmap",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-vb-text leading-[1.5]">
                  <span className="font-mono text-[12px] text-vb-blue mt-0.5 flex-shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup?type=startup" className="inline-block px-6 py-2.5 bg-vb-blue text-white text-sm font-semibold rounded hover:bg-vb-blue-bright transition-colors">
              Apply as a Startup →
            </Link>
          </div>

          <div className="rounded-xl p-9 border-[1.5px] border-vb-amber/25 bg-gradient-to-br from-vb-amber/10 to-vb-amber/[0.03] hover:-translate-y-1 transition-transform">
            <div className="text-4xl mb-4">🏦</div>
            <h3 className="font-display text-[32px] tracking-[1px] mb-3 text-vb-amber">For Investors</h3>
            <p className="text-[15px] text-vb-text-secondary leading-[1.7] mb-6">
              VCs and fund managers who want high-quality, thesis-matched deal flow —
              without drowning in off-target pitches or spending months on sourcing.
            </p>
            <ul className="flex flex-col gap-2.5 mb-7">
              {[
                "Set your exact thesis, geography, stage, and niche — we filter everything else out",
                "See inbound deals pre-scored to your fund's specific criteria",
                "Review decks, metrics, and team info in one unified deal inbox",
                "Build a curated pipeline of high-conviction seed investments faster",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-vb-text leading-[1.5]">
                  <span className="font-mono text-[12px] text-vb-amber mt-0.5 flex-shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/apply" className="inline-block px-6 py-2.5 bg-vb-amber text-vb-black text-sm font-semibold rounded hover:bg-amber-400 transition-colors">
              Join as an Investor →
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="px-20 py-24 bg-vb-navy border-t border-b border-vb-border">
        <div className="text-center mb-16">
          <div className="font-mono text-[11px] tracking-[3px] text-vb-blue uppercase mb-3.5 flex items-center justify-center gap-2.5">
            <span className="w-6 h-0.5 bg-vb-blue inline-block" />
            How It Works
          </div>
          <h2 className="font-display text-[clamp(40px,5vw,64px)] leading-none tracking-[1px] mb-4">
            FROM PROFILE TO FUNDED
            <br />
            <span className="text-vb-blue">IN FOUR STEPS</span>
          </h2>
          <p className="text-[17px] text-vb-text-secondary leading-[1.7] max-w-[560px] mx-auto">
            No guessing. No spray-and-pray. Just a clear, structured path from your first pitch to a signed term sheet.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 relative">
          <div className="absolute top-8 left-[12.5%] right-[12.5%] h-0.5" style={{ background: "linear-gradient(90deg, #1d6ef5, #f59e0b)" }} />
          {HOW_STEPS.map((step) => (
            <div key={step.num} className="text-center px-5 relative z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 bg-vb-panel font-display text-[26px] border-2"
                style={{ borderColor: step.color, color: step.color }}
              >
                {step.num}
              </div>
              <div className="text-[22px] mb-1.5">{step.icon}</div>
              <h3 className="text-base font-bold mb-2 text-vb-text">{step.title}</h3>
              <p className="text-sm text-vb-text-secondary leading-[1.6]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Meet the Team ── */}
      <section className="px-20 py-24 border-t border-vb-border">
        <div className="font-mono text-[11px] tracking-[3px] text-vb-blue uppercase mb-3.5 flex items-center gap-2.5">
          <span className="w-6 h-0.5 bg-vb-blue inline-block" />
          The Team
        </div>
        <h2 className="font-display text-[clamp(40px,5vw,64px)] leading-none tracking-[1px] mb-4">
          MEET THE BUILDERS
        </h2>
        <p className="text-[17px] text-vb-text-secondary leading-[1.7] max-w-[500px] mb-14">
          The people behind VentureBridge — building the infrastructure for the next generation of venture.
        </p>
        <div className="flex flex-wrap gap-5">
          {[
            { name: "Jake Weidenfeld", initials: "JW" },
            { name: "Elliot Bolour", initials: "EB" },
            { name: "Samuel Joe", initials: "SJ" },
            { name: "Nate Mitleman", initials: "NM" },
            { name: "Noam Altman", initials: "NA" },
          ].map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-3.5 bg-vb-panel border border-vb-border rounded-xl px-5 py-4 hover:border-vb-blue/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-vb-blue/15 border border-vb-blue/30 flex items-center justify-center font-mono text-[12px] font-bold text-vb-blue-bright flex-shrink-0">
                {member.initials}
              </div>
              <span className="text-[15px] font-medium text-vb-text">{member.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-20 py-24 text-center">
        <h2 className="font-display text-[clamp(40px,5vw,72px)] leading-none mb-6">
          READY TO CLOSE
          <br />
          <span className="text-vb-blue">YOUR ROUND?</span>
        </h2>
        <p className="text-[17px] text-vb-text-secondary mb-10 max-w-md mx-auto leading-[1.7]">
          Join the platform built to connect the right founders with the right funds. It&apos;s free to start.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/signup?type=startup" className="px-8 py-4 bg-vb-blue text-white text-[15px] font-bold rounded-md hover:bg-vb-blue-bright hover:-translate-y-0.5 transition-all">
            Apply as a Startup
          </Link>
          <Link href="/apply" className="px-8 py-4 bg-vb-amber text-vb-black text-[15px] font-bold rounded-md hover:bg-amber-400 hover:-translate-y-0.5 transition-all">
            Join as an Investor
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-vb-navy border-t border-vb-border px-20 py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-[22px] tracking-[2px]">
            <span className="w-2 h-2 rounded-full bg-vb-amber inline-block" />
            <span>Venture</span>
            <span className="text-vb-blue">Bridge</span>
          </div>
          <div className="text-sm text-vb-muted">© 2025 VentureBridge, Inc. All rights reserved.</div>
          <div className="flex gap-5 text-sm">
            <a href="#" className="text-vb-muted hover:text-vb-text transition-colors">Privacy Policy</a>
            <a href="#" className="text-vb-muted hover:text-vb-text transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
