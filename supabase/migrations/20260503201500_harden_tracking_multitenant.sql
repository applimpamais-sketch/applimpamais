-- Harden tracking module for SaaS multi-tenant isolation.
-- Public tracking is still allowed, but only with a valid x-tracking-token header.

-- Remove legacy broad policies
DROP POLICY IF EXISTS "Tecnicos podem ver suas sessoes" ON public.tracking_sessions;
DROP POLICY IF EXISTS "Tecnicos podem criar sessoes" ON public.tracking_sessions;
DROP POLICY IF EXISTS "Tecnicos podem atualizar suas sessoes" ON public.tracking_sessions;
DROP POLICY IF EXISTS "Admins podem ver todas sessoes" ON public.tracking_sessions;
DROP POLICY IF EXISTS "Acesso publico via token" ON public.tracking_sessions;

DROP POLICY IF EXISTS "Tecnicos podem inserir posicoes" ON public.tracking_positions;
DROP POLICY IF EXISTS "Tecnicos podem ver suas posicoes" ON public.tracking_positions;
DROP POLICY IF EXISTS "Admins podem ver todas posicoes" ON public.tracking_positions;
DROP POLICY IF EXISTS "Acesso publico posicoes via session" ON public.tracking_positions;

DROP POLICY IF EXISTS "Acesso publico agendamento via tracking" ON public.agendamentos;

-- tracking_sessions: technicians can only operate in their tenant's agendamentos
CREATE POLICY "tracking_sessions_tecnico_select"
ON public.tracking_sessions
FOR SELECT
TO authenticated
USING (
  tecnico_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.agendamentos a
    WHERE a.id = tracking_sessions.agendamento_id
      AND (
        a.tenant_id = public.get_user_tenant_id()
        OR public.is_super_admin(auth.uid())
      )
  )
);

CREATE POLICY "tracking_sessions_tecnico_insert"
ON public.tracking_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  tecnico_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.agendamentos a
    WHERE a.id = tracking_sessions.agendamento_id
      AND (
        a.tenant_id = public.get_user_tenant_id()
        OR public.is_super_admin(auth.uid())
      )
  )
);

CREATE POLICY "tracking_sessions_tecnico_update"
ON public.tracking_sessions
FOR UPDATE
TO authenticated
USING (
  tecnico_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.agendamentos a
    WHERE a.id = tracking_sessions.agendamento_id
      AND (
        a.tenant_id = public.get_user_tenant_id()
        OR public.is_super_admin(auth.uid())
      )
  )
)
WITH CHECK (
  tecnico_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.agendamentos a
    WHERE a.id = tracking_sessions.agendamento_id
      AND (
        a.tenant_id = public.get_user_tenant_id()
        OR public.is_super_admin(auth.uid())
      )
  )
);

-- tracking_sessions: tenant staff visibility (admin/operador) + super admin
CREATE POLICY "tracking_sessions_staff_tenant_select"
ON public.tracking_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.agendamentos a
    WHERE a.id = tracking_sessions.agendamento_id
      AND (
        public.is_super_admin(auth.uid())
        OR (
          a.tenant_id = public.get_user_tenant_id()
          AND (
            public.has_role(auth.uid(), 'admin'::app_role)
            OR public.has_role(auth.uid(), 'operador'::app_role)
          )
        )
      )
  )
);

-- tracking_sessions: public read only with exact token
CREATE POLICY "tracking_sessions_public_token_select"
ON public.tracking_sessions
FOR SELECT
TO anon
USING (
  token_publico = COALESCE((current_setting('request.headers', true)::jsonb ->> 'x-tracking-token'), '')
);

-- tracking_positions: technicians can insert/select only for their own tenant session
CREATE POLICY "tracking_positions_tecnico_insert"
ON public.tracking_positions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.tracking_sessions ts
    JOIN public.agendamentos a ON a.id = ts.agendamento_id
    WHERE ts.id = tracking_positions.tracking_session_id
      AND ts.tecnico_id = auth.uid()
      AND (
        a.tenant_id = public.get_user_tenant_id()
        OR public.is_super_admin(auth.uid())
      )
  )
);

CREATE POLICY "tracking_positions_tecnico_select"
ON public.tracking_positions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tracking_sessions ts
    JOIN public.agendamentos a ON a.id = ts.agendamento_id
    WHERE ts.id = tracking_positions.tracking_session_id
      AND ts.tecnico_id = auth.uid()
      AND (
        a.tenant_id = public.get_user_tenant_id()
        OR public.is_super_admin(auth.uid())
      )
  )
);

-- tracking_positions: tenant staff visibility (admin/operador) + super admin
CREATE POLICY "tracking_positions_staff_tenant_select"
ON public.tracking_positions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tracking_sessions ts
    JOIN public.agendamentos a ON a.id = ts.agendamento_id
    WHERE ts.id = tracking_positions.tracking_session_id
      AND (
        public.is_super_admin(auth.uid())
        OR (
          a.tenant_id = public.get_user_tenant_id()
          AND (
            public.has_role(auth.uid(), 'admin'::app_role)
            OR public.has_role(auth.uid(), 'operador'::app_role)
          )
        )
      )
  )
);

-- tracking_positions: public read only when linked session token matches header
CREATE POLICY "tracking_positions_public_token_select"
ON public.tracking_positions
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.tracking_sessions ts
    WHERE ts.id = tracking_positions.tracking_session_id
      AND ts.token_publico = COALESCE((current_setting('request.headers', true)::jsonb ->> 'x-tracking-token'), '')
  )
);

-- agendamentos: public tracking data only for the same provided token
CREATE POLICY "agendamentos_public_tracking_token_select"
ON public.agendamentos
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.tracking_sessions ts
    WHERE ts.agendamento_id = agendamentos.id
      AND ts.token_publico = COALESCE((current_setting('request.headers', true)::jsonb ->> 'x-tracking-token'), '')
  )
);
