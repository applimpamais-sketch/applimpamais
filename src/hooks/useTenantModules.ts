import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantLimits } from './useTenantLimits';

export interface SaasModulo {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  preco_base: number;
  categoria: string | null;
  dependencias: string[];
  icone: string | null;
  ordem: number;
  ativo: boolean;
  created_at?: string;
}

export interface TenantModulo {
  id: string;
  tenant_id: string;
  modulo_id: string;
  preco_negociado: number | null;
  ativado_em: string;
  desativado_em: string | null;
  status: 'ativo' | 'suspenso' | 'cancelado';
  modulo: SaasModulo;
}

export function useTenantModules() {
  const { tenantId } = useTenantLimits();

  const { data: modulos, isLoading, refetch } = useQuery({
    queryKey: ['tenant-modulos', tenantId],
    queryFn: async (): Promise<TenantModulo[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('tenant_modulos')
        .select(`
          *,
          modulo:saas_modulos(*)
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'ativo')
        .is('desativado_em', null);

      if (error) {
        console.error('Erro ao buscar módulos do tenant:', error);
        return [];
      }

      return (data as unknown as TenantModulo[]) || [];
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 1, // 1 minuto - atualização mais rápida para refletir mudanças
  });

  const hasModule = (codigo: string): boolean => {
    if (!modulos) return false;
    return modulos.some(m => m.modulo?.codigo === codigo);
  };

  const getModuloCodigos = (): string[] => {
    if (!modulos) return [];
    return modulos.map(m => m.modulo?.codigo).filter(Boolean) as string[];
  };

  const getPrecoTotal = (): number => {
    if (!modulos) return 0;
    return modulos.reduce((total, m) => {
      const preco = m.preco_negociado ?? m.modulo?.preco_base ?? 0;
      return total + preco;
    }, 0);
  };

  return {
    modulos,
    isLoading,
    refetch,
    hasModule,
    getModuloCodigos,
    getPrecoTotal,
    tenantId,
  };
}

// Hook para listar todos os módulos disponíveis (catálogo)
export function useModulosCatalogo() {
  return useQuery({
    queryKey: ['saas-modulos-catalogo'],
    queryFn: async (): Promise<SaasModulo[]> => {
      const { data, error } = await supabase
        .from('saas_modulos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) {
        console.error('Erro ao buscar catálogo de módulos:', error);
        return [];
      }

      return (data as unknown as SaasModulo[]) || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

// Hook para gerenciar módulos de um tenant específico (Super Admin)
export function useTenantModulosAdmin(tenantId?: string) {
  const { data: modulos, isLoading, refetch } = useQuery({
    queryKey: ['tenant-modulos-admin', tenantId],
    queryFn: async (): Promise<TenantModulo[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('tenant_modulos')
        .select(`
          *,
          modulo:saas_modulos(*)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar módulos do tenant:', error);
        return [];
      }

      return (data as unknown as TenantModulo[]) || [];
    },
    enabled: !!tenantId,
  });

  const ativarModulo = async (moduloId: string, precoNegociado?: number) => {
    if (!tenantId) return { error: 'Tenant ID não informado' };

    const { error } = await supabase
      .from('tenant_modulos')
      .upsert({
        tenant_id: tenantId,
        modulo_id: moduloId,
        preco_negociado: precoNegociado,
        status: 'ativo',
        desativado_em: null,
        ativado_em: new Date().toISOString(),
      }, {
        onConflict: 'tenant_id,modulo_id',
      });

    if (!error) refetch();
    return { error };
  };

  const desativarModulo = async (moduloId: string) => {
    if (!tenantId) return { error: 'Tenant ID não informado' };

    const { error } = await supabase
      .from('tenant_modulos')
      .update({
        status: 'cancelado',
        desativado_em: new Date().toISOString(),
      })
      .eq('tenant_id', tenantId)
      .eq('modulo_id', moduloId);

    if (!error) refetch();
    return { error };
  };

  return {
    modulos,
    isLoading,
    refetch,
    ativarModulo,
    desativarModulo,
  };
}
