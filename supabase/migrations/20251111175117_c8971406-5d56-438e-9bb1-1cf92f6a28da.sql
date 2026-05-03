-- Atribuir role admin para metodorfv@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('532e5e79-6813-4d2e-b05e-9e71115ace95', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;