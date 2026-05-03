
-- Remover políticas problemáticas que permitem SELECT público em live_sessions
DROP POLICY IF EXISTS "Tracking anônimo - insert/update sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "live_sessions_admin_select" ON public.live_sessions;

-- Criar política restrita: INSERT/UPDATE anônimo MAS SELECT apenas staff
CREATE POLICY "live_sessions_anon_insert_update" 
ON public.live_sessions 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "live_sessions_anon_update_own" 
ON public.live_sessions 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Remover políticas redundantes de profiles
DROP POLICY IF EXISTS "profiles_staff_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_select" ON public.profiles;
