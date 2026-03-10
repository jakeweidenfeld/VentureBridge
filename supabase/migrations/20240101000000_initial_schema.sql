-- ═══════════════════════════════════════════════════════════
-- VentureBridge — Initial Database Schema
-- ═══════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- for full-text search on startup/vc names

-- ── Enums ──────────────────────────────────────────────────

CREATE TYPE user_type AS ENUM ('startup', 'vc');

CREATE TYPE funding_stage AS ENUM ('pre-seed', 'seed', 'series-a', 'series-b', 'series-c');

CREATE TYPE pitch_status AS ENUM (
  'matched',
  'intro_sent',
  'under_review',
  'partner_call',
  'term_sheet',
  'closed',
  'passed'
);

-- ── profiles ───────────────────────────────────────────────
-- Extends Supabase auth.users with app-level profile data.

CREATE TABLE public.profiles (
  id           UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email        TEXT        NOT NULL,
  full_name    TEXT,
  user_type    user_type   NOT NULL,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-populate profiles on new Supabase Auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::public.user_type, 'startup'::public.user_type)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── startup_profiles ───────────────────────────────────────

CREATE TABLE public.startup_profiles (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Company identity
  company_name          TEXT          NOT NULL,
  founded_year          INTEGER       CHECK (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM NOW()) + 1),
  hq_location           TEXT,
  website               TEXT,
  description           TEXT,
  one_liner             TEXT,

  -- Funding preferences
  current_stage         funding_stage,
  raise_target          BIGINT        CHECK (raise_target > 0),   -- in USD cents
  preferred_check_size  TEXT,
  needs_lead_investor   BOOLEAN       NOT NULL DEFAULT TRUE,

  -- Niche & filters
  primary_sector        TEXT,
  secondary_sector      TEXT,
  business_model        TEXT,
  geography             TEXT,

  -- Traction metrics
  current_arr           BIGINT        CHECK (current_arr >= 0),   -- in USD cents
  mom_growth_pct        NUMERIC(6,2),
  customer_count        INTEGER       CHECK (customer_count >= 0),
  runway_months         INTEGER       CHECK (runway_months >= 0),

  -- Documents
  pitch_deck_url        TEXT,
  pitch_deck_link       TEXT,         -- DocSend / Google Slides URL
  financial_model_url   TEXT,

  -- Status
  is_published          BOOLEAN       NOT NULL DEFAULT FALSE,
  match_score           NUMERIC(5,2)  CHECK (match_score >= 0 AND match_score <= 100),

  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE (user_id)  -- one startup profile per user
);

CREATE INDEX idx_startup_profiles_user_id ON public.startup_profiles(user_id);
CREATE INDEX idx_startup_profiles_stage   ON public.startup_profiles(current_stage);
CREATE INDEX idx_startup_profiles_sector  ON public.startup_profiles(primary_sector);
CREATE INDEX idx_startup_profiles_arr     ON public.startup_profiles(current_arr);

-- ── vc_profiles ────────────────────────────────────────────

CREATE TABLE public.vc_profiles (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Fund identity
  fund_name           TEXT        NOT NULL,
  fund_size           TEXT,
  hq_city             TEXT,
  year_founded        INTEGER     CHECK (year_founded >= 1900),
  managing_partners   TEXT,
  portfolio_count     TEXT,

  -- Investment thesis
  thesis_statement    TEXT,
  thesis_keywords     TEXT[]      NOT NULL DEFAULT '{}',

  -- Geographic focus
  primary_regions     TEXT[]      NOT NULL DEFAULT '{}',
  hq_requirement      TEXT,

  -- Deal preferences
  investment_stages   TEXT[]      NOT NULL DEFAULT '{}',
  typical_check_size  TEXT,
  lead_or_follow      TEXT,
  pro_rata_rights     TEXT,
  min_arr             TEXT,
  board_seat          TEXT,

  -- Sector exclusions
  excluded_sectors    TEXT[]      NOT NULL DEFAULT '{}',

  -- Documents
  fund_deck_url       TEXT,
  memo_url            TEXT,
  memo_link           TEXT,

  -- Status
  is_published        BOOLEAN     NOT NULL DEFAULT FALSE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id)  -- one VC profile per user
);

CREATE INDEX idx_vc_profiles_user_id     ON public.vc_profiles(user_id);
CREATE INDEX idx_vc_profiles_keywords    ON public.vc_profiles USING GIN(thesis_keywords);
CREATE INDEX idx_vc_profiles_regions     ON public.vc_profiles USING GIN(primary_regions);
CREATE INDEX idx_vc_profiles_stages      ON public.vc_profiles USING GIN(investment_stages);
CREATE INDEX idx_vc_profiles_exclusions  ON public.vc_profiles USING GIN(excluded_sectors);

-- ── pitches ────────────────────────────────────────────────

CREATE TABLE public.pitches (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id            UUID          NOT NULL REFERENCES public.startup_profiles(id) ON DELETE CASCADE,
  vc_id                 UUID          NOT NULL REFERENCES public.vc_profiles(id) ON DELETE CASCADE,

  -- Pipeline status
  status                pitch_status  NOT NULL DEFAULT 'matched',

  -- Pitch content snapshot at submission time
  company_name          TEXT,
  stage                 TEXT,
  sector                TEXT,
  funding_ask           BIGINT        CHECK (funding_ask > 0),
  one_liner             TEXT,
  problem_solution      TEXT,

  -- Traction metrics at submission time
  arr_at_pitch          BIGINT,
  mom_growth_at_pitch   NUMERIC(6,2),
  customers_at_pitch    INTEGER,
  runway_at_pitch       INTEGER,

  -- Deck analytics
  deck_viewed_at        TIMESTAMPTZ,
  deck_view_count       INTEGER       NOT NULL DEFAULT 0 CHECK (deck_view_count >= 0),
  deck_total_seconds    INTEGER       NOT NULL DEFAULT 0 CHECK (deck_total_seconds >= 0),

  -- Metadata
  submitted_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  last_updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  notes                 TEXT,         -- VC-side notes / feedback

  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE (startup_id, vc_id)  -- one pitch per startup-vc pair
);

CREATE INDEX idx_pitches_startup_id ON public.pitches(startup_id);
CREATE INDEX idx_pitches_vc_id      ON public.pitches(vc_id);
CREATE INDEX idx_pitches_status     ON public.pitches(status);

-- ── matches ────────────────────────────────────────────────

CREATE TABLE public.matches (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id        UUID        NOT NULL REFERENCES public.startup_profiles(id) ON DELETE CASCADE,
  vc_id             UUID        NOT NULL REFERENCES public.vc_profiles(id) ON DELETE CASCADE,

  -- Composite match score (0–100)
  overall_score     NUMERIC(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),

  -- Dimensional scores (0–100)
  thesis_score      NUMERIC(5,2) CHECK (thesis_score >= 0 AND thesis_score <= 100),
  sector_score      NUMERIC(5,2) CHECK (sector_score >= 0 AND sector_score <= 100),
  stage_score       NUMERIC(5,2) CHECK (stage_score >= 0 AND stage_score <= 100),
  geography_score   NUMERIC(5,2) CHECK (geography_score >= 0 AND geography_score <= 100),
  traction_score    NUMERIC(5,2) CHECK (traction_score >= 0 AND traction_score <= 100),

  -- Visibility flags
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  startup_dismissed   BOOLEAN     NOT NULL DEFAULT FALSE,
  vc_dismissed        BOOLEAN     NOT NULL DEFAULT FALSE,

  computed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (startup_id, vc_id)
);

CREATE INDEX idx_matches_startup_id     ON public.matches(startup_id);
CREATE INDEX idx_matches_vc_id          ON public.matches(vc_id);
CREATE INDEX idx_matches_overall_score  ON public.matches(overall_score DESC);
CREATE INDEX idx_matches_active         ON public.matches(is_active) WHERE is_active = TRUE;

-- ── Row Level Security ─────────────────────────────────────

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vc_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches           ENABLE ROW LEVEL SECURITY;

-- profiles: users read/update their own row only
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- startup_profiles: owner can CRUD; published profiles visible to VCs
CREATE POLICY "startup_profiles_owner_all"
  ON public.startup_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "startup_profiles_vc_read_published"
  ON public.startup_profiles FOR SELECT
  USING (
    is_published = TRUE
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'vc'
    )
  );

-- vc_profiles: owner can CRUD; published profiles visible to startups
CREATE POLICY "vc_profiles_owner_all"
  ON public.vc_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "vc_profiles_startup_read_published"
  ON public.vc_profiles FOR SELECT
  USING (
    is_published = TRUE
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'startup'
    )
  );

-- pitches: startup owns the pitch; targeted VC can read/update status
CREATE POLICY "pitches_startup_owner"
  ON public.pitches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.startup_profiles sp
      WHERE sp.id = pitches.startup_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "pitches_vc_read_update"
  ON public.pitches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vc_profiles vp
      WHERE vp.id = pitches.vc_id AND vp.user_id = auth.uid()
    )
  );

CREATE POLICY "pitches_vc_update_status"
  ON public.pitches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.vc_profiles vp
      WHERE vp.id = pitches.vc_id AND vp.user_id = auth.uid()
    )
  );

-- matches: both sides can read their own matches
CREATE POLICY "matches_startup_read"
  ON public.matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.startup_profiles sp
      WHERE sp.id = matches.startup_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "matches_vc_read"
  ON public.matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vc_profiles vp
      WHERE vp.id = matches.vc_id AND vp.user_id = auth.uid()
    )
  );

CREATE POLICY "matches_startup_dismiss"
  ON public.matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.startup_profiles sp
      WHERE sp.id = matches.startup_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "matches_vc_dismiss"
  ON public.matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.vc_profiles vp
      WHERE vp.id = matches.vc_id AND vp.user_id = auth.uid()
    )
  );

-- ── updated_at triggers ────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_startup_profiles_updated_at
  BEFORE UPDATE ON public.startup_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_vc_profiles_updated_at
  BEFORE UPDATE ON public.vc_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_pitches_updated_at
  BEFORE UPDATE ON public.pitches
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
