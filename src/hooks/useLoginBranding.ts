import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TenantBranding {
  nome_fantasia: string | null;
  nome_empresa: string;
  logo_url: string | null;
}

const DEFAULT_PLATFORM_NAME = 'Limpamais';
const DEFAULT_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://app.limpamais.com';

function getConfiguredHostname() {
  try {
    return new URL(DEFAULT_SITE_URL).hostname;
  } catch {
    return 'app.limpamais.com';
  }
}

/**
 * Hook para detectar branding do tenant na tela de login (sem sessao).
 * Detecta pelo hostname e aplica um branding neutro quando estiver no
 * dominio principal da plataforma ou em ambiente local.
 */
export function useLoginBranding() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const { data, isLoading } = useQuery({
    queryKey: ['login-branding', hostname],
    queryFn: async (): Promise<{ branding: TenantBranding | null; isMaster: boolean }> => {
      const configuredHostname = getConfiguredHostname();
      const isPreviewDomain = hostname.includes('.lovable.app') || hostname.includes('.lovableproject.com');
      const isMasterDomain =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === configuredHostname;

      if (isMasterDomain || isPreviewDomain) {
        return {
          branding: {
            nome_fantasia: DEFAULT_PLATFORM_NAME,
            nome_empresa: DEFAULT_PLATFORM_NAME,
            logo_url: null,
          },
          isMaster: true,
        };
      }

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
        return { branding: data as TenantBranding, isMaster: false };
      }

      return { branding: null, isMaster: false };
    },
    staleTime: Infinity,
    retry: 1,
  });

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

