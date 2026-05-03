import { useState, ComponentType } from 'react';
import { useModulosCatalogo, SaasModulo } from '@/hooks/useTenantModules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Loader2, Package, LayoutDashboard, ShoppingCart, DollarSign,
  MessageSquare, MapPin, Megaphone, FileText, Users, BarChart3, Code, Palette,
  Bot, Sparkles, UserPlus, Cable, Crown, Zap, Search, Grid3X3, List,
  CheckCircle2, ArrowRight, Star, TrendingUp, Calendar,
  LucideProps
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mapeamento de ícones
const iconMap: Record<string, ComponentType<LucideProps>> = {
  LayoutDashboard, ShoppingCart, DollarSign, MessageSquare, MapPin,
  Megaphone, FileText, Users, BarChart3, Code, Palette, Package,
  Bot, Sparkles, UserPlus, Cable, Crown, Zap,
};

const categoriaConfig: Record<string, { label: string; color: string; gradient: string }> = {
  core: { 
    label: 'Core', 
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    gradient: 'from-blue-500 to-blue-600'
  },
  gestao: { 
    label: 'Gestão', 
    color: 'bg-green-500/10 text-green-500 border-green-500/30',
    gradient: 'from-green-500 to-emerald-600'
  },
  automacao: { 
    label: 'Automação', 
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    gradient: 'from-purple-500 to-violet-600'
  },
  operacao: { 
    label: 'Operação', 
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    gradient: 'from-orange-500 to-amber-600'
  },
  marketing: { 
    label: 'Marketing', 
    color: 'bg-pink-500/10 text-pink-500 border-pink-500/30',
    gradient: 'from-pink-500 to-rose-600'
  },
  vendas: { 
    label: 'Vendas', 
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    gradient: 'from-yellow-500 to-orange-500'
  },
  integracao: { 
    label: 'Integração', 
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
    gradient: 'from-cyan-500 to-teal-600'
  },
  premium: { 
    label: 'Premium', 
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    gradient: 'from-amber-500 to-yellow-500'
  },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

function ModuloCard({ modulo, index, onViewDetails }: { 
  modulo: SaasModulo; 
  index: number;
  onViewDetails: (modulo: SaasModulo) => void;
}) {
  const Icon = iconMap[modulo.icone || ''] || Package;
  const catConfig = categoriaConfig[modulo.categoria || 'core'] || categoriaConfig.core;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 h-full",
        "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
        "border-border/50 hover:border-primary/30"
      )}>
        {/* Gradient Background on Hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br",
          catConfig.gradient,
          isHovered && "opacity-5"
        )} />

        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between gap-4">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              "bg-gradient-to-br shadow-lg transition-transform duration-300",
              catConfig.gradient,
              isHovered && "scale-110"
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant="outline" 
                className={cn("text-xs font-medium", catConfig.color)}
              >
                {catConfig.label}
              </Badge>
              {modulo.preco_base > 0 && (
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(modulo.preco_base)}
                  </p>
                  <p className="text-xs text-muted-foreground">/mês</p>
                </div>
              )}
              {modulo.preco_base === 0 && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                  Incluído
                </Badge>
              )}
            </div>
          </div>
          
          <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
            {modulo.nome}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {modulo.descricao && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {modulo.descricao}
            </p>
          )}

          {/* Features/Benefits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Instalação imediata</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Suporte dedicado</span>
            </div>
            {modulo.dependencias && modulo.dependencias.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <Cable className="h-4 w-4" />
                <span>Requer: {modulo.dependencias.join(', ')}</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="pt-2"
              >
                <Button 
                  variant="outline" 
                  className="w-full group/btn"
                  size="sm"
                  onClick={() => onViewDetails(modulo)}
                >
                  Ver detalhes
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {/* Code Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-mono text-muted-foreground/50 uppercase">
            {modulo.codigo}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

function StatsCards({ modulos }: { modulos: SaasModulo[] }) {
  const totalModulos = modulos.length;
  const valorTotal = modulos.reduce((sum, m) => sum + m.preco_base, 0);
  const categorias = [...new Set(modulos.map(m => m.categoria))].length;
  const modulosGratis = modulos.filter(m => m.preco_base === 0).length;

  const stats = [
    { 
      label: 'Total de Módulos', 
      value: totalModulos, 
      icon: Grid3X3, 
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      label: 'Valor Total', 
      value: formatCurrency(valorTotal), 
      icon: TrendingUp, 
      color: 'from-green-500 to-emerald-600' 
    },
    { 
      label: 'Categorias', 
      value: categorias, 
      icon: Star, 
      color: 'from-purple-500 to-violet-600' 
    },
    { 
      label: 'Módulos Inclusos', 
      value: modulosGratis, 
      icon: CheckCircle2, 
      color: 'from-amber-500 to-orange-500' 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  "bg-gradient-to-br",
                  stat.color
                )}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export default function CatalogoModulos() {
  const { data: catalogo, isLoading } = useModulosCatalogo();
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [moduloSelecionado, setModuloSelecionado] = useState<SaasModulo | null>(null);

  // Get config for selected module
  const selectedIcon = moduloSelecionado ? (iconMap[moduloSelecionado.icone || ''] || Package) : Package;
  const selectedCatConfig = moduloSelecionado 
    ? (categoriaConfig[moduloSelecionado.categoria || 'core'] || categoriaConfig.core)
    : categoriaConfig.core;

  const modulosFiltrados = (catalogo || []).filter(modulo => {
    const matchBusca = !busca || 
      modulo.nome.toLowerCase().includes(busca.toLowerCase()) ||
      modulo.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      modulo.codigo.toLowerCase().includes(busca.toLowerCase());
    
    const matchCategoria = !categoriaFiltro || modulo.categoria === categoriaFiltro;
    
    return matchBusca && matchCategoria;
  });

  const categorias = [...new Set((catalogo || []).map(m => m.categoria))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Catálogo de Módulos
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore todos os módulos disponíveis para seus clientes
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards modulos={catalogo || []} />

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar módulos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={categoriaFiltro === null ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setCategoriaFiltro(null)}
              >
                Todos
              </Button>
              {categorias.map(cat => {
                const config = categoriaConfig[cat || 'core'] || categoriaConfig.core;
                return (
                  <Button
                    key={cat}
                    variant={categoriaFiltro === cat ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setCategoriaFiltro(cat || null)}
                    className={cn(
                      categoriaFiltro === cat && config.color
                    )}
                  >
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <AnimatePresence mode="wait">
        {modulosFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum módulo encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
          </motion.div>
        ) : (
          <motion.div
            key={`${busca}-${categoriaFiltro}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            )}
          >
            {modulosFiltrados.map((modulo, index) => (
              <ModuloCard 
                key={modulo.id} 
                modulo={modulo} 
                index={index} 
                onViewDetails={setModuloSelecionado}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes do Módulo */}
      <Dialog 
        open={!!moduloSelecionado} 
        onOpenChange={() => setModuloSelecionado(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                selectedCatConfig.gradient
              )}>
                {(() => {
                  const IconComponent = selectedIcon;
                  return <IconComponent className="h-7 w-7 text-white" />;
                })()}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">
                  {moduloSelecionado?.nome}
                </DialogTitle>
                <Badge 
                  variant="outline" 
                  className={cn("mt-1", selectedCatConfig.color)}
                >
                  {selectedCatConfig.label}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          {/* Descrição */}
          {moduloSelecionado?.descricao && (
            <p className="text-muted-foreground leading-relaxed">
              {moduloSelecionado.descricao}
            </p>
          )}
          
          <Separator />
          
          {/* Grid de informações */}
          <div className="grid grid-cols-2 gap-4">
            {/* Preço */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Preço Base</p>
              {moduloSelecionado?.preco_base === 0 ? (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                  Incluído no plano
                </Badge>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(moduloSelecionado?.preco_base || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">/mês</p>
                </div>
              )}
            </div>
            
            {/* Código */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Código Técnico</p>
              <Badge variant="secondary" className="font-mono text-xs">
                {moduloSelecionado?.codigo}
              </Badge>
            </div>
          </div>
          
          {/* Dependências (se houver) */}
          {moduloSelecionado?.dependencias && moduloSelecionado.dependencias.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Cable className="h-4 w-4" />
                Requer os módulos:
              </p>
              <div className="flex flex-wrap gap-2">
                {moduloSelecionado.dependencias.map(dep => (
                  <Badge key={dep} variant="outline" className="text-amber-600 border-amber-500/30">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Separator />
          
          {/* Status e Data */}
          <div className="flex items-center justify-between text-sm">
            <Badge variant={moduloSelecionado?.ativo ? 'default' : 'secondary'}>
              {moduloSelecionado?.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
            {moduloSelecionado?.created_at && (
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Adicionado em: {format(new Date(moduloSelecionado.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
