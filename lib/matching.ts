import type { StartupProfile, VcProfile } from "@/lib/types/database";

export interface MatchScores {
  overall_score: number;
  thesis_score: number;
  sector_score: number;
  stage_score: number;
  geography_score: number;
  traction_score: number;
}

// ── Sector/keyword mappings ────────────────────────────────────────────────

/** Maps VC thesis keywords → startup sector label aliases (all lowercase) */
const KEYWORD_SECTOR_MAP: Record<string, string[]> = {
  "AI-first":          ["ai / ml", "ai/ml", "artificial intelligence", "machine learning"],
  "Infrastructure":    ["infrastructure / cloud", "cloud", "devops", "platform", "developer tools"],
  "Category-defining": [],
  "Deep Tech":         ["deep tech", "hardware / robotics", "space tech", "semiconductors"],
  "Marketplace":       ["marketplace", "e-commerce"],
  "Consumer":          ["consumer", "social / media", "gaming", "foodtech"],
  "Developer Tools":   ["developer tools", "dev tools", "api"],
  "Vertical SaaS":     ["saas", "enterprise software", "b2b saas"],
  "Fintech":           ["fintech", "insurtech", "regtech"],
  "Bio / Health":      ["healthtech", "biotech"],
  "Climate Tech":      ["climate tech"],
  "Defense Tech":      ["defense tech", "govtech"],
  "EdTech":            ["edtech"],
  "PropTech":          ["proptech"],
  "Cybersecurity":     ["cybersecurity"],
  "Robotics":          ["hardware / robotics", "robotics"],
  "AdTech":            ["adtech / martech"],
  "GovTech":           ["govtech", "defense tech"],
  "Space Tech":        ["space tech"],
  "Web3":              ["web3 / crypto"],
  "Enterprise":        ["enterprise software", "saas", "b2b saas"],
};

/** Maps VC exclusion labels → startup sector aliases (hard block) */
const EXCLUSION_SECTOR_MAP: Record<string, string[]> = {
  "Crypto / Web3":         ["web3 / crypto"],
  "Pre-revenue hardware":  ["hardware / robotics"],
  "E-commerce":            ["e-commerce", "marketplace"],
  "Brick & Mortar":        [],
  "Non-tech services":     [],
  "Gambling / iGaming":    ["gaming"],
  "Adult content":         [],
  "Biotech":               ["biotech"],
  "EdTech":                ["edtech"],
  "Media":                 ["social / media"],
  "Gaming":                ["gaming"],
  "AgriTech":              ["agritech"],
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Parse min ARR string like "$100K+", "$500K+", "$0 — idea stage OK"
 * Returns threshold in USD cents.
 */
function parseMinArrCents(minArrStr: string | null): number {
  if (!minArrStr) return 0;
  const lower = minArrStr.toLowerCase();
  if (lower.includes("idea") || lower.startsWith("$0")) return 0;
  const m = lower.match(/\$?([\d.]+)\s*(k|m)?/);
  if (!m) return 0;
  const num = parseFloat(m[1]);
  const mult = m[2] === "m" ? 1_000_000 : m[2] === "k" ? 1_000 : 1;
  return Math.round(num * mult * 100); // cents
}

/**
 * Expand VC investment stage text values (e.g. "Seed + Series A")
 * into normalised funding_stage enum values.
 */
function expandVcStages(stages: string[]): string[] {
  const result = new Set<string>();
  for (const s of stages) {
    const lower = s.toLowerCase();
    if (lower.includes("pre-seed") || lower.includes("pre seed")) result.add("pre-seed");
    if (lower.includes("seed") && !lower.includes("pre")) result.add("seed");
    if (lower.includes("series a") || lower.includes("series-a")) result.add("series-a");
    if (lower.includes("series b") || lower.includes("series-b")) result.add("series-b");
    if (lower.includes("series c") || lower.includes("series-c")) result.add("series-c");
    if (lower.includes("all stages") || lower.includes("all")) {
      ["pre-seed", "seed", "series-a", "series-b", "series-c"].forEach(s2 => result.add(s2));
    }
  }
  return [...result];
}

/** Strip emoji + normalize a geo region string for comparison */
function normalizeGeo(s: string): string {
  return s
    .replace(/[\u{1F1E0}-\u{1F1FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .toLowerCase()
    .trim();
}

// ── Core algorithm ─────────────────────────────────────────────────────────

export function computeMatchScore(startup: StartupProfile, vc: VcProfile): MatchScores {
  const sectorNorm     = (startup.primary_sector   ?? "").toLowerCase();
  const secondaryNorm  = (startup.secondary_sector ?? "").toLowerCase();
  const descNorm       = (startup.description      ?? "").toLowerCase();
  const oneLinerNorm   = (startup.one_liner         ?? "").toLowerCase();
  const geoNorm        = (startup.geography         ?? "").toLowerCase();
  const corpusText     = `${sectorNorm} ${secondaryNorm} ${descNorm} ${oneLinerNorm}`;

  // ── 1. Stage Score (0 | 100) ─────────────────────────────────────────────
  let stage_score = 50; // default: no data
  if (startup.current_stage) {
    const vcStages = expandVcStages(vc.investment_stages ?? []);
    if (vcStages.length === 0) {
      stage_score = 65; // VC has no preference — neutral
    } else {
      stage_score = vcStages.includes(startup.current_stage) ? 100 : 0;
    }
  }

  // ── 2. Sector Score (0–100) ──────────────────────────────────────────────
  let sector_score = 55;

  // Check hard exclusions first
  const excluded = (vc.excluded_sectors ?? []);
  for (const excl of excluded) {
    const aliases = EXCLUSION_SECTOR_MAP[excl] ?? [excl.toLowerCase()];
    if (aliases.some(a => a && (sectorNorm.includes(a) || secondaryNorm.includes(a)))) {
      sector_score = 0;
      break;
    }
  }

  if (sector_score > 0) {
    const keywords = vc.thesis_keywords ?? [];
    if (keywords.length === 0) {
      sector_score = 65;
    } else {
      let matchCount = 0;
      for (const kw of keywords) {
        const aliases = KEYWORD_SECTOR_MAP[kw] ?? [kw.toLowerCase()];
        if (aliases.some(a => a && (sectorNorm.includes(a) || secondaryNorm.includes(a)))) {
          matchCount++;
        }
      }
      // Scale: 0/n=30, 100%=100
      sector_score = Math.round(30 + (matchCount / keywords.length) * 70);
    }
  }

  // ── 3. Geography Score (0–100) ───────────────────────────────────────────
  let geography_score = 65;
  const vcRegions = (vc.primary_regions ?? []).map(normalizeGeo).filter(Boolean);

  if (vcRegions.length === 0) {
    geography_score = 75; // no geo preference
  } else if (vcRegions.some(r => r.includes("global") || r.includes("worldwide") || r.includes("remote"))) {
    geography_score = 90;
  } else {
    const startupGeoTokens = geoNorm.split(/[\s,/]+/).filter(s => s.length > 2);
    const matched = vcRegions.some(r => {
      // "united states" ↔ "us"
      if ((r.includes("united states") || r.includes("us")) && (geoNorm.includes("us") || geoNorm.includes("united states"))) return true;
      return startupGeoTokens.some(t => r.includes(t) || t.includes(r));
    });
    geography_score = matched ? 100 : 35;
  }

  // ── 4. Traction Score (0–100) ────────────────────────────────────────────
  let traction_score = 65;
  const minArrCents = parseMinArrCents(vc.min_arr);
  if (minArrCents === 0) {
    traction_score = 85; // no ARR requirement — good fit
  } else if (startup.current_arr !== null) {
    if (startup.current_arr >= minArrCents) {
      traction_score = 100;
    } else {
      const ratio = startup.current_arr / minArrCents;
      traction_score = Math.round(Math.max(10, ratio * 100));
    }
  }

  // ── 5. Thesis Score (keyword overlap with full text corpus) ──────────────
  let thesis_score = 45;
  const keywords = vc.thesis_keywords ?? [];
  if (keywords.length === 0) {
    thesis_score = 60;
  } else {
    let matchCount = 0;
    for (const kw of keywords) {
      const kwNorm = kw.toLowerCase().replace(/\s*\/\s*/g, " / ");
      const aliases = KEYWORD_SECTOR_MAP[kw] ?? [];
      const directHit = corpusText.includes(kwNorm);
      const aliasHit  = aliases.some(a => a && corpusText.includes(a));
      if (directHit || aliasHit) matchCount++;
    }
    thesis_score = Math.round(20 + (matchCount / keywords.length) * 80);
  }

  // ── Overall Score (weighted average) ─────────────────────────────────────
  const overall_score = Math.round(
    stage_score     * 0.25 +
    thesis_score    * 0.25 +
    sector_score    * 0.20 +
    geography_score * 0.15 +
    traction_score  * 0.15,
  );

  const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

  return {
    overall_score:    clamp(overall_score),
    thesis_score:     clamp(thesis_score),
    sector_score:     clamp(sector_score),
    stage_score:      clamp(stage_score),
    geography_score:  clamp(geography_score),
    traction_score:   clamp(traction_score),
  };
}
