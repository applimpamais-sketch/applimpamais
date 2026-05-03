import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Timer, Star, Shield, ArrowLeftRight, MessageSquareQuote, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ElementosConfig {
  timer: boolean;
  depoimentos: boolean;
  garantia: boolean;
  antesDepois: boolean;
  urgencia: boolean;
  prova_social: boolean;
}

interface ElementsSelectorProps {
  value: ElementosConfig;
  onChange: (config: ElementosConfig) => void;
  mode: 'criativo' | 'landing_page';
}

const elementosOptions = [
  {
    key: 'timer' as const,
    label: 'Timer de Urgência',
    description: 'Contagem regressiva para criar urgência',
    icon: Timer,
    color: 'text-red-500',
    availableFor: ['criativo', 'landing_page'],
  },
  {
    key: 'depoimentos' as const,
    label: 'Depoimentos',
    description: 'Avaliações de clientes satisfeitos',
    icon: MessageSquareQuote,
    color: 'text-yellow-500',
    availableFor: ['landing_page'],
  },
  {
    key: 'garantia' as const,
    label: 'Garantia',
    description: 'Selo de garantia de satisfação',
    icon: Shield,
    color: 'text-green-500',
    availableFor: ['criativo', 'landing_page'],
  },
  {
    key: 'antesDepois' as const,
    label: 'Antes/Depois',
    description: 'Comparação visual do resultado',
    icon: ArrowLeftRight,
    color: 'text-blue-500',
    availableFor: ['criativo', 'landing_page'],
  },
  {
    key: 'urgencia' as const,
    label: 'Texto de Urgência',
    description: '"Últimas vagas", "Oferta por tempo limitado"',
    icon: Flame,
    color: 'text-orange-500',
    availableFor: ['criativo', 'landing_page'],
  },
  {
    key: 'prova_social' as const,
    label: 'Prova Social',
    description: 'Quantidade de clientes atendidos',
    icon: Star,
    color: 'text-purple-500',
    availableFor: ['criativo', 'landing_page'],
  },
];

export function ElementsSelector({ value, onChange, mode }: ElementsSelectorProps) {
  const availableElements = elementosOptions.filter(el => el.availableFor.includes(mode));
  
  const handleChange = (key: keyof ElementosConfig, checked: boolean) => {
    onChange({
      ...value,
      [key]: checked,
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {availableElements.map((elemento) => (
        <label
          key={elemento.key}
          className={cn(
            'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
            value[elemento.key]
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
        >
          <Checkbox
            checked={value[elemento.key]}
            onCheckedChange={(checked) => handleChange(elemento.key, checked === true)}
            className="mt-0.5"
          />
          <div className="flex items-start gap-2 flex-1">
            <div className={cn('p-1.5 rounded-md bg-muted', elemento.color)}>
              <elemento.icon className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-sm">{elemento.label}</div>
              <div className="text-xs text-muted-foreground">
                {elemento.description}
              </div>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}
