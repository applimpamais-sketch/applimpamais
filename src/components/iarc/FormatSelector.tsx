import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Square, RectangleVertical, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TipoCriativo = 'feed' | 'stories' | 'carrossel';

interface FormatSelectorProps {
  value: TipoCriativo;
  onChange: (value: TipoCriativo) => void;
}

const formatos = [
  {
    value: 'feed' as const,
    label: 'Feed',
    dimensao: '1080x1080',
    icon: Square,
    aspectClass: 'aspect-square',
  },
  {
    value: 'stories' as const,
    label: 'Stories',
    dimensao: '1080x1920',
    icon: RectangleVertical,
    aspectClass: 'aspect-[9/16]',
  },
  {
    value: 'carrossel' as const,
    label: 'Carrossel',
    dimensao: '1080x1080 (x3-5)',
    icon: LayoutGrid,
    aspectClass: 'aspect-square',
  },
];

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <RadioGroup 
      value={value} 
      onValueChange={(v) => onChange(v as TipoCriativo)}
      className="grid grid-cols-3 gap-4"
    >
      {formatos.map((formato) => (
        <label
          key={formato.value}
          className={cn(
            'relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all',
            value === formato.value
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border hover:border-primary/50'
          )}
        >
          <RadioGroupItem value={formato.value} className="sr-only" />
          
          <formato.icon className={cn(
            'h-8 w-8 mb-2',
            value === formato.value ? 'text-primary' : 'text-muted-foreground'
          )} />
          
          <span className="font-medium text-sm">{formato.label}</span>
          <span className="text-xs text-muted-foreground">{formato.dimensao}</span>
        </label>
      ))}
    </RadioGroup>
  );
}
