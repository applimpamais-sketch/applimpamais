
-- Tabela para sessões de agendamento progressivo
CREATE TABLE public.agendamento_sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_telefone text NOT NULL,
  funcionario_bot_id uuid REFERENCES public.funcionarios_bot(id),
  tenant_id uuid REFERENCES public.saas_tenants(id),
  dados_parciais jsonb DEFAULT '{}'::jsonb,
  campos_preenchidos text[] DEFAULT '{}',
  campos_faltando text[] DEFAULT ARRAY['nome','telefone','endereco','servico','data'],
  status text DEFAULT 'coletando',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.agendamento_sessoes ENABLE ROW LEVEL SECURITY;

-- Service role pode tudo (edge functions usam service_role)
CREATE POLICY "service_role_all" ON public.agendamento_sessoes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated admin pode ver
CREATE POLICY "admin_select" ON public.agendamento_sessoes
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR tenant_id = public.get_user_tenant_id()
  );

-- Index para busca rápida por telefone + status
CREATE INDEX idx_agendamento_sessoes_telefone_status 
  ON public.agendamento_sessoes (funcionario_telefone, status) 
  WHERE status = 'coletando';
