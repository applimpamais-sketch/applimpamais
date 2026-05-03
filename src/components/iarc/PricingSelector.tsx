import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DollarSign, Tag, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EstrategiaPreco = 'sem_preco' | 'com_preco' | 'promocional';

export interface PrecosConfig {
  estrategia: EstrategiaPreco;
  precoOriginal?: number;
  precoFinal?: number;
  descontoPercent?: number;
}

interface PricingSelectorProps {
  precoBase: number | null;
  value: PrecosConfig;
  onChange: (config: PrecosConfig) => void;
}

const estrategias = [
  {
    value: 'sem_preco' as const,
    label: 'Sem preço',
    description: 'Focar apenas nos benefícios',
    icon: Tag,
  },
  {
    value: 'com_preco' as const,
    label: 'Com preço fixo',
    description: 'Mostrar valor direto',
    icon: DollarSign,
  },
  {
    value: 'promocional' as const,
    label: 'Promocional',
    description: 'De X por Y (desconto)',
    icon: Percent,
  },
];

export function PricingSelector({ precoBase, value, onChange }: PricingSelectorProps) {
  const [localPrecoOriginal, setLocalPrecoOriginal] = useState<string>(
    value.precoOriginal?.toString() || ''
  );
  const [localPrecoFinal, setLocalPrecoFinal] = useState<string>(
    value.precoFinal?.toString() || precoBase?.toString() || ''
  );
  
  // Calcular desconto quando preços mudam
  useEffect(() => {
    if (value.estrategia === 'promocional' && localPrecoOriginal && localPrecoFinal) {
      const original = parseFloat(localPrecoOriginal);
      const final = parseFloat(localPrecoFinal);
      if (original > 0 && final > 0) {
        const desconto = Math.round(((original - final) / original) * 100);
        onChange({
          ...value,
          precoOriginal: original,
          precoFinal: final,
          descontoPercent: desconto,
        });
      }
    } else if (value.estrategia === 'com_preco' && localPrecoFinal) {
      onChange({
        ...value,
        precoFinal: parseFloat(localPrecoFinal),
      });
    }
  }, [localPrecoOriginal, localPrecoFinal, value.estrategia]);
  
  const handleEstrategiaChange = (estrategia: EstrategiaPreco) => {
    onChange({
      estrategia,
      precoOriginal: estrategia === 'promocional' ? parseFloat(localPrecoOriginal) || undefined : undefined,
      precoFinal: estrategia !== 'sem_preco' ? parseFloat(localPrecoFinal) || precoBase || undefined : undefined,
    });
  };
  
  return (
    <div className="space-y-6">
      <RadioGroup 
        value={value.estrategia} 
        onValueChange={(v) => handleEstrategiaChange(v as EstrategiaPreco)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {estrategias.map((estrategia) => (
          <label
            key={estrategia.value}
            className={cn(
              'relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all',
              value.estrategia === estrategia.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <RadioGroupItem value={estrategia.value} className="sr-only" />
            <estrategia.icon className={cn(
              'h-6 w-6 mb-2',
              value.estrategia === estrategia.value ? 'text-primary' : 'text-muted-foreground'
            )} />
            <span className="font-medium text-sm">{estrategia.label}</span>
            <span className="text-xs text-muted-foreground text-center mt-1">
              {estrategia.description}
            </span>
          </label>
        ))}
      </RadioGroup>
      
      {/* Campos de preço condicionais */}
      {value.estrategia === 'promocional' && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="preco-original">Preço Original (de)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="preco-original"
                type="number"
                placeholder="220"
                value={localPrecoOriginal}
                onChange={(e) => setLocalPrecoOriginal(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preco-final">Preço Promocional (por)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="preco-final"
                type="number"
                placeholder={precoBase?.toString() || '160'}
                value={localPrecoFinal}
                onChange={(e) => setLocalPrecoFinal(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {value.descontoPercent && value.descontoPercent > 0 && (
            <div className="col-span-2 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                <Percent className="h-4 w-4 mr-1" />
                {value.descontoPercent}% de desconto
              </span>
            </div>
          )}
        </div>
      )}
      
      {value.estrategia === 'com_preco' && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="preco-fixo">Preço do Serviço</Label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="preco-fixo"
                type="number"
                placeholder={precoBase?.toString() || '160'}
                value={localPrecoFinal}
                onChange={(e) => setLocalPrecoFinal(e.target.value)}
                className="pl-10"
              />
            </div>
            {precoBase && (
              <p className="text-xs text-muted-foreground">
                Preço base do catálogo: R$ {precoBase.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
