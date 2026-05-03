import { Card } from '@/components/ui/card';
import { Palette, Zap, Smartphone, Shield, HeadphonesIcon, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'White Label Completo',
    description: 'Sistema 100% personalizado com sua marca, logo, cores e domínio próprio. Seus clientes veem apenas sua empresa.',
    icon: Palette,
  },
  {
    title: 'Implementação Rápida',
    description: 'Online em até 48 horas. Setup inicial, treinamento e suporte incluídos. Comece a vender imediatamente.',
    icon: Zap,
  },
  {
    title: 'Mobile First',
    description: 'Interface otimizada para celular. Funciona perfeitamente em qualquer dispositivo, com app instalável (PWA).',
    icon: Smartphone,
  },
  {
    title: 'Seguro e Confiável',
    description: 'Dados criptografados, backup automático e infraestrutura de ponta. Uptime de 99.9% garantido.',
    icon: Shield,
  },
  {
    title: 'Suporte Dedicado',
    description: 'Time de especialistas pronto para ajudar via WhatsApp, email ou telefone. Resposta em até 2 horas.',
    icon: HeadphonesIcon,
  },
  {
    title: 'Atualizações Constantes',
    description: 'Novas funcionalidades e melhorias todos os meses. Você sempre terá o melhor sistema do mercado.',
    icon: TrendingUp,
  },
  {
    title: 'Preço Acessível',
    description: 'Planos flexíveis a partir de R$ 297/mês. Sem taxas escondidas, sem surpresas.',
    icon: DollarSign,
  },
  {
    title: 'Garantia Total',
    description: '7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor investido.',
    icon: CheckCircle,
  }
];

const Feature = ({
  title,
  description,
  icon: Icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-gray-800",
        (index === 0 || index === 4) && "lg:border-l border-gray-800",
        index < 4 && "lg:border-b border-gray-800"
      )}
    >
      {/* Gradient from top (primeiras 4) */}
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-gray-800 to-transparent pointer-events-none" />
      )}
      
      {/* Gradient from bottom (últimas 4) */}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-gray-800 to-transparent pointer-events-none" />
      )}

      {/* Ícone */}
      <div className="mb-4 relative z-10 px-10 text-gray-400">
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>

      {/* Título com barra lateral animada */}
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-gray-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-white">
          {title}
        </span>
      </div>

      {/* Descrição */}
      <p className="text-sm text-gray-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

export default function DiferenciaisSection() {
  return (
    <section className="py-20 lg:py-32 bg-gray-950 relative overflow-hidden">
      {/* Spotlight de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/10 rounded-full blur-[200px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Por Que Escolher Nossa Solução?
          </h2>
          <p className="text-xl text-gray-400">
            Diferenciais que fazem toda a diferença no seu negócio
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>

        {/* Bottom Highlight */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="p-8 lg:p-12 bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-center border-0">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Tudo Isso com Investimento que Cabe no Seu Bolso
            </h3>
            <p className="text-xl text-white/90 mb-6">
              Planos flexíveis a partir de R$ 297/mês. Sem taxas escondidas, sem surpresas.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold text-lg">
              <Shield className="w-5 h-5" />
              <span>7 dias de garantia total</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
