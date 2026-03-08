"use server";

import { createClient } from "@/lib/supabase/server";
import { computeMatchScore } from "@/lib/matching";
import type { FundingStage } from "@/lib/types/database";

// ── helpers ────────────────────────────────────────────────────────────────

/** "$480,000" or "480000" → cents (bigint-safe number) */
function parseToCents(val: string | undefined | null): number | null {
  if (!val) return null;
  const n = parseFloat(val.replace(/[$,\s]/g, ""));
  return isNaN(n) ? null : Math.round(n * 100);
}

/** "18%" or "18.5" → 18.5 */
function parsePct(val: string | undefined | null): number | null {
  if (!val) return null;
  const n = parseFloat(val.replace("%", "").trim());
  return isNaN(n) ? null : n;
}

/** "34 enterprise" → 34 */
function parseInt2(val: string | undefined | null): number | null {
  if (!val) return null;
  const n = parseInt(val.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? null : n;
}

// ── compute helpers ────────────────────────────────────────────────────────

async function recomputeForStartup(startupId: string) {
  const supabase = await createClient();

  const { data: startup } = await supabase
    .from("startup_profiles")
    .select("*")
    .eq("id", startupId)
    .single();

  if (!startup) return;

  const { data: vcProfiles } = await supabase
    .from("vc_profiles")
    .select("*")
    .eq("is_published", true);

  if (!vcProfiles?.length) return;

  const upserts = vcProfiles.map((vc) => {
    const scores = computeMatchScore(startup, vc);
    return { startup_id: startup.id, vc_id: vc.id, ...scores, is_active: true };
  });

  await supabase
    .from("matches")
    .upsert(upserts, { onConflict: "startup_id,vc_id" });
}

async function recomputeForVC(vcId: string) {
  const supabase = await createClient();

  const { data: vc } = await supabase
    .from("vc_profiles")
    .select("*")
    .eq("id", vcId)
    .single();

  if (!vc) return;

  const { data: startups } = await supabase
    .from("startup_profiles")
    .select("*")
    .eq("is_published", true);

  if (!startups?.length) return;

  const upserts = startups.map((startup) => {
    const scores = computeMatchScore(startup, vc);
    return { startup_id: startup.id, vc_id: vc.id, ...scores, is_active: true };
  });

  await supabase
    .from("matches")
    .upsert(upserts, { onConflict: "startup_id,vc_id" });
}

// ── public server actions ──────────────────────────────────────────────────

export interface StartupProfileFields {
  company_name: string;
  founded_year: string;
  hq_location: string;
  website: string;
  description: string;
  one_liner: string;
  current_stage: string;
  raise_target: string;
  preferred_check_size: string;
  needs_lead_investor: boolean;
  primary_sector: string;
  secondary_sector: string;
  business_model: string;
  geography: string;
  current_arr: string;
  mom_growth_pct: string;
  customer_count: string;
  runway_months: string;
  pitch_deck_link: string;
}

export async function saveStartupProfile(
  fields: StartupProfileFields
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Ensure a public.profiles row exists for this user (in case the
    // handle_new_user trigger didn't fire, e.g. migration ran after signup)
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: user.user_metadata?.full_name ?? "",
        user_type: user.user_metadata?.user_type ?? "startup",
      },
      { onConflict: "id" }
    );

    const payload = {
      user_id: user.id,
      company_name: fields.company_name || "My Startup",
      founded_year: parseInt2(fields.founded_year),
      hq_location: fields.hq_location || null,
      website: fields.website || null,
      description: fields.description || null,
      one_liner: fields.one_liner || null,
      current_stage: (fields.current_stage as FundingStage) || null,
      raise_target: parseToCents(fields.raise_target),
      preferred_check_size: fields.preferred_check_size || null,
      needs_lead_investor: fields.needs_lead_investor,
      primary_sector: fields.primary_sector || null,
      secondary_sector: fields.secondary_sector || null,
      business_model: fields.business_model || null,
      geography: fields.geography || null,
      current_arr: parseToCents(fields.current_arr),
      mom_growth_pct: parsePct(fields.mom_growth_pct),
      customer_count: parseInt2(fields.customer_count),
      runway_months: parseInt2(fields.runway_months),
      pitch_deck_link: fields.pitch_deck_link || null,
      is_published: true,
    };

    const { data: saved, error } = await supabase
      .from("startup_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("id")
      .single();

    if (error) return { error: error.message };

    // Fire-and-forget match recomputation (don't block the save response)
    if (saved?.id) {
      recomputeForStartup(saved.id).catch(() => null);
    }

    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export interface VcThesisFields {
  fund_name: string;
  fund_size: string;
  hq_city: string;
  year_founded: string;
  managing_partners: string;
  portfolio_count: string;
  thesis_statement: string;
  thesis_keywords: string[];
  primary_regions: string[];
  hq_requirement: string;
  investment_stages: string;
  typical_check_size: string;
  lead_or_follow: string;
  pro_rata_rights: string;
  min_arr: string;
  board_seat: string;
  excluded_sectors: string[];
  memo_link: string;
}

export async function saveVcThesis(
  fields: VcThesisFields
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Ensure a public.profiles row exists for this user
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: user.user_metadata?.full_name ?? "",
        user_type: user.user_metadata?.user_type ?? "vc",
      },
      { onConflict: "id" }
    );

    const payload = {
      user_id: user.id,
      fund_name: fields.fund_name || "My Fund",
      fund_size: fields.fund_size || null,
      hq_city: fields.hq_city || null,
      year_founded: parseInt2(fields.year_founded),
      managing_partners: fields.managing_partners || null,
      portfolio_count: fields.portfolio_count || null,
      thesis_statement: fields.thesis_statement || null,
      thesis_keywords: fields.thesis_keywords,
      primary_regions: fields.primary_regions,
      hq_requirement: fields.hq_requirement || null,
      investment_stages: fields.investment_stages ? [fields.investment_stages] : [],
      typical_check_size: fields.typical_check_size || null,
      lead_or_follow: fields.lead_or_follow || null,
      pro_rata_rights: fields.pro_rata_rights || null,
      min_arr: fields.min_arr || null,
      board_seat: fields.board_seat || null,
      excluded_sectors: fields.excluded_sectors,
      memo_link: fields.memo_link || null,
      is_published: true,
    };

    const { data: saved, error } = await supabase
      .from("vc_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("id")
      .single();

    if (error) return { error: error.message };

    if (saved?.id) {
      recomputeForVC(saved.id).catch(() => null);
    }

    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function submitPitch(fields: {
  company_name: string;
  stage: string;
  sector: string;
  funding_ask: string;
  one_liner: string;
  problem_solution: string;
  current_arr: string;
  mom_growth_pct: string;
  customer_count: string;
  runway_months: string;
  pitch_deck_link: string;
  target_vc_ids: string[]; // vc_profiles.id
}): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Get startup_profiles.id for this user
    const { data: sp } = await supabase
      .from("startup_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!sp) return { error: "Please save your startup profile first." };

    const pitches = fields.target_vc_ids.map((vcId) => ({
      startup_id: sp.id,
      vc_id: vcId,
      status: "matched" as const,
      company_name: fields.company_name || null,
      stage: fields.stage || null,
      sector: fields.sector || null,
      funding_ask: parseToCents(fields.funding_ask),
      one_liner: fields.one_liner || null,
      problem_solution: fields.problem_solution || null,
      arr_at_pitch: parseToCents(fields.current_arr),
      mom_growth_at_pitch: parsePct(fields.mom_growth_pct),
      customers_at_pitch: parseInt2(fields.customer_count),
      runway_at_pitch: parseInt2(fields.runway_months),
    }));

    const { error } = await supabase
      .from("pitches")
      .upsert(pitches, { onConflict: "startup_id,vc_id" });

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}
