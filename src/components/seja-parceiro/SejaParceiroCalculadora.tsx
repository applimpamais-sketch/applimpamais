import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Sparkles } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const SejaParceiroCalculadora = () => {
  const [indicacoes, setIndicacoes] = useState([10]);
  const [ticketMedio, setTicketMedio] = useState(200);
  const comissaoPercentual = 0.10;
  
  const ganhoEstimado = indicacoes[0] * ticketMedio * comissaoPercentual;

  const cenarios = [
    { label: '5 clientes', indicacoes: 5, ticket: 200, ganho: 100 },
    { label: '10 clientes', indicacoes: 10, ticket: 200, ganho: 200 },
    { label: '5 premium', indicacoes: 5, ticket: 400, ganho: 200, premium: true },
  ];

  const exemplosReais = [
    { servico: 'Sofá grande + impermeabilização', comissao: 63 },
    { servico: 'Sofá + 2 colchões', comissao: 40 },
    { servico: 'Conjunto completo (sofá + poltronas)', comissao: 45 },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Quanto você pode ganhar?
          </h2>
          <p className="text-slate-400 text-lg">
            Simule seus ganhos mensais como parceiro
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12"
        >
          {/* Calculator Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Slider de Indicações */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="text-slate-300 font-medium">
                Indicações por mês
              </label>
              <span className="text-2xl font-bold text-white">{indicacoes[0]}</span>
            </div>
            <Slider
              value={indicacoes}
              onValueChange={setIndicacoes}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-slate-500 mt-2">
              <span>1</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>

          {/* Slider de Ticket Médio */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <label className="text-slate-300 font-medium">
                Ticket médio por cliente
              </label>
              <span className="text-2xl font-bold text-white">R$ {ticketMedio}</span>
            </div>
            <Slider
              value={[ticketMedio]}
              onValueChange={(v) => setTicketMedio(v[0])}
              max={500}
              min={150}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-slate-500 mt-2">
              <span>R$ 150</span>
              <span>R$ 300</span>
              <span>R$ 500</span>
            </div>
          </div>

          {/* Result */}
          <div className="bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-300 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>Ganho estimado mensal</span>
            </div>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              R$ {ganhoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-slate-400 text-sm mt-3">
              {indicacoes[0]} clientes × R$ {ticketMedio} × 10% comissão
            </p>
          </div>

          {/* Cenários Rápidos */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {cenarios.map((cenario) => (
              <button
                key={cenario.label}
                onClick={() => {
                  setIndicacoes([cenario.indicacoes]);
                  setTicketMedio(cenario.ticket);
                }}
                className={`p-4 rounded-xl border transition-all relative ${
                  indicacoes[0] === cenario.indicacoes && ticketMedio === cenario.ticket
                    ? 'border-primary bg-primary/10 text-white' 
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                {cenario.premium && (
                  <Sparkles className="w-4 h-4 text-yellow-400 absolute top-2 right-2" />
                )}
                <div className="font-semibold">{cenario.label}</div>
                <div className="text-lg font-bold text-green-400">
                  R$ {cenario.ganho}/mês
                </div>
              </button>
            ))}
          </div>

          {/* Exemplos de Comissões Reais */}
          <div className="mt-8 border-t border-slate-700 pt-6">
            <p className="text-slate-400 text-sm mb-4 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Clientes frequentemente fecham múltiplos serviços:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {exemplosReais.map((exemplo) => (
                <div 
                  key={exemplo.servico}
                  className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center"
                >
                  <div className="text-sm text-slate-400 mb-1">{exemplo.servico}</div>
                  <div className="text-lg font-semibold text-green-400">
                    Comissão: R$ {exemplo.comissao}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SejaParceiroCalculadora;