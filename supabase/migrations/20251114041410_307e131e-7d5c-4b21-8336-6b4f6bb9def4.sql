-- Drop e recriar a política de INSERT para pixel_events
-- Isso garante que inserts anônimos funcionem corretamente

DROP POLICY IF EXISTS "Permitir INSERT anônimo em pixel_events" ON pixel_events;

-- Criar política permissiva para INSERT anônimo
CREATE POLICY "Permitir INSERT anônimo em pixel_events"
ON pixel_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);