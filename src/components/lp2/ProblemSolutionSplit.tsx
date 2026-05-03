import { X, Check, MessageCircleOff, FileSpreadsheet, HelpCircle, Clock, Bot, LayoutDashboard, PieChart, Zap } from 'lucide-react';

const problems = [
  { icon: MessageCircleOff, text: 'Perde clientes por não responder rápido' },
  { icon: FileSpreadsheet, text: 'Controla tudo em planilhas bagunçadas' },
  { icon: HelpCircle, text: 'Não sabe quanto lucra por serviço' },
  { icon: Clock, text: 'Depende 100% do WhatsApp manual' },
];

const solutions = [
  { icon: Bot, text: 'Bot responde 24/7 automaticamente' },
  { icon: LayoutDashboard, text: 'Dashboard centralizado em tempo real' },
  { icon: PieChart, text: 'DRE e fluxo de caixa automáticos' },
  { icon: Zap, text: 'Automações que vendem enquanto você dorme' },
];

export default function ProblemSolutionSplit() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-black to-gray-950 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-red-500/5 to-transparent" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">De </span>
            <span className="text-red-400">Caos</span>
            <span className="text-white"> para </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Controle Total</span>
          </h2>
          <p className="text-xl text-gray-400">
            Veja a diferença que um sistema completo faz no seu dia a dia
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Problems Side */}
          <div className="relative rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent p-8 space-y-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-500/0 rounded-t-3xl" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-400">Você ainda...</h3>
            </div>

            <div className="space-y-4">
              {problems.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-gray-300">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Solutions Side */}
          <div className="relative rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent p-8 space-y-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-cyan-500/0 rounded-t-3xl" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-cyan-400">Com nossa plataforma...</h3>
            </div>

            <div className="space-y-4">
              {solutions.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10"
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-gray-300">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
