import { SaasTenant } from '@/hooks/useTenants';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenantCardProps {
  tenant: SaasTenant;
  compact?: boolean;
  onClick?: () => void;
}

const statusConfig = {
  trial: { label: 'Trial', variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  ativo: { label: 'Ativo', variant: 'outline' as const, className: 'bg-green-100 text-green-800 border-green-200' },
  inadimplente: { label: 'Inadimplente', variant: 'outline' as const, className: 'bg-red-100 text-red-800 border-red-200' },
  cancelado: { label: 'Cancelado', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' },
  pausado: { label: 'Pausado', variant: 'outline' as const, className: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const planoConfig = {
  starter: { label: 'Starter', className: 'bg-blue-500' },
  professional: { label: 'Professional', className: 'bg-violet-500' },
  enterprise: { label: 'Enterprise', className: 'bg-amber-500' },
};

export function TenantCard({ tenant, compact = false, onClick }: TenantCardProps) {
  const status = statusConfig[tenant.status];
  const plano = planoConfig[tenant.plano];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-white", plano.className)}>
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">{tenant.nome_fantasia || tenant.nome_empresa}</p>
            <p className="text-sm text-muted-foreground">{tenant.responsavel_nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={status.variant} className={status.className}>
            {status.label}
          </Badge>
          <span className="font-medium text-sm">
            {formatCurrency(tenant.valor_mensal)}/mês
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "p-4 rounded-lg border bg-card hover:shadow-md transition-all",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center text-white", plano.className)}>
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">{tenant.nome_fantasia || tenant.nome_empresa}</h3>
            <p className="text-sm text-muted-foreground">{tenant.cnpj || 'CNPJ não informado'}</p>
          </div>
        </div>
        <Badge variant={status.variant} className={status.className}>
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Responsável</p>
          <p className="font-medium">{tenant.responsavel_nome}</p>
          <p className="text-muted-foreground text-xs">{tenant.responsavel_email}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Contato</p>
          <p className="font-medium">{tenant.email_contato}</p>
          <p className="text-muted-foreground text-xs">{tenant.telefone || '-'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatCurrency(tenant.valor_mensal)}/mês</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {plano.label}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Desde {formatDate(tenant.criado_em)}</span>
        </div>
      </div>

      {tenant.status === 'trial' && tenant.trial_termina_em && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
          Trial expira em: <strong>{formatDate(tenant.trial_termina_em)}</strong>
        </div>
      )}
    </div>
  );
}
