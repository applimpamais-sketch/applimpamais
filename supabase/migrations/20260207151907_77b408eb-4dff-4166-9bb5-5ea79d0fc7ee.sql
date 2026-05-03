-- Create revisions table for landing page version history
CREATE TABLE IF NOT EXISTS public.iarc_landing_page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES public.iarc_landing_pages(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Index for fast lookups by landing page
CREATE INDEX idx_lp_revisions_lp_id ON public.iarc_landing_page_revisions(landing_page_id);
CREATE INDEX idx_lp_revisions_created_at ON public.iarc_landing_page_revisions(landing_page_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.iarc_landing_page_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all revisions
CREATE POLICY "Admins can manage revisions" ON public.iarc_landing_page_revisions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Function to limit revisions to 10 per landing page
CREATE OR REPLACE FUNCTION public.limit_landing_page_revisions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete old revisions keeping only the 10 most recent
  DELETE FROM public.iarc_landing_page_revisions
  WHERE id IN (
    SELECT id FROM public.iarc_landing_page_revisions
    WHERE landing_page_id = NEW.landing_page_id
    ORDER BY created_at DESC
    OFFSET 10
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-cleanup old revisions
CREATE TRIGGER trigger_limit_lp_revisions
AFTER INSERT ON public.iarc_landing_page_revisions
FOR EACH ROW
EXECUTE FUNCTION public.limit_landing_page_revisions();