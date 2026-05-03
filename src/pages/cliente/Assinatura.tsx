import { useTenantContext } from '@/hooks/useTenantContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Receipt,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const statusConfig = {
  pendente: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
  pago: { label: 'Pago', variant: 'default' as const, icon: CheckCircle },
  vencido: { label: 'Vencido', variant: 'destructive' as const, icon: AlertTriangle },
  cancelado: { label: 'Cancelado', variant: 'outline' as const, icon: AlertTriangle },
};

const planoConfig = {
  starter: { label: 'Starter', description: 'Para pequenas empresas' },
  professional: { label: 'Professional', description: 'Para empresas em crescimento' },
  enterprise: { label: 'Enterprise', description: 'Para grandes operações' },
};

interface Subscription {
  id: string;
  tenant_id: string;
  mes_referencia: string;
  valor: number;
  desconto: number | null;
  valor_pago: number | null;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  data_vencimento: string;
  data_pagamento: string | null;
  forma_pagamento: string | null;
  observacoes: string | null;
  criado_em: string;
}

export default function ClienteAssinatura() {
  const { tenant, tenantId, subscription } = useTenantContext();

  // Buscar histórico de faturas
  const { data: faturas, isLoading } = useQuery({
    queryKey: ['faturas-tenant', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('saas_subscriptions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('criado_em', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data as Subscription[];
    },
    enabled: !!tenantId,
  });

  const plano = planoConfig[tenant?.plano || 'starter'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie seu plano e visualize o histórico de pagamentos
        </p>
      </div>

      {/* Card do plano atual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Plano {plano.label}</CardTitle>
                  <CardDescription>{plano.description}</CardDescription>
                </div>
              </div>
              <Badge variant="default" className="text-lg px-4 py-1">
                {tenant?.status === 'trial' ? 'Trial' : 'Ativo'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valor mensal</p>
                <p className="text-2xl font-bold">
                  {tenant?.valor_mensal 
                    ? formatCurrency(tenant.valor_mensal)
                    : 'Gratuito'
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Dia de vencimento</p>
                <p className="text-2xl font-bold">
                  Dia {tenant?.dia_vencimento || '--'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Próxima cobrança</p>
                <p className="text-2xl font-bold">
                  {subscription?.data_vencimento 
                    ? format(new Date(subscription.data_vencimento), 'dd/MM/yyyy')
                    : '--'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Última fatura */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Última Fatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{subscription.mes_referencia}</p>
                    <p className="text-sm text-muted-foreground">
                      Vencimento: {format(new Date(subscription.data_vencimento), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold">{formatCurrency(subscription.valor)}</p>
                  <Badge variant={statusConfig[subscription.status]?.variant || 'secondary'}>
                    {statusConfig[subscription.status]?.label || subscription.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Histórico de faturas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Histórico de Faturas
            </CardTitle>
            <CardDescription>Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : faturas && faturas.length > 0 ? (
              <div className="space-y-2">
                {faturas.map((fatura, index) => {
                  const status = statusConfig[fatura.status];
                  const StatusIcon = status?.icon || Clock;
                  
                  return (
                    <motion.div
                      key={fatura.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{fatura.mes_referencia}</p>
                          <p className="text-sm text-muted-foreground">
                            Vencimento: {format(new Date(fatura.data_vencimento), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(fatura.valor)}</p>
                          {fatura.desconto && fatura.desconto > 0 && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Desconto: {formatCurrency(fatura.desconto)}
                            </p>
                          )}
                        </div>
                        <Badge variant={status?.variant || 'secondary'}>
                          {status?.label || fatura.status}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhuma fatura encontrada</h3>
                <p className="text-muted-foreground">
                  As faturas aparecerão aqui quando forem geradas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
