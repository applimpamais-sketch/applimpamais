import { useTenantModulosAdmin, useModulosCatalogo, TenantModulo, SaasModulo } from '@/hooks/useTenantModules';
import { Package, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface TenantModulosContratadosProps {
  tenantId: string;
  valorMensalBanco?: number; // Para comparar com total calculado
  showTotal?: boolean; // Se deve mostrar o total (default: true)
}

export function TenantModulosContratados({ 
  tenantId, 
  valorMensalBanco,
  showTotal = true 
}: TenantModulosContratadosProps) {
  const { modulos, isLoading: isLoadingContratados } = useTenantModulosAdmin(tenantId);
  const { data: catalogo, isLoading: isLoadingCatalogo } = useModulosCatalogo();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoadingContratados || isLoadingCatalogo) {
    return (
      <div className="space-y-3 mt-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Carregando módulos...</span>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  // Get active module IDs for this tenant
  const activeModuleIds = new Set(
    modulos?.filter(m => m.status === 'ativo').map(m => m.modulo_id) || []
  );

  // Create a map of tenant module data for price lookup
  const tenantModuleMap = new Map<string, TenantModulo>();
  modulos?.forEach(m => {
    if (m.status === 'ativo') {
      tenantModuleMap.set(m.modulo_id, m);
    }
  });

  // Calculate total from active modules
  const totalValor = modulos?.reduce((sum, m) => {
    if (m.status !== 'ativo') return sum;
    const preco = m.preco_negociado ?? m.modulo?.preco_base ?? 0;
    return sum + preco;
  }, 0) || 0;

  const activeCount = activeModuleIds.size;
  const totalCount = catalogo?.length || 0;
  
  // Verificar se há inconsistência entre valor no banco e total calculado
  const hasInconsistency = valorMensalBanco !== undefined && 
    Math.abs(valorMensalBanco - totalValor) > 0.01;

  return (
    <div className="space-y-3 mt-4 pt-4 border-t">
      <h4 className="font-medium flex items-center gap-2 text-sm">
        <Package className="h-4 w-4" />
        Módulos Contratados ({activeCount}/{totalCount})
      </h4>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {catalogo?.map((moduloCatalogo: SaasModulo) => {
          const isActive = activeModuleIds.has(moduloCatalogo.id);
          const tenantModule = tenantModuleMap.get(moduloCatalogo.id);
          const preco = isActive 
            ? (tenantModule?.preco_negociado ?? moduloCatalogo.preco_base) 
            : moduloCatalogo.preco_base;
          
          return (
            <div 
              key={moduloCatalogo.id} 
              className={`flex justify-between text-sm py-1 ${!isActive ? 'opacity-50' : ''}`}
            >
              <span className="flex items-center gap-2">
                {isActive ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={isActive ? 'font-medium' : ''}>
                  {moduloCatalogo.nome}
                </span>
              </span>
              <span className={`text-right ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {isActive ? formatCurrency(preco) : '-'}
              </span>
            </div>
          );
        })}
      </div>
      
      {activeCount > 0 && showTotal && (
        <>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total Módulos</span>
            <span className="text-primary">{formatCurrency(totalValor)}</span>
          </div>
          
          {hasInconsistency && (
            <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Valor no banco ({formatCurrency(valorMensalBanco!)}) difere do total dos módulos. 
                Atualize o plano ou sincronize os módulos.
              </p>
            </div>
          )}
        </>
      )}
      
      {activeCount === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Nenhum módulo contratado ainda.
        </p>
      )}
    </div>
  );
}

// Hook para obter o total dos módulos ativos (útil para outros componentes)
export function useModulosTotal(tenantId?: string) {
  const { modulos, isLoading } = useTenantModulosAdmin(tenantId);
  
  const totalValor = modulos?.reduce((sum, m) => {
    if (m.status !== 'ativo') return sum;
    const preco = m.preco_negociado ?? m.modulo?.preco_base ?? 0;
    return sum + preco;
  }, 0) || 0;
  
  const activeCount = modulos?.filter(m => m.status === 'ativo').length || 0;
  
  return { totalValor, activeCount, isLoading };
}
