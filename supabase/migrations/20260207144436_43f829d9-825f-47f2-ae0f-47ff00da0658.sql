-- Drop the existing check constraint and add a new one that includes the new template types
ALTER TABLE public.iarc_landing_pages 
DROP CONSTRAINT IF EXISTS iarc_landing_pages_template_tipo_check;

ALTER TABLE public.iarc_landing_pages 
ADD CONSTRAINT iarc_landing_pages_template_tipo_check 
CHECK (template_tipo IN ('promocao_simples', 'autoridade', 'vsl', 'evento', 'captura', 'lp-12d', 'lp-teodoro'));