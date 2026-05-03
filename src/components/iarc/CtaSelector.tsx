import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ShoppingCart, FileText, Lock } from 'lucide-react';
import { useTenantModules } from '@/hooks/useTenantModules';
import { cn } from '@/lib/utils';

export type DestinoCta = 'whatsapp' | 'checkout' | 'formulario';

interface CtaSelectorProps {
  value: DestinoCta;
  onChange: (value: DestinoCta) => void;
}

export function CtaSelector({ value, onChange }: CtaSelectorProps) {
  const { hasModule } = useTenantModules();
  const shopProAtivo = hasModule('shop_pro');
  
  const opcoes = [
    {
      value: 'whatsapp' as const,
      label: 'WhatsApp',
      description: 'Lead envia mensagem pré-preenchida',
      icon: MessageCircle,
      color: 'text-green-500',
      available: true,
    },
    {
      value: 'checkout' as const,
      label: 'Checkout Direto',
      description: 'Compra online com pagamento',
      icon: ShoppingCart,
      color: 'text-blue-500',
      available: shopProAtivo,
      badge: !shopProAtivo ? 'Requer Shop Pro' : undefined,
    },
    {
      value: 'formulario' as const,
      label: 'Formulário de Lead',
      description: 'Captura nome, e-mail e telefone',
      icon: FileText,
      color: 'text-purple-500',
      available: true,
    },
  ];
  
  return (
    <RadioGroup 
      value={value} 
      onValueChange={(v) => onChange(v as DestinoCta)}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {opcoes.map((opcao) => (
        <label
          key={opcao.value}
          className={cn(
            'relative flex flex-col p-4 rounded-xl border-2 transition-all',
            opcao.available 
              ? 'cursor-pointer hover:border-primary/50' 
              : 'cursor-not-allowed opacity-60',
            value === opcao.value
              ? 'border-primary bg-primary/5'
              : 'border-border'
          )}
        >
          <RadioGroupItem 
            value={opcao.value} 
            className="sr-only"
            disabled={!opcao.available}
          />
          
          {/* Lock icon for unavailable */}
          {!opcao.available && (
            <div className="absolute top-2 right-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg bg-muted', opcao.color)}>
              <opcao.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{opcao.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {opcao.description}
              </div>
              {opcao.badge && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {opcao.badge}
                </Badge>
              )}
            </div>
          </div>
        </label>
      ))}
    </RadioGroup>
  );
}
