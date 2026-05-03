-- Drenar lembretes pendentes
UPDATE whatsapp_lembretes SET enviado = true, enviado_em = now() WHERE enviado = false;

-- Finalizar conversas de clientes abertas
UPDATE whatsapp_conversas SET finalizado = true WHERE finalizado = false;