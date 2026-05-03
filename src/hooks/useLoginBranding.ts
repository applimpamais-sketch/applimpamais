import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TenantBranding {
  nome_fantasia: string | null;
  nome_empresa: string;
  logo_url: string | null;
}

/**
 * Hook para detectar branding do tenant na tela de login (sem sessão).
 * Detecta pelo hostname (domínio customizado).
 * 
 * Regras:
 * - Se for domínio principal (rclimpamais.com.br, lovable.app, localhost) → branding RC Limpa Mais
 * - Se for domínio customizado (app.empresa.com) → buscar tenant
 * - Fallback: branding neutro/genérico
 */
export function useLoginBranding() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  const { data, isLoading } = useQuery({
    queryKey: ['login-branding', hostname],
    queryFn: async (): Promise<{ branding: TenantBranding | null; isMaster: boolean }> => {
      // Domínios que indicam ambiente master (RC Limpa Mais ou desenvolvimento)
      const masterDomains = [
        'localhost',
        'rclimpamais.com.br',
        'www.rclimpamais.com.br',
        'rclimpamais.lovable.app',
      ];
      
      const isPreviewDomain = hostname.includes('.lovable.app') || hostname.includes('.lovableproject.com');
      const isMasterDomain = masterDomains.some(d => hostname === d || hostname.endsWith(`.${d}`));
      
      // Se for domínio master ou preview do Lovable, retornar branding RC Limpa Mais
      if (isMasterDomain || isPreviewDomain) {
        console.log('[useLoginBranding] Domínio master/preview, usando branding RC Limpa Mais');
        return {
          branding: {
            nome_fantasia: 'RC Limpa Mais',
            nome_empresa: 'RC Limpa Mais',
            logo_url: '/logo-rc-limpa-mais.png', // Logo estático da RC
          },
          isMaster: true,
        };
      }
      
      // Tentar buscar tenant pelo domínio customizado
      console.log('[useLoginBranding] Buscando tenant por domínio:', hostname);
      
      const { data, error } = await supabase
        .from('saas_tenants')
        .select('nome_fantasia, nome_empresa, logo_url')
        .eq('dominio_customizado', hostname)
        .eq('status', 'ativo')
        .maybeSingle();
      
      if (error) {
        console.error('[useLoginBranding] Erro ao buscar tenant:', error);
        return { branding: null, isMaster: false };
      }
      
      if (data) {
        console.log('[useLoginBranding] Tenant encontrado:', data.nome_fantasia || data.nome_empresa);
        return { branding: data as TenantBranding, isMaster: false };
      }
      
      console.log('[useLoginBranding] Nenhum tenant encontrado para domínio:', hostname);
      return { branding: null, isMaster: false };
    },
    staleTime: Infinity, // Branding não muda durante a sessão
    retry: 1,
  });
  
  // Valores derivados para uso fácil
  const isMasterBranding = data?.isMaster ?? false;
  const tenantBranding = data?.branding ?? null;
  const companyName = tenantBranding?.nome_fantasia || tenantBranding?.nome_empresa || null;
  const logoUrl = tenantBranding?.logo_url || null;
  
  return {
    tenantBranding,
    isLoading,
    isMasterBranding,
    companyName,
    logoUrl,
  };
}

export default useLoginBranding;
