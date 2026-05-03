import { supabase } from '@/integrations/supabase/client';

/**
 * Wrapper para queries do Supabase que detecta erros 403/JWT e tenta renovar sessão
 */
export async function supabaseQuery<T>(
  queryFn: () => Promise<T>
): Promise<T> {
  try {
    return await queryFn();
  } catch (error: any) {
    // Detectar erros relacionados a JWT/autenticação
    if (
      error?.code === 'PGRST301' || 
      error?.message?.includes('JWT') ||
      error?.status === 403
    ) {
      console.log('Erro de autenticação detectado, tentando renovar sessão...');
      
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (session && !refreshError) {
        console.log('Sessão renovada com sucesso, retentando query');
        return await queryFn(); // Retry após renovação
      } else {
        console.error('Falha ao renovar sessão:', refreshError);
        throw error;
      }
    }
    throw error;
  }
}
