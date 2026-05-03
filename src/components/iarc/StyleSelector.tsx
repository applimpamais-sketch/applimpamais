import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Palette, Zap, Briefcase, Sparkles, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EstiloCriativo = 'minimalista' | 'vibrante' | 'profissional' | 'moderno' | 'elegante';

interface StyleSelectorProps {
  value: EstiloCriativo;
  onChange: (value: EstiloCriativo) => void;
}

const estilos = [
  {
    value: 'minimalista' as const,
    label: 'Minimalista',
    description: 'Clean e elegante, muito espaço em branco',
    icon: Palette,
    gradient: 'from-slate-400 to-slate-600',
  },
  {
    value: 'vibrante' as const,
    label: 'Vibrante',
    description: 'Cores vivas e impactantes',
    icon: Zap,
    gradient: 'from-pink-500 to-orange-500',
  },
  {
    value: 'profissional' as const,
    label: 'Profissional',
    description: 'Corporativo e confiável',
    icon: Briefcase,
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    value: 'moderno' as const,
    label: 'Moderno',
    description: 'Tendências atuais de design',
    icon: Sparkles,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    value: 'elegante' as const,
    label: 'Elegante',
    description: 'Sofisticado e premium',
    icon: Crown,
    gradient: 'from-amber-400 to-amber-600',
  },
];

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <RadioGroup 
      value={value} 
      onValueChange={(v) => onChange(v as EstiloCriativo)}
      className="grid grid-cols-2 md:grid-cols-5 gap-3"
    >
      {estilos.map((estilo) => (
        <label
          key={estilo.value}
          className={cn(
            'relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all',
            value === estilo.value
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border hover:border-primary/50'
          )}
        >
          <RadioGroupItem value={estilo.value} className="sr-only" />
          
          <div className={cn(
            'p-3 rounded-xl bg-gradient-to-br text-white mb-2',
            estilo.gradient
          )}>
            <estilo.icon className="h-5 w-5" />
          </div>
          
          <span className="font-medium text-sm text-center">{estilo.label}</span>
          <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
            {estilo.description}
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
