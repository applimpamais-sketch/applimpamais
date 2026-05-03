import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function InitializeCalendar() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initCalendar = async () => {
      if (initialized) return;
      
      try {
        // Verificar se já existem dados
        const { count } = await supabase
          .from('calendario_disponibilidade')
          .select('*', { count: 'exact', head: true });
        
        // Se não houver dados, inicializar
        if (count === 0) {
          await supabase.functions.invoke('init-calendario', {
            body: { days: 60 }
          });
          console.log('Calendário inicializado com sucesso');
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Erro ao inicializar calendário:', error);
      }
    };

    initCalendar();
  }, [initialized]);

  return null; // Componente invisível
}
