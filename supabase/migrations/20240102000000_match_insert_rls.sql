-- ═══════════════════════════════════════════════════════════
-- VentureBridge — Match INSERT/UPDATE RLS Policies
-- Run this in Supabase SQL Editor after the initial schema
-- ═══════════════════════════════════════════════════════════

-- Allow startups to INSERT match rows where they are the startup
CREATE POLICY "matches_startup_insert"
  ON public.matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.startup_profiles sp
      WHERE sp.id = matches.startup_id AND sp.user_id = auth.uid()
    )
  );

-- Allow VCs to INSERT match rows where they are the VC
CREATE POLICY "matches_vc_insert"
  ON public.matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vc_profiles vp
      WHERE vp.id = matches.vc_id AND vp.user_id = auth.uid()
    )
  );
