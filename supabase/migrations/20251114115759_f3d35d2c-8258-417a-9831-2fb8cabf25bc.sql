-- Adicionar campo telefone_whatsapp na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telefone_whatsapp text UNIQUE;

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_profiles_telefone_whatsapp 
ON public.profiles(telefone_whatsapp);

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.profiles.telefone_whatsapp IS 'Telefone WhatsApp autorizado para registrar despesas via webhook. Formato: +5531999999999';