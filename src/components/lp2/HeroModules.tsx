import { ArrowRight, Play, LayoutDashboard, ShoppingCart, Wallet, MessageCircle, MapPin, TrendingUp, FileText, Users, BarChart3, Plug, Star, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const moduleIcons = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: ShoppingCart, label: 'Loja' },
  { icon: Wallet, label: 'Financeiro' },
  { icon: MessageCircle, label: 'WhatsApp Bot' },
  { icon: MapPin, label: 'Rastreamento' },
  { icon: TrendingUp, label: 'Marketing' },
  { icon: FileText, label: 'Blog SEO' },
  { icon: Users, label: 'Parcerias' },
  { icon: BarChart3, label: 'Relatórios' },
  { icon: Plug, label: 'API' },
  { icon: Star, label: 'White Label' },
  { icon: Palette, label: 'IARC Studio' },
];

const stats = [
  { value: '50+', label: 'Empresas Ativas' },
  { value: 'R$ 2M+', label: 'Gerenciado' },
  { value: '10k+', label: 'Serviços' },
];

export default function HeroModules() {
  const scrollToForm = () => {
    document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center py-20 lg:py-32 overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} 
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge 
            variant="outline" 
            className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5 text-primary animate-pulse"
          >
            🏆 Plataforma #1 para Limpeza de Estofados
          </Badge>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="text-white">Sua Empresa no </span>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Piloto Automático
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto">
            <span className="text-white font-semibold">12 módulos integrados</span> para transformar sua operação em uma máquina de vendas
          </p>

          {/* Module Icons Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3 max-w-4xl mx-auto py-8">
            {moduleIcons.map((mod, i) => {
              const IconComponent = mod.icon;
              return (
                <div 
                  key={i}
                  className="group flex flex-col items-center gap-1"
                  title={mod.label}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300">
                    <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-[10px] text-gray-500 hidden sm:block">{mod.label}</span>
                </div>
              );
            })}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={scrollToForm}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg font-semibold group"
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Demonstração
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open('https://wa.me/5531999999999', '_blank')}
              className="border-gray-700 text-white hover:bg-gray-800 px-8 py-6 text-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar com Consultor
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 pt-12 border-t border-gray-800 mt-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
