import { Check, X, Sparkles, Crown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Feature {
  name: string;
  starter: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
  category?: string;
}

const features: Feature[] = [
  // Agendamento
  { name: 'Agendamento online 24h', starter: true, professional: true, enterprise: true, category: 'Agendamento' },
  { name: 'Agendamentos por mês', starter: '100', professional: 'Ilimitado', enterprise: 'Ilimitado' },
  { name: 'Calendário de disponibilidade', starter: true, professional: true, enterprise: true },
  { name: 'Confirmações automáticas', starter: true, professional: true, enterprise: true },
  { name: 'Técnicos cadastrados', starter: '1', professional: '5', enterprise: 'Ilimitado', category: 'Equipe' },
  { name: 'App do técnico', starter: true, professional: true, enterprise: true },
  { name: 'Atribuição automática', starter: false, professional: true, enterprise: true },
  { name: 'Geolocalização de técnicos', starter: false, professional: true, enterprise: true },
  // Financeiro
  { name: 'Dashboard financeiro', starter: 'Básico', professional: 'Completo', enterprise: 'Avançado', category: 'Financeiro' },
  { name: 'Controle de despesas', starter: true, professional: true, enterprise: true },
  { name: 'DRE automático', starter: false, professional: true, enterprise: true },
  { name: 'Metas de faturamento', starter: false, professional: true, enterprise: true },
  { name: 'Fluxo de caixa', starter: false, professional: true, enterprise: true },
  { name: 'Exportação relatórios', starter: 'PDF', professional: 'PDF/Excel', enterprise: 'PDF/Excel/API' },
  // Marketing
  { name: 'Cupons de desconto', starter: '5', professional: 'Ilimitado', enterprise: 'Ilimitado', category: 'Marketing' },
  { name: 'Carrinhos abandonados', starter: false, professional: true, enterprise: true },
  { name: 'Analytics de marketing', starter: false, professional: true, enterprise: true },
  { name: 'Facebook Pixel integrado', starter: false, professional: true, enterprise: true },
  { name: 'ROI por campanha', starter: false, professional: true, enterprise: true },
  // WhatsApp
  { name: 'Notificações WhatsApp', starter: 'Manual', professional: 'Automático', enterprise: 'Automático', category: 'WhatsApp' },
  { name: 'Bot de atendimento', starter: false, professional: true, enterprise: true },
  { name: 'Recuperação automática', starter: false, professional: true, enterprise: true },
  { name: 'Templates personalizados', starter: '3', professional: '10', enterprise: 'Ilimitado' },
  // White Label
  { name: 'Sua marca no sistema', starter: false, professional: false, enterprise: true, category: 'White Label' },
  { name: 'Domínio customizado', starter: false, professional: false, enterprise: true },
  { name: 'Cores personalizadas', starter: false, professional: false, enterprise: true },
  { name: 'App próprio (PWA)', starter: false, professional: false, enterprise: true },
  // Suporte
  { name: 'Suporte por email', starter: true, professional: true, enterprise: true, category: 'Suporte' },
  { name: 'Suporte WhatsApp', starter: false, professional: 'Horário comercial', enterprise: '24/7' },
  { name: 'Onboarding dedicado', starter: false, professional: '1 hora', enterprise: 'Ilimitado' },
  { name: 'Gerente de conta', starter: false, professional: false, enterprise: true },
];

const plans = [
  {
    name: 'Starter',
    icon: Sparkles,
    price: 297,
    yearlyPrice: 247,
    description: 'Para quem está começando a digitalizar',
    highlighted: false,
    ctaText: 'Começar Trial Grátis',
  },
  {
    name: 'Professional',
    icon: Crown,
    price: 497,
    yearlyPrice: 414,
    description: 'Para empresas em crescimento',
    highlighted: true,
    ctaText: 'Agendar Demonstração',
    badge: 'Mais Popular',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 997,
    yearlyPrice: 831,
    description: 'Para operações escaláveis',
    highlighted: false,
    ctaText: 'Falar com Vendas',
  },
];

const FeatureValue = ({ value }: { value: boolean | string }) => {
  if (value === true) {
    return <Check className="w-5 h-5 text-cyan-400 mx-auto" />;
  }
  if (value === false) {
    return <X className="w-5 h-5 text-gray-600 mx-auto" />;
  }
  return <span className="text-sm text-gray-300">{value}</span>;
};

export default function PricingComparisonTable() {
  const scrollToDemo = () => {
    const element = document.getElementById('cta-form');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  let currentCategory = '';

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-black to-gray-950" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            <span className="text-white">Escolha o Plano </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Ideal
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Todos os planos incluem 14 dias grátis. Sem cartão de crédito.
          </p>
        </div>

        {/* Pricing Cards with Features - Mobile */}
        <div className="lg:hidden space-y-6 mb-12">
          {plans.map((plan, index) => {
            const planKey = plan.name.toLowerCase() as 'starter' | 'professional' | 'enterprise';
            
            // Group features by category
            const groupedFeatures = features.reduce((acc, feature) => {
              const category = feature.category || currentCategory || 'Recursos';
              if (feature.category) currentCategory = feature.category;
              if (!acc[category]) acc[category] = [];
              acc[category].push(feature);
              return acc;
            }, {} as Record<string, Feature[]>);

            return (
              <div
                key={index}
                className={cn(
                  'rounded-2xl border overflow-hidden',
                  plan.highlighted
                    ? 'border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-transparent'
                    : 'border-gray-800 bg-gray-900/50'
                )}
              >
                {/* Plan Header */}
                <div className="p-6 border-b border-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <plan.icon className={cn('w-6 h-6', plan.highlighted ? 'text-cyan-400' : 'text-gray-400')} />
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    </div>
                    {plan.badge && (
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div>
                    <span className="text-4xl font-bold text-white">R$ {plan.price}</span>
                    <span className="text-gray-400">/mês</span>
                    <p className="text-sm text-gray-500 mt-1">
                      ou R$ {plan.yearlyPrice}/mês no plano anual
                    </p>
                  </div>
                </div>

                {/* Features by Category */}
                <div className="px-6 py-4 space-y-4">
                  {Object.entries(groupedFeatures).map(([category, items]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                        {category}
                      </p>
                      <ul className="space-y-2">
                        {items.map((feature, idx) => {
                          const value = feature[planKey];
                          const isIncluded = value === true || (typeof value === 'string' && value !== 'false');
                          
                          return (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              {value === true ? (
                                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                              ) : value === false ? (
                                <X className="w-4 h-4 text-gray-600 flex-shrink-0" />
                              ) : (
                                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                              )}
                              <span className={cn(
                                isIncluded ? 'text-gray-300' : 'text-gray-500'
                              )}>
                                {feature.name}
                                {typeof value === 'string' && (
                                  <span className="text-cyan-400 ml-1">({value})</span>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="p-6 pt-2">
                  <Button
                    onClick={scrollToDemo}
                    className={cn(
                      'w-full',
                      plan.highlighted
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    )}
                  >
                    {plan.ctaText}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table - Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr>
                <th className="text-left p-4 border-b border-gray-800 w-[40%]" />
                {plans.map((plan, index) => (
                  <th
                    key={index}
                    className={cn(
                      'p-6 text-center border-b',
                      plan.highlighted
                        ? 'border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-t-2xl'
                        : 'border-gray-800'
                    )}
                  >
                    <div className="space-y-4">
                      {plan.badge && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          {plan.badge}
                        </Badge>
                      )}
                      <div className="flex items-center justify-center gap-2">
                        <plan.icon className={cn('w-6 h-6', plan.highlighted ? 'text-cyan-400' : 'text-gray-400')} />
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      </div>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                      <div>
                        <span className="text-4xl font-bold text-white">R$ {plan.price}</span>
                        <span className="text-gray-400">/mês</span>
                        <p className="text-sm text-gray-500 mt-1">
                          ou R$ {plan.yearlyPrice}/mês anual
                        </p>
                      </div>
                      <Button
                        onClick={scrollToDemo}
                        className={cn(
                          'w-full',
                          plan.highlighted
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                        )}
                      >
                        {plan.ctaText}
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {features.map((feature, index) => {
                const showCategory = feature.category && feature.category !== currentCategory;
                if (feature.category) currentCategory = feature.category;

                return (
                  <>
                    {showCategory && (
                      <tr key={`cat-${feature.category}`}>
                        <td colSpan={4} className="px-4 pt-8 pb-4">
                          <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                            {feature.category}
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                      <td className="p-4 text-gray-300">{feature.name}</td>
                      <td className="p-4 text-center">
                        <FeatureValue value={feature.starter} />
                      </td>
                      <td className={cn('p-4 text-center', 'bg-cyan-500/5')}>
                        <FeatureValue value={feature.professional} />
                      </td>
                      <td className="p-4 text-center">
                        <FeatureValue value={feature.enterprise} />
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Guarantee */}
        <div className="text-center mt-12 p-6 rounded-2xl border border-gray-800 bg-gray-900/50 max-w-2xl mx-auto">
          <p className="text-lg text-white font-medium mb-2">
            🛡️ Garantia de 30 dias
          </p>
          <p className="text-gray-400">
            Se não ficar satisfeito nos primeiros 30 dias, devolvemos 100% do seu investimento. Sem perguntas.
          </p>
        </div>
      </div>
    </section>
  );
}
