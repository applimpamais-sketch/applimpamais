import { useTenantContext } from '@/hooks/useTenantContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Package, 
  CreditCard, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const statusConfig = {
  trial: { label: 'Trial', variant: 'secondary' as const, icon: Clock },
  ativo: { label: 'Ativo', variant: 'default' as const, icon: CheckCircle },
  suspenso: { label: 'Suspenso', variant: 'outline' as const, icon: AlertTriangle },
  cancelado: { label: 'Cancelado', variant: 'destructive' as const, icon: AlertTriangle },
};

const planoConfig = {
  starter: { label: 'Starter', variant: 'secondary' as const },
  professional: { label: 'Professional', variant: 'default' as const },
  enterprise: { label: 'Enterprise', variant: 'outline' as const },
};

export default function ClienteDashboard() {
  const { user } = useAuth();
  const { tenant, subscription } = useTenantContext();

  const status = statusConfig[tenant?.status || 'trial'];
  const plano = planoConfig[tenant?.plano || 'starter'];
  const StatusIcon = status.icon;

  // Calcular dias restantes do trial
  const trialDaysLeft = tenant?.trial_termina_em 
    ? Math.max(0, differenceInDays(new Date(tenant.trial_termina_em), new Date()))
    : null;

  return (
    <div className="space-y-6">
      {/* Header de boas-vindas */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">
            Bem-vindo, {user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua conta e acompanhe seu plano
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={status.variant}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
          <Badge variant={plano.variant}>
            <Sparkles className="h-3 w-3 mr-1" />
            {plano.label}
          </Badge>
        </div>
      </motion.div>

      {/* Alert de Trial */}
      {tenant?.status === 'trial' && trialDaysLeft !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Período de teste</p>
                    <p className="text-sm text-muted-foreground">
                      {trialDaysLeft > 0 
                        ? `Restam ${trialDaysLeft} dias do seu trial` 
                        : 'Seu trial expirou'}
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link to="/cliente/assinatura">
                    Ativar plano
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              {trialDaysLeft > 0 && (
                <Progress 
                  value={(trialDaysLeft / 14) * 100} 
                  className="mt-3 h-2"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cards principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card Empresa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sua Empresa</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                {tenant?.logo_url ? (
                  <img 
                    src={tenant.logo_url} 
                    alt={tenant.nome_empresa} 
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{tenant?.nome_fantasia || tenant?.nome_empresa || 'Minha Empresa'}</h3>
                  <p className="text-sm text-muted-foreground">{tenant?.email_contato || '--'}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/cliente/configuracoes">
                  Editar dados
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Plano */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge variant={plano.variant} className="mb-2">
                  <Sparkles className="h-4 w-4 mr-1" />
                  {plano.label}
                </Badge>
                {tenant?.valor_mensal && (
                  <p className="mt-2 text-2xl font-bold">
                    {formatCurrency(tenant.valor_mensal)}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                )}
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/cliente/assinatura">
                  Ver detalhes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Módulos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Módulos Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-3xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">módulos habilitados</p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/cliente/modulos">
                  Gerenciar módulos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Informações da conta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>Detalhes da sua assinatura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cliente desde</p>
                <p className="font-medium">
                  {tenant?.criado_em 
                    ? format(new Date(tenant.criado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : '--'
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email de contato</p>
                <p className="font-medium">{tenant?.email_contato || user?.email || '--'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{tenant?.telefone || '--'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Próxima cobrança</p>
                <p className="font-medium">
                  {subscription?.data_vencimento 
                    ? format(new Date(subscription.data_vencimento), "dd/MM/yyyy")
                    : '--'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
