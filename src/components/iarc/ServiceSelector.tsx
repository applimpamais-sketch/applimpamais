import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useServicosAgrupadosIARC, ServicoIARC } from '@/hooks/useServicosParaIARC';

interface ServiceSelectorProps {
  selected: ServicoIARC | null;
  onSelect: (servico: ServicoIARC) => void;
}

// Ícones por categoria
const getCategoriaIcon = (categoria: string): string => {
  const icones: Record<string, string> = {
    'MAIS AGENDADOS': '⭐',
    'ESTOFADOS': '🛋️',
    'COLCHÕES': '🛏️',
    'CADEIRAS': '🪑',
    'AUTOMOTIVO': '🚗',
    'ESPECIAIS': '✨',
  };
  return icones[categoria] || '📦';
};

export function ServiceSelector({ selected, onSelect }: ServiceSelectorProps) {
  const { itensUnicos, isLoading } = useServicosAgrupadosIARC();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredServicos = itensUnicos.filter(servico => 
    servico.subcategoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Services Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filteredServicos.map((servico) => {
          const isSelected = selected?.id === servico.id || 
                            (selected?.subcategoria === servico.subcategoria);
          const preco = servico.preco_limpeza || servico.preco_impermeabilizacao;
          
          return (
            <button
              key={servico.id}
              onClick={() => onSelect(servico)}
              className={cn(
                'relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md',
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              
              {/* Icon */}
              <div className="text-2xl mb-2">
                {getCategoriaIcon(servico.categoria)}
              </div>
              
              {/* Name */}
              <div className="font-medium text-sm line-clamp-2">
                {servico.subcategoria}
              </div>
              
              {/* Price */}
              {preco && (
                <div className="text-xs text-muted-foreground mt-1">
                  a partir de R$ {preco.toFixed(0)}
                </div>
              )}
              
              {/* Category badge */}
              <Badge variant="outline" className="mt-2 text-xs">
                {servico.categoria}
              </Badge>
            </button>
          );
        })}
      </div>
      
      {filteredServicos.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum serviço encontrado</p>
        </div>
      )}
    </div>
  );
}
