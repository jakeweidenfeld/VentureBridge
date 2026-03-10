"use server";

import { createClient } from "@/lib/supabase/server";

export interface InvestorApplicationFields {
  fund_name: string;
  fund_size: string;
  typical_check_size: string;
  investment_stages: string[];
  year_founded: string;
  hq_city: string;
  thesis_keywords: string[];  // used as sector focus
  thesis_statement: string;
}

export async function applyAsInvestor(
  fields: InvestorApplicationFields
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated. Please log in and try again." };

    // Ensure public.profiles row exists for this user
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: user.user_metadata?.full_name ?? "",
        user_type: "vc",
      },
      { onConflict: "id" }
    );

    const yearNum = fields.year_founded ? parseInt(fields.year_founded, 10) : null;

    const { error } = await supabase.from("vc_profiles").upsert(
      {
        user_id: user.id,
        fund_name: fields.fund_name.trim(),
        fund_size: fields.fund_size || null,
        typical_check_size: fields.typical_check_size || null,
        investment_stages: fields.investment_stages,
        year_founded: !isNaN(yearNum as number) ? yearNum : null,
        hq_city: fields.hq_city || null,
        thesis_keywords: fields.thesis_keywords,
        thesis_statement: fields.thesis_statement || null,
        primary_regions: [],
        excluded_sectors: [],
        // is_published stays false until manually approved by admin
        is_published: false,
      },
      { onConflict: "user_id" }
    );

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}
