export type UserType = "startup" | "vc";

export type FundingStage =
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "series-c";

export type PitchStatus =
  | "matched"
  | "intro_sent"
  | "under_review"
  | "partner_call"
  | "term_sheet"
  | "closed"
  | "passed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
      };
      startup_profiles: {
        Row: StartupProfile;
        Insert: StartupProfileInsert;
        Update: Partial<StartupProfileInsert>;
      };
      vc_profiles: {
        Row: VcProfile;
        Insert: VcProfileInsert;
        Update: Partial<VcProfileInsert>;
      };
      pitches: {
        Row: Pitch;
        Insert: PitchInsert;
        Update: Partial<PitchInsert>;
      };
      matches: {
        Row: Match;
        Insert: MatchInsert;
        Update: Partial<MatchInsert>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_type: UserType;
      funding_stage: FundingStage;
      pitch_status: PitchStatus;
    };
  };
}

// ── Profiles ──────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  user_type: UserType;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at">;

// ── Startup Profiles ───────────────────────────────────────────────────────

export interface StartupProfile {
  id: string;
  user_id: string;
  company_name: string;
  founded_year: number | null;
  hq_location: string | null;
  website: string | null;
  description: string | null;
  one_liner: string | null;
  // Funding preferences
  current_stage: FundingStage | null;
  raise_target: number | null;
  preferred_check_size: string | null;
  needs_lead_investor: boolean;
  // Niche
  primary_sector: string | null;
  secondary_sector: string | null;
  business_model: string | null;
  geography: string | null;
  // Traction metrics
  current_arr: number | null;
  mom_growth_pct: number | null;
  customer_count: number | null;
  runway_months: number | null;
  // Documents
  pitch_deck_url: string | null;
  pitch_deck_link: string | null;
  financial_model_url: string | null;
  // Status
  is_published: boolean;
  match_score: number | null;
  created_at: string;
  updated_at: string;
}

export type StartupProfileInsert = Omit<
  StartupProfile,
  "id" | "created_at" | "updated_at"
>;

// ── VC Profiles ────────────────────────────────────────────────────────────

export interface VcProfile {
  id: string;
  user_id: string;
  fund_name: string;
  fund_size: string | null;
  hq_city: string | null;
  year_founded: number | null;
  managing_partners: string | null;
  portfolio_count: string | null;
  // Thesis
  thesis_statement: string | null;
  thesis_keywords: string[];
  // Geographic focus
  primary_regions: string[];
  hq_requirement: string | null;
  // Deal preferences
  investment_stages: string[];
  typical_check_size: string | null;
  lead_or_follow: string | null;
  pro_rata_rights: string | null;
  min_arr: string | null;
  board_seat: string | null;
  // Exclusions
  excluded_sectors: string[];
  // Documents
  fund_deck_url: string | null;
  memo_url: string | null;
  memo_link: string | null;
  // Status
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type VcProfileInsert = Omit<
  VcProfile,
  "id" | "created_at" | "updated_at"
>;

// ── Pitches ───────────────────────────────────────────────────────────────

export interface Pitch {
  id: string;
  startup_id: string;
  vc_id: string;
  status: PitchStatus;
  // Pitch content snapshot
  company_name: string | null;
  stage: string | null;
  sector: string | null;
  funding_ask: number | null;
  one_liner: string | null;
  problem_solution: string | null;
  // Traction at pitch time
  arr_at_pitch: number | null;
  mom_growth_at_pitch: number | null;
  customers_at_pitch: number | null;
  runway_at_pitch: number | null;
  // Deck analytics
  deck_viewed_at: string | null;
  deck_view_count: number;
  deck_total_seconds: number;
  // Metadata
  submitted_at: string;
  last_updated_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type PitchInsert = Omit<
  Pitch,
  "id" | "created_at" | "updated_at" | "submitted_at" | "last_updated_at"
>;

// ── Matches ───────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  startup_id: string;
  vc_id: string;
  // Match scores
  overall_score: number;
  thesis_score: number | null;
  sector_score: number | null;
  stage_score: number | null;
  geography_score: number | null;
  traction_score: number | null;
  // Status
  is_active: boolean;
  startup_dismissed: boolean;
  vc_dismissed: boolean;
  // Timestamps
  computed_at: string;
  created_at: string;
  updated_at: string;
}

export type MatchInsert = Omit<
  Match,
  "id" | "created_at" | "updated_at" | "computed_at"
>;

// ── Joined / view types ───────────────────────────────────────────────────

export interface MatchWithVc extends Match {
  vc_profiles: VcProfile;
}

export interface MatchWithStartup extends Match {
  startup_profiles: StartupProfile;
}

export interface PitchWithVc extends Pitch {
  vc_profiles: VcProfile;
}

export interface PitchWithStartup extends Pitch {
  startup_profiles: StartupProfile;
}
