import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import dashboardMockup from '@/assets/dashboard-3d-mockup.png';

export default function HeroSection() {
  const [videoOpen, setVideoOpen] = useState(false);

  const scrollToDemo = () => {
    const element = document.getElementById('cta-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', { content_name: 'Landing B2B - Demo Request' });
    }
  };

  const benefits = [
    'Agendamento online 24h',
    'Controle financeiro completo',
    'Bot WhatsApp automático',
    'Relatórios em tempo real',
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center py-20 lg:py-32 overflow-hidden bg-black">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Sistema #1 para Limpeza de Estofados
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">Fature </span>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                3x Mais
              </span>
              <span className="text-white"> com Sua Empresa de Limpeza</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-xl">
              Sistema completo de gestão para empresas de limpeza de estofados. 
              <span className="text-white font-medium"> Agendamento online, financeiro, equipe e marketing </span> 
              tudo integrado em uma única plataforma.
            </p>

            {/* Benefits List */}
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={scrollToDemo}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg px-8 py-6 shadow-lg shadow-blue-500/25 group"
              >
                Agendar Demonstração Gratuita
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setVideoOpen(true)}
                className="border-gray-700 text-white hover:bg-gray-800 text-lg px-8 py-6 group"
              >
                <Play className="mr-2 w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                Ver Demonstração
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-800">
              <div>
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-sm text-gray-500">Empresas ativas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">R$ 2M+</p>
                <p className="text-sm text-gray-500">Faturamento gerenciado</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">10k+</p>
                <p className="text-sm text-gray-500">Serviços agendados</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">98%</p>
                <p className="text-sm text-gray-500">Satisfação</p>
              </div>
            </div>
          </div>

          {/* Right Content - Video Preview */}
          <div className="relative">
            <div 
              onClick={() => setVideoOpen(true)}
              className="relative aspect-video rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 cursor-pointer group shadow-2xl shadow-blue-500/10"
            >
              {/* Video Thumbnail/Placeholder */}
              <img 
                src={dashboardMockup} 
                alt="Dashboard Preview" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>

              {/* Border glow effect */}
              <div className="absolute inset-0 rounded-2xl border border-blue-500/20 group-hover:border-blue-500/40 transition-colors" />
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
              ✨ 14 dias grátis
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gray-900 border border-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm shadow-lg">
              Sem cartão de crédito
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-gray-800">
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Demonstração do Sistema"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
