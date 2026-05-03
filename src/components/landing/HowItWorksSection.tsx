import { Card } from '@/components/ui/card';
import { Palette, Settings, Rocket, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Palette,
    title: 'Personalize',
    description: 'Coloque sua marca no sistema: logo, cores, domínio próprio e identidade visual completa.',
    details: ['Logo personalizado', 'Cores da sua marca', 'Domínio próprio', 'Email corporativo'],
    color: 'from-blue-500 to-cyan-400'
  },
  {
    number: '02',
    icon: Settings,
    title: 'Configure',
    description: 'Adicione seus serviços, preços, equipe técnica e configure todas as funcionalidades.',
    details: ['Cadastre serviços', 'Defina preços', 'Adicione equipe', 'Configure integrações'],
    color: 'from-blue-600 to-blue-500'
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Lance',
    description: 'Está pronto! Comece a receber agendamentos online e gerencie tudo em um só lugar.',
    details: ['Sistema no ar', 'Agendamentos 24/7', 'Equipe treinada', 'Suporte contínuo'],
    color: 'from-cyan-500 to-cyan-400'
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-32 bg-black">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Como Funciona? É Simples:
          </h2>
          <p className="text-xl text-white">
            Seu negócio digital em apenas 3 passos
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 relative">
            {/* Connection Lines - Desktop */}
            <div className="hidden lg:block absolute top-32 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-20" />

            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-8 hover:shadow-xl transition-all duration-300 border-gray-800 hover:border-blue-500/30 bg-gray-900/50 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-6 left-8">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 mt-4`}>
                    <step.icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Details */}
                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-white">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${step.color}`} />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Arrow - Mobile */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-6 lg:hidden">
                    <ArrowRight className="w-6 h-6 text-cyan-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Timeline Summary */}
          <div className="mt-16 text-center">
            <Card className="inline-block p-6 bg-gray-900/50 border-blue-500/20">
              <p className="text-lg font-semibold text-white mb-2">
                ⚡ Implementação em até 48 horas
              </p>
              <p className="text-white">
                Do primeiro contato ao sistema no ar, tudo rápido e sem complicação
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
