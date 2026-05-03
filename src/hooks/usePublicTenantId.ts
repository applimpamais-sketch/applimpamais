import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://app.limpamais.com';
const DEFAULT_PUBLIC_TENANT_ID = import.meta.env.VITE_PUBLIC_DEFAULT_TENANT_ID || null;

function getConfiguredHostname() {
  try {
    return new URL(DEFAULT_SITE_URL).hostname;
  } catch {
    return 'app.limpamais.com';
  }
}

interface UsePublicTenantIdOptions {
  enabled?: boolean;
}

export function usePublicTenantId(options?: UsePublicTenantIdOptions) {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  return useQuery({
    queryKey: ['public-tenant-id', hostname],
    queryFn: async (): Promise<string | null> => {
      const configuredHostname = getConfiguredHostname();
      const isPreviewDomain = hostname.includes('.lovable.app') || hostname.includes('.lovableproject.com');
      const isMainDomain =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === configuredHostname ||
        hostname.endsWith(`.${configuredHostname}`);

      if (isMainDomain || isPreviewDomain) {
        return DEFAULT_PUBLIC_TENANT_ID;
      }

      const { data, error } = await supabase
        .from('saas_tenants')
        .select('id')
        .eq('dominio_customizado', hostname)
        .eq('status', 'ativo')
        .maybeSingle();

      if (error) {
        console.error('[usePublicTenantId] Erro ao resolver tenant por domínio:', error);
        return null;
      }

      return data?.id ?? null;
    },
    enabled: options?.enabled ?? true,
    staleTime: Infinity,
    retry: 1,
  });
}
