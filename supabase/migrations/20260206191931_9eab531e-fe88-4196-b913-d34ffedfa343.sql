-- Add visited_screens column for screen-level tour tracking
ALTER TABLE public.admin_onboarding_progress 
ADD COLUMN IF NOT EXISTS visited_screens JSONB DEFAULT '[]'::jsonb;