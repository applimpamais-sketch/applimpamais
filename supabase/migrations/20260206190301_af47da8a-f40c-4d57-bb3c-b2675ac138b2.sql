-- Tabela para persistir progresso do onboarding de administradores
CREATE TABLE public.admin_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  has_seen_welcome BOOLEAN DEFAULT false,
  completed_tours JSONB DEFAULT '[]'::jsonb,
  current_tour TEXT,
  current_step INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para busca por user_id
CREATE INDEX idx_admin_onboarding_user ON public.admin_onboarding_progress(user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_admin_onboarding_updated_at
  BEFORE UPDATE ON public.admin_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: usuários só veem/editam seu próprio progresso
ALTER TABLE public.admin_onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding progress" 
  ON public.admin_onboarding_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress" 
  ON public.admin_onboarding_progress FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress" 
  ON public.admin_onboarding_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);