-- Habilitar RLS nas tabelas do bot WhatsApp se ainda não estiver
ALTER TABLE whatsapp_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversas ENABLE ROW LEVEL SECURITY;

-- Políticas para whatsapp_mensagens
-- Admins e operadores podem ver todas as mensagens
CREATE POLICY "whatsapp_mensagens_staff_select"
ON whatsapp_mensagens
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'operador') OR 
  has_role(auth.uid(), 'visualizador')
);

-- Sistema pode inserir mensagens (usado pelas edge functions)
CREATE POLICY "whatsapp_mensagens_system_insert"
ON whatsapp_mensagens
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Políticas para whatsapp_conversas
-- Admins e operadores podem ver todas as conversas
CREATE POLICY "whatsapp_conversas_staff_select"
ON whatsapp_conversas
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'operador') OR 
  has_role(auth.uid(), 'visualizador')
);

-- Sistema pode criar e atualizar conversas (usado pelas edge functions)
CREATE POLICY "whatsapp_conversas_system_insert"
ON whatsapp_conversas
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "whatsapp_conversas_system_update"
ON whatsapp_conversas
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);