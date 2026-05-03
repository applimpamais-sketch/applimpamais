import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const InitializeAdmin = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAdmin = async () => {
      // Check if already initialized in this session
      const hasInitialized = sessionStorage.getItem('admin_initialized');
      if (hasInitialized) {
        setInitialized(true);
        return;
      }

      setIsInitializing(true);
      
      try {
        // Initialization started
        
        const { data, error } = await supabase.functions.invoke('create-initial-admin', {
          body: {}
        });

        if (error) {
          console.error('Erro ao inicializar admin:', error);
          return;
        }

        if (data?.success) {
          if (data.alreadyExists) {
            // Admin already exists
          } else {
            // Admin created successfully
            toast.success('Usuário admin criado com sucesso!', {
              description: `Email: ${data.email}`
            });
          }
          sessionStorage.setItem('admin_initialized', 'true');
          setInitialized(true);
        }
      } catch (error) {
        console.error('Erro ao inicializar admin:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAdmin();
  }, []);

  // This component doesn't render anything
  return null;
};
