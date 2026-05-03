-- Fase 1: Proteger push_subscriptions
-- Remover policy que permite staff ver todas as subscriptions
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Staff can view all subscriptions" ON push_subscriptions;

-- Usuários veem apenas suas próprias subscriptions OU são admins
CREATE POLICY "push_subscriptions_own_or_admin_select"
  ON push_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Usuários gerenciam apenas suas próprias subscriptions
CREATE POLICY "push_subscriptions_own_insert"
  ON push_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "push_subscriptions_own_update"
  ON push_subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "push_subscriptions_own_delete"
  ON push_subscriptions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());