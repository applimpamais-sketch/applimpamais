import { useState, useEffect, ComponentType } from 'react';
import { useModulosCatalogo, SaasModulo } from '@/hooks/useTenantModules';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Package, Info, LayoutDashboard, ShoppingCart, DollarSign,
  MessageSquare, MapPin, Megaphone, FileText, Users, BarChart3, Code, Palette,
  Bot, Sparkles, UserPlus, Cable, Crown, Zap,
  LucideProps
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Mapeamento de ícones
const iconMap: Record<string, ComponentType<LucideProps>> = {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  MapPin,
  Megaphone,
  FileText,
  Users,
  BarChart3,
  Code,
  Palette,
  Package,
  Bot,
  Sparkles,
  UserPlus,
  Cable,
  Crown,
  Zap,
};

interface ModuloSelecionado {
  modulo_id: string;
  codigo: string;
  preco_negociado: number | null;
}

interface ModuloSelectorProps {
  selected: ModuloSelecionado[];
  onChange: (modulos: ModuloSelecionado[]) => void;
}

const categoriaLabels: Record<string, string> = {
  core: 'Core',
  gestao: 'Gestão',
  automacao: 'Automação',
  operacao: 'Operação',
  marketing: 'Marketing',
  vendas: 'Vendas',
  integracao: 'Integração',
  premium: 'Premium',
};

const categoriaCores: Record<string, string> = {
  core: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  gestao: 'bg-green-500/10 text-green-500 border-green-500/20',
  automacao: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  operacao: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  marketing: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  vendas: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  integracao: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  premium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export function ModuloSelector({ selected, onChange }: ModuloSelectorProps) {
  const { data: catalogo, isLoading } = useModulosCatalogo();
  const [precosCustom, setPrecosCustom] = useState<Record<string, string>>({});

  useEffect(() => {
    // Inicializar preços customizados
    const precos: Record<string, string> = {};
    selected.forEach(s => {
      if (s.preco_negociado !== null) {
        precos[s.modulo_id] = s.preco_negociado.toString();
      }
    });
    setPrecosCustom(precos);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSelected = (moduloId: string) => {
    return selected.some(s => s.modulo_id === moduloId);
  };

  const toggleModulo = (modulo: SaasModulo) => {
    if (isSelected(modulo.id)) {
      // Remover
      onChange(selected.filter(s => s.modulo_id !== modulo.id));
    } else {
      // Adicionar
      const precoCustom = precosCustom[modulo.id];
      onChange([
        ...selected,
        {
          modulo_id: modulo.id,
          codigo: modulo.codigo,
          preco_negociado: precoCustom ? parseFloat(precoCustom) : modulo.preco_base,
        },
      ]);
    }
  };

  const updatePreco = (moduloId: string, codigo: string, valor: string) => {
    setPrecosCustom(prev => ({ ...prev, [moduloId]: valor }));
    
    // Atualizar no array de selecionados se já estiver selecionado
    if (isSelected(moduloId)) {
      onChange(
        selected.map(s =>
          s.modulo_id === moduloId
            ? { ...s, preco_negociado: valor ? parseFloat(valor) : null }
            : s
        )
      );
    }
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return Package;
    return iconMap[iconName] || Package;
  };

  const totalMensal = selected.reduce((sum, s) => {
    const modulo = catalogo?.find(m => m.id === s.modulo_id);
    const preco = s.preco_negociado ?? modulo?.preco_base ?? 0;
    return sum + preco;
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Agrupar por categoria
  const modulosPorCategoria = (catalogo || []).reduce((acc, modulo) => {
    const cat = modulo.categoria || 'outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(modulo);
    return acc;
  }, {} as Record<string, SaasModulo[]>);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Módulos selecionados</p>
              <p className="text-2xl font-bold">{selected.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total mensal</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalMensal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de módulos por categoria */}
      {Object.entries(modulosPorCategoria).map(([categoria, modulos]) => (
        <div key={categoria} className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={categoriaCores[categoria] || 'bg-muted'}
            >
              {categoriaLabels[categoria] || categoria}
            </Badge>
          </div>

          <div className="grid gap-3">
            {modulos.map(modulo => {
              const Icon = getIcon(modulo.icone);
              const selecionado = isSelected(modulo.id);
              const precoFinal = precosCustom[modulo.id] 
                ? parseFloat(precosCustom[modulo.id]) 
                : modulo.preco_base;

              return (
                <Card 
                  key={modulo.id}
                  className={`cursor-pointer transition-all ${
                    selecionado 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => toggleModulo(modulo)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selecionado}
                        onCheckedChange={() => toggleModulo(modulo)}
                        onClick={e => e.stopPropagation()}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{modulo.nome}</span>
                          
                          {modulo.dependencias && modulo.dependencias.length > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    Requer: {modulo.dependencias.join(', ')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        
                        {modulo.descricao && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {modulo.descricao}
                          </p>
                        )}
                      </div>

                      <div className="text-right space-y-1" onClick={e => e.stopPropagation()}>
                        <p className="text-xs text-muted-foreground">
                          Base: {formatCurrency(modulo.preco_base)}/mês
                        </p>
                        {selecionado && (
                          <div className="flex items-center gap-1">
                            <Label className="text-xs">R$</Label>
                            <Input
                              type="number"
                              value={precosCustom[modulo.id] || modulo.preco_base}
                              onChange={e => updatePreco(modulo.id, modulo.codigo, e.target.value)}
                              className="w-20 h-7 text-sm"
                              min={0}
                              step={0.01}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
