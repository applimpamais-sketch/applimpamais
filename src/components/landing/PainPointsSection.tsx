import { Calendar, DollarSign, MessageSquare, Users, Clock, TrendingDown, XCircle, CheckCircle } from 'lucide-react';

const painPoints = [
  {
    icon: Calendar,
    pain: 'Agenda bagunçada',
    problem: 'Clientes ligando, WhatsApp lotado, horários conflitantes e serviços esquecidos.',
    solution: 'Agendamento online automático 24h, sincronizado com calendário e confirmações por WhatsApp.',
  },
  {
    icon: DollarSign,
    pain: 'Não sabe seu lucro real',
    problem: 'Dinheiro entra e sai, mas no fim do mês não sobra nada. Sem controle de custos.',
    solution: 'Dashboard financeiro completo: receitas, despesas, lucro líquido e DRE automático.',
  },
  {
    icon: MessageSquare,
    pain: 'Clientes somem',
    problem: 'Orçamento enviado e nunca mais responde. Carrinhos abandonados sem recuperação.',
    solution: 'Bot WhatsApp que faz follow-up automático e recupera carrinhos abandonados.',
  },
  {
    icon: Users,
    pain: 'Equipe desorganizada',
    problem: 'Técnicos sem saber onde ir, serviços atrasados, cliente reclamando.',
    solution: 'App do técnico com todos os serviços do dia, endereços e checklist de conclusão.',
  },
  {
    icon: Clock,
    pain: 'Tempo perdido',
    problem: 'Horas no WhatsApp respondendo as mesmas perguntas, fazendo orçamentos manualmente.',
    solution: 'Catálogo de preços online + orçamento instantâneo. Cliente agenda sozinho.',
  },
  {
    icon: TrendingDown,
    pain: 'Sem crescimento',
    problem: 'Não sabe de onde vêm os clientes, qual campanha funciona, como escalar.',
    solution: 'Analytics de marketing: ROI por canal, custo por cliente, metas de faturamento.',
  },
];

export default function PainPointsSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(hsl(210 100% 50% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(210 100% 50% / 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} 
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            <span className="text-white">Você </span>
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              ainda sofre
            </span>
            <span className="text-white"> com isso?</span>
          </h2>
          <p className="text-xl text-gray-400">
            Problemas que drenam seu tempo, dinheiro e energia todos os dias
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {painPoints.map((item, index) => (
            <div 
              key={index} 
              className="p-6 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-gray-600 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-red-400" />
              </div>

              {/* Pain Title */}
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <h3 className="text-base font-semibold text-white">
                  {item.pain}
                </h3>
              </div>

              {/* Problem */}
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {item.problem}
              </p>

              {/* Divider */}
              <div className="border-t border-gray-700/50 my-4" />

              {/* Solution */}
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm leading-relaxed">
                  <span className="text-cyan-400 font-medium">Solução: </span>
                  {item.solution}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-xl text-gray-400 mb-2">
            Chega de perder tempo e dinheiro.
          </p>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            A solução completa está aqui. ↓
          </p>
        </div>
      </div>
    </section>
  );
}
