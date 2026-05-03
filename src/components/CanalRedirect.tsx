import { useEffect, useState } from 'react';
import { saveCanalRef } from '@/utils/canalRef';
import { supabase } from '@/integrations/supabase/client';
import Index from '@/pages/Index';

interface CanalRedirectProps {
  codigo: string;
}

export function CanalRedirect({ codigo }: CanalRedirectProps) {
  const [processado, setProcessado] = useState(false);

  useEffect(() => {
    const trackAndProcess = async () => {
      // Salvar referência no localStorage
      saveCanalRef(codigo);
      
      // Registrar clique via edge function (fire and forget)
      supabase.functions.invoke('track-canal-click', {
        body: { codigo }
      }).catch(error => {
        console.warn('[CanalRedirect] Erro ao rastrear clique:', error);
      });
      
      console.log(`[CanalRedirect] Referência salva: ${codigo}`);
      setProcessado(true);
    };

    trackAndProcess();
  }, [codigo]);

  // Carregando - mostrar spinner
  if (!processado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Processado - renderiza a loja diretamente, mantendo a URL original
  return <Index />;
}
