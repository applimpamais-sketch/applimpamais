import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import CupomCard from '@/components/ui/cupom-card';
import { CupomLeadCaptureModal } from '@/components/modals/CupomLeadCaptureModal';
import { Sparkles, Gift, TrendingUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePublicTenantId } from '@/hooks/usePublicTenantId';

const Cupons = () => {
  const navigate = useNavigate();
  const [selectedCupom, setSelectedCupom] = useState<string | null>(null);
  const { data: tenantId } = usePublicTenantId();

  const { data: cupons, isLoading } = useQuery({
    queryKey: ['cupons-publicos', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const supabaseForPublicCupons = createClient<Database>(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        {
          global: {
            headers: {
              'x-tenant-id': tenantId,
            },
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

      const { data, error } = await supabaseForPublicCupons
        .from('cupons_desconto')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'ativo')
        .contains('categorias_aplicaveis', ['home'])
        .order('desconto_percentual', { ascending: false });
      
      if (error) throw error;

      // Filtrar válidos por data e uso
      const hoje = new Date();
      return data?.filter(cupom => {
        const validadeInicio = cupom.data_validade_inicio 
          ? new Date(cupom.data_validade_inicio) 
          : null;
        const validadeFim = cupom.data_validade_fim 
          ? new Date(cupom.data_validade_fim) 
          : null;

        if (validadeInicio && hoje < validadeInicio) return false;
        if (validadeFim && hoje > validadeFim) return false;
        if (cupom.uso_maximo && cupom.uso_atual >= cupom.uso_maximo) return false;

        return true;
      }) || [];
    },
    enabled: !!tenantId,
  });

  const handleCopiarCupom = (codigo: string) => {
    setSelectedCupom(codigo);
  };

  const cuponsDisponiveis = cupons?.length || 0;
  const maiorDesconto = cupons?.[0]?.desconto_percentual || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Premium */}
      <section className="relative bg-gradient-to-br from-primary/15 via-green-500/10 to-background py-20 px-4 border-b overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-block animate-fade-in">
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2.5 text-base shadow-lg border-0">
                <Sparkles className="w-4 h-4 mr-2 inline animate-pulse" />
                Promoções Exclusivas
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
              Cupons de Desconto para
              <span className="text-primary block mt-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Limpeza Residencial
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
              Economize na limpeza de sofás, colchões, tapetes e muito mais!
              Copie seu cupom e aproveite descontos imperdíveis.
            </p>

            {/* CTA Principal */}
            <div className="pt-4 animate-fade-in" style={{ animationDelay: '250ms' }}>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-0"
                onClick={() => {
                localStorage.setItem('showCupomPopup', 'true');
                  localStorage.setItem('cupomPopupCodigo', 'LIMPA10');
                  navigate('/');
                }}
              >
                <Gift className="mr-2 h-5 w-5" />
                Ganhar 10% OFF Agora
              </Button>
            </div>
            
            {/* Glassmorphism Metrics Cards */}
            <div className="flex items-center justify-center gap-6 pt-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative backdrop-blur-lg bg-background/40 border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center mb-2">
                    <Sparkles className="w-5 h-5 text-primary mr-2 animate-pulse" />
                  </div>
                  <p className="text-5xl font-bold bg-gradient-to-br from-primary to-blue-600 bg-clip-text text-transparent mb-1">
                    {cuponsDisponiveis}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Cupons Ativos</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative backdrop-blur-lg bg-background/40 border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-2 animate-pulse" />
                  </div>
                  <p className="text-5xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                    {maiorDesconto}%
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Maior Desconto</p>
                </div>
              </div>
            </div>
            
            {/* CTA Scroll Button */}
            <button 
              onClick={() => document.getElementById('cupons-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-all duration-300 hover:scale-105 mt-4 animate-fade-in"
              style={{ animationDelay: '400ms' }}
            >
              Ver Cupons Disponíveis
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* Grid de Cupons */}
      <section id="cupons-grid" className="max-w-7xl mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-72 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl animate-pulse relative overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            ))}
          </div>
        ) : cupons && cupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cupons.map((cupom, index) => (
              <div 
                key={cupom.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CupomCard
                  codigo={cupom.codigo}
                  desconto={cupom.desconto_percentual}
                  validade={cupom.data_validade_fim}
                  usoMaximo={cupom.uso_maximo}
                  usoAtual={cupom.uso_atual}
                  onCopiar={() => handleCopiarCupom(cupom.codigo)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum cupom disponível no momento
            </h3>
            <p className="text-muted-foreground">
              Volte em breve para conferir novas promoções!
            </p>
          </div>
        )}
      </section>

      {/* Modal de Captura */}
      <CupomLeadCaptureModal
        isOpen={!!selectedCupom}
        onClose={() => setSelectedCupom(null)}
        cupomCodigo={selectedCupom || ''}
      />
    </div>
  );
};

export default Cupons;
