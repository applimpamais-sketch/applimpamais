-- =====================================================
-- SUPER ADMIN - PARTE 1: Adicionar valor ao enum
-- =====================================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';