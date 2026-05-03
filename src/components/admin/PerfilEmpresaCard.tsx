import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Calendar, CreditCard, Clock, Loader2 } from 'lucide-react';
import { useTenantContext } from '@/hooks/useTenantContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  isRCLimpaMaisTenant, 
  isMasterFallbackTenant, 
  RC_LIMPA_MAIS_TENANT_ID 
} from '@/constants/tenant';
import type { TenantData } from '@/hooks/useTenantContext';

const statusConfig: Record<string, { label: string; className: string }> = {
  trial: { label: 'Trial', className: 'bg-primary/10 text-primary' },
  ativo: { label: 'Ativo', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  suspenso: { label: 'Suspenso', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  cancelado: { label: 'Cancelado', className: 'bg-destructive/10 text-destructive' },
};

const planoConfig: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatCNPJ = (cnpj: string | null) => {
  if (!cnpj) return '-';
  // Format as XX.XXX.XXX/XXXX-XX
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
};

export function PerfilEmpresaCard() {
  const { tenant, tenantId, isLoading: isLoadingContext, tenantChecked } = useTenantContext();
  
  // Determinar se é usuário master (RC Limpa Mais)
  const isRCLimpaMais = !tenantId || isRCLimpaMaisTenant(tenantId) || isMasterFallbackTenant(tenantId);
  const targetTenantId = isRCLimpaMais ? RC_LIMPA_MAIS_TENANT_ID : tenantId;
  
  // Buscar dados do tenant RC Limpa Mais se for usuário master
  const { data: rcTenant, isLoading: isLoadingRC } = useQuery({
    queryKey: ['rc-limpa-mais-tenant', targetTenantId],
    queryFn: async () => {
      if (!targetTenantId) return null;
      
      const { data, error } = await supabase
        .from('saas_tenants')
        .select('*')
        .eq('id', targetTenantId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar tenant:', error);
        return null;
      }
      
      return data as unknown as TenantData;
    },
    enabled: isRCLimpaMais && tenantChecked,
    staleTime: 5 * 60 * 1000,
  });
  
  const isLoading = isLoadingContext || (isRCLimpaMais && isLoadingRC);
  const displayTenant = isRCLimpaMais ? rcTenant : tenant;
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Minha Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!displayTenant) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Minha Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhuma empresa vinculada ao seu perfil.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const status = statusConfig[displayTenant.status] || statusConfig.ativo;
  const planoLabel = planoConfig[displayTenant.plano] || displayTenant.plano;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Minha Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header com nome e status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-muted/30 rounded-lg">
          <div>
            <h3 className="font-semibold text-lg">
              {displayTenant.nome_fantasia || displayTenant.nome_empresa}
            </h3>
            <p className="text-sm text-muted-foreground">
              CNPJ: {formatCNPJ(displayTenant.cnpj)}
            </p>
          </div>
          <Badge className={status.className}>
            {status.label}
          </Badge>
        </div>
        
        {/* Grid com informações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Plano */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm">Plano</span>
            </div>
            <p className="font-semibold text-lg">{planoLabel}</p>
            {displayTenant.dia_vencimento && (
              <p className="text-sm text-muted-foreground mt-1">
                Vencimento: dia {displayTenant.dia_vencimento}
              </p>
            )}
          </div>
          
          {/* Valor Mensal */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm">Valor Mensal</span>
            </div>
            <p className="font-semibold text-lg text-primary">
              {formatCurrency(displayTenant.valor_mensal)}
            </p>
            {displayTenant.ultimo_pagamento_em && (
              <p className="text-sm text-muted-foreground mt-1">
                Último: {formatDate(displayTenant.ultimo_pagamento_em)}
              </p>
            )}
          </div>
        </div>
        
        {/* Trial info se aplicável */}
        {displayTenant.status === 'trial' && displayTenant.trial_termina_em && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Trial expira em: {formatDate(displayTenant.trial_termina_em)}
              </span>
            </div>
          </div>
        )}
        
        <Separator />
        
        {/* Histórico */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Histórico</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente desde:</span>
              <span>{formatDate(displayTenant.criado_em)}</span>
            </div>
            {displayTenant.ativado_em && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ativado em:</span>
                <span>{formatDate(displayTenant.ativado_em)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
