import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BorderBeam } from '@/components/ui/border-beam';
import { 
  LayoutDashboard, ShoppingCart, Wallet, MessageCircle, MapPin, 
  TrendingUp, FileText, Users, BarChart3, Plug, Star, Palette,
  Loader2, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ModuloDetailSheet from './ModuloDetailSheet';

interface SaasModulo {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  preco_base: number | null;
  categoria: string | null;
  icone: string | null;
  ativo: boolean | null;
}

const iconMap: Record<string, React.ElementType> = {
  dashboard_gestao: LayoutDashboard,
  loja_online: ShoppingCart,
  financeiro: Wallet,
  whatsapp_bot: MessageCircle,
  rastreamento_rota: MapPin,
  marketing_tools: TrendingUp,
  blog_seo: FileText,
  parcerias: Users,
  relatorios_avancados: BarChart3,
  api_access: Plug,
  white_label: Star,
  iarc_criativos: Palette,
};

const categoryConfig: Record<string, { label: string; color: string; gradient: string }> = {
  core: { label: 'Core', color: 'text-blue-400 border-blue-400/30', gradient: 'from-blue-500 to-blue-600' },
  gestao: { label: 'Gestão', color: 'text-purple-400 border-purple-400/30', gradient: 'from-purple-500 to-purple-600' },
  automacao: { label: 'Automação', color: 'text-amber-400 border-amber-400/30', gradient: 'from-amber-500 to-amber-600' },
  operacao: { label: 'Operação', color: 'text-green-400 border-green-400/30', gradient: 'from-green-500 to-green-600' },
  marketing: { label: 'Marketing', color: 'text-pink-400 border-pink-400/30', gradient: 'from-pink-500 to-pink-600' },
  vendas: { label: 'Vendas', color: 'text-orange-400 border-orange-400/30', gradient: 'from-orange-500 to-orange-600' },
  integracao: { label: 'Integração', color: 'text-cyan-400 border-cyan-400/30', gradient: 'from-cyan-500 to-cyan-600' },
  premium: { label: 'Premium', color: 'text-yellow-400 border-yellow-400/30', gradient: 'from-yellow-500 to-yellow-600' },
};

const categories = ['todos', 'core', 'gestao', 'automacao', 'marketing', 'premium'];

export default function ModulesShowcase() {
  const [filter, setFilter] = useState('todos');
  const [selectedModulo, setSelectedModulo] = useState<SaasModulo | null>(null);

  const { data: modulos, isLoading } = useQuery({
    queryKey: ['saas-modulos-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saas_modulos')
        .select('*')
        .eq('ativo', true)
        .order('ordem');
      
      if (error) throw error;
      return data as SaasModulo[];
    }
  });

  const filteredModulos = modulos?.filter(m => 
    filter === 'todos' || m.categoria === filter
  );

  return (
    <section className="py-20 lg:py-32 bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[200px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            12 Módulos Integrados
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Tudo que Você Precisa, </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Em Um Só Lugar
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Escolha os módulos que fazem sentido para o seu negócio
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat)}
              className={cn(
                'capitalize',
                filter !== cat && 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              )}
            >
              {cat === 'todos' ? 'Todos' : categoryConfig[cat]?.label || cat}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}

        {/* Modules Grid */}
        {!isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModulos?.map((modulo, i) => {
              const IconComponent = iconMap[modulo.codigo] || LayoutDashboard;
              const catConfig = categoryConfig[modulo.categoria || 'core'] || categoryConfig.core;
              
              return (
                <div 
                  key={modulo.id}
                  className="group relative rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-black/80 p-6 hover:border-primary/50 transition-all duration-300 overflow-hidden cursor-pointer"
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => setSelectedModulo(modulo)}
                >
                  {/* Hover BorderBeam */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <BorderBeam size={200} duration={10} colorFrom="#3b82f6" colorTo="#06b6d4" />
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                    catConfig.gradient
                  )}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-white mb-2">{modulo.nome}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {modulo.descricao || 'Módulo poderoso para sua operação.'}
                  </p>

                  {/* Saiba Mais Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mb-4 text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Saiba mais
                  </Button>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <Badge variant="outline" className={cn('text-xs', catConfig.color)}>
                      {catConfig.label}
                    </Badge>
                    <span className="text-primary font-bold">
                      {modulo.preco_base ? `R$ ${modulo.preco_base}` : 'Incluído'}
                      {modulo.preco_base && <span className="text-xs text-gray-500">/mês</span>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Module Detail Sheet */}
        <ModuloDetailSheet 
          modulo={selectedModulo} 
          isOpen={!!selectedModulo} 
          onClose={() => setSelectedModulo(null)} 
        />
      </div>
    </section>
  );
}
