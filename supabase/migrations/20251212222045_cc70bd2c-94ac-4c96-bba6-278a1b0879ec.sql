
-- 🔴 CRÍTICO #1: Remover acesso anônimo SELECT em live_sessions
DROP POLICY IF EXISTS "live_sessions_anon_full_access" ON public.live_sessions;

-- Manter apenas INSERT público para tracking, SELECT apenas para staff
CREATE POLICY "live_sessions_staff_select" 
ON public.live_sessions 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role)
);

-- 🔴 CRÍTICO #2: Restringir SELECT em carrinhos_abandonados apenas para staff
DROP POLICY IF EXISTS "carrinhos_abandonados_select" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "Allow anonymous select abandoned carts" ON public.carrinhos_abandonados;

CREATE POLICY "carrinhos_abandonados_staff_only_select" 
ON public.carrinhos_abandonados 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role)
);

-- 🟠 ALTO #9: Restringir profiles para owner + admins apenas
DROP POLICY IF EXISTS "profiles_public_select" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "profiles_owner_or_admin_select" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);
