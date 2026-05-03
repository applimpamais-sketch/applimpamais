import { Star, Clock, Headphones, Smartphone, Shield, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  {
    icon: Star,
    title: 'White Label Completo',
    description: 'Seu logo, suas cores, sua marca. Nenhuma menção à nossa plataforma.',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/30',
    iconColor: 'text-yellow-400',
    size: 'lg',
  },
  {
    icon: Clock,
    title: 'Implementação em 48h',
    description: 'Do zero ao operacional em tempo recorde.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    size: 'sm',
  },
  {
    icon: Headphones,
    title: 'Suporte Humanizado',
    description: 'Atendimento real via WhatsApp quando você precisar.',
    gradient: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    iconColor: 'text-green-400',
    size: 'sm',
  },
  {
    icon: Smartphone,
    title: 'Mobile First (PWA)',
    description: 'Instale como app no celular. Funciona offline.',
    gradient: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    size: 'sm',
  },
  {
    icon: Shield,
    title: 'Segurança LGPD',
    description: 'Seus dados protegidos com criptografia de ponta.',
    gradient: 'from-cyan-500/20 to-teal-500/20',
    border: 'border-cyan-500/30',
    iconColor: 'text-cyan-400',
    size: 'sm',
  },
  {
    icon: RefreshCw,
    title: 'Atualizações Mensais',
    description: 'Novas funcionalidades todo mês, sem custo extra.',
    gradient: 'from-rose-500/20 to-red-500/20',
    border: 'border-rose-500/30',
    iconColor: 'text-rose-400',
    size: 'lg',
  },
];

export default function BentoGrid() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-950 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Por que </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Nos Escolher?
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Diferenciais que fazem a diferença no seu dia a dia
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {items.map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div
                key={i}
                className={cn(
                  'relative rounded-3xl border p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]',
                  `bg-gradient-to-br ${item.gradient}`,
                  item.border,
                  item.size === 'lg' && 'md:col-span-2 lg:col-span-1'
                )}
              >
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mb-6',
                  'bg-gray-900/50 border border-gray-800'
                )}>
                  <IconComponent className={cn('w-7 h-7', item.iconColor)} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
