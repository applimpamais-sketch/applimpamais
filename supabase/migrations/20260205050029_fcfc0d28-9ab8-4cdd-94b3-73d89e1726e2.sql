-- ============================================
-- Sistema de Rastreamento de Canais Orgânicos
-- ============================================

-- 1. Criar tabela canais_empresa
CREATE TABLE IF NOT EXISTS public.canais_empresa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'outro',
  total_cliques INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT canais_empresa_tipo_check CHECK (tipo IN ('instagram', 'google', 'blog', 'marketplace', 'email', 'outro')),
  CONSTRAINT canais_empresa_status_check CHECK (status IN ('ativo', 'inativo'))
);

-- 2. Adicionar coluna canal_origem em agendamentos
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS canal_origem TEXT;

-- 3. Adicionar coluna canal_origem em carrinhos_abandonados
ALTER TABLE public.carrinhos_abandonados ADD COLUMN IF NOT EXISTS canal_origem TEXT;

-- 4. Habilitar RLS
ALTER TABLE public.canais_empresa ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para canais_empresa (apenas admin pode gerenciar)
CREATE POLICY "Admin pode ver todos os canais"
  ON public.canais_empresa
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode criar canais"
  ON public.canais_empresa
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode atualizar canais"
  ON public.canais_empresa
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar canais"
  ON public.canais_empresa
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Função para incrementar cliques do canal
CREATE OR REPLACE FUNCTION public.increment_canal_cliques(canal_codigo TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.canais_empresa 
  SET 
    total_cliques = total_cliques + 1,
    updated_at = now()
  WHERE codigo = canal_codigo 
    AND status = 'ativo';
  
  -- Log se não encontrou canal (cria automaticamente)
  IF NOT FOUND THEN
    INSERT INTO public.canais_empresa (codigo, nome, tipo, total_cliques)
    VALUES (canal_codigo, canal_codigo, 'outro', 1)
    ON CONFLICT (codigo) DO UPDATE SET total_cliques = canais_empresa.total_cliques + 1;
    
    RAISE LOG '[increment_canal_cliques] Canal auto-criado: %', canal_codigo;
  END IF;
END;
$$;

-- 7. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_canais_empresa_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_canais_empresa_updated_at
  BEFORE UPDATE ON public.canais_empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_canais_empresa_updated_at();

-- 8. Inserir canais pré-cadastrados
INSERT INTO public.canais_empresa (codigo, nome, tipo) VALUES
  ('bio', 'Bio Instagram', 'instagram'),
  ('stories', 'Stories Instagram', 'instagram'),
  ('google-organico', 'Google Orgânico', 'google'),
  ('google-maps', 'Google Maps/Perfil', 'google'),
  ('blog', 'Blog/Artigos', 'blog'),
  ('mercadolivre', 'Mercado Livre', 'marketplace'),
  ('olx', 'OLX', 'marketplace'),
  ('indicacao', 'Indicação Direta', 'outro'),
  ('email', 'E-mail Marketing', 'email')
ON CONFLICT (codigo) DO NOTHING;

-- 9. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_canais_empresa_codigo ON public.canais_empresa(codigo);
CREATE INDEX IF NOT EXISTS idx_canais_empresa_status ON public.canais_empresa(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_canal_origem ON public.agendamentos(canal_origem);
CREATE INDEX IF NOT EXISTS idx_carrinhos_canal_origem ON public.carrinhos_abandonados(canal_origem);

-- 10. Habilitar realtime para canais_empresa
ALTER PUBLICATION supabase_realtime ADD TABLE public.canais_empresa;