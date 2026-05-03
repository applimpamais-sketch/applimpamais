-- Drop legacy permissive public policies that may still exist from older phases.
-- New tenant-aware policies are defined in latest hardening migrations.

-- agendamentos
DROP POLICY IF EXISTS "Permitir SELECT anônimo em agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Permitir SELECT anonimo em agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Allow public booking read by phone" ON public.agendamentos;
DROP POLICY IF EXISTS "Allow anonymous insert for new bookings" ON public.agendamentos;
DROP POLICY IF EXISTS "Acesso publico agendamento via tracking" ON public.agendamentos;

-- carrinhos_abandonados
DROP POLICY IF EXISTS "Permitir INSERT anônimo em carrinhos_abandonados" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "Permitir UPDATE anônimo em carrinhos_abandonados" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "Allow anonymous insert abandoned carts" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "Allow anonymous update own cart by session" ON public.carrinhos_abandonados;

-- live_sessions
DROP POLICY IF EXISTS "Qualquer um pode inserir sessões" ON public.live_sessions;
DROP POLICY IF EXISTS "Qualquer um pode inserir sessoes" ON public.live_sessions;
DROP POLICY IF EXISTS "Qualquer um pode atualizar sessões" ON public.live_sessions;
DROP POLICY IF EXISTS "Qualquer um pode atualizar sessoes" ON public.live_sessions;
DROP POLICY IF EXISTS "Allow anonymous session tracking insert" ON public.live_sessions;
DROP POLICY IF EXISTS "Allow anonymous session tracking update" ON public.live_sessions;
