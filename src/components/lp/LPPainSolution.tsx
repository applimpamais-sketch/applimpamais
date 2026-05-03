import { motion } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface DorSolucao {
  titulo: string;
  problema: string;
  solucao: string;
}

interface LPPainSolutionProps {
  titulo?: string;
  dores: DorSolucao[];
  theme?: LPTheme;
}

const defaultDores: DorSolucao[] = [
  {
    titulo: 'Manchas persistentes',
    problema: 'Tentou limpar em casa mas as manchas não saem',
    solucao: 'Técnicas profissionais removem até as manchas mais difíceis',
  },
  {
    titulo: 'Alergias e ácaros',
    problema: 'Espirros constantes e desconforto em casa',
    solucao: 'Higienização profunda elimina 99% dos ácaros',
  },
  {
    titulo: 'Odores desagradáveis',
    problema: 'O sofá absorveu cheiros que não saem mais',
    solucao: 'Desodorização completa deixa o ambiente renovado',
  },
  {
    titulo: 'Falta de tempo',
    problema: 'Não tem tempo para cuidar da limpeza como gostaria',
    solucao: 'Nós fazemos o trabalho enquanto você descansa',
  },
];

const LPPainSolution = ({ 
  titulo = 'Chega de frustração com limpeza caseira',
  dores = defaultDores,
  theme = 'midnight'
}: LPPainSolutionProps) => {
  const t = getTheme(theme);
  
  return (
    <section className={`${t.bgSection} py-16 md:py-24`}>
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl md:text-4xl font-bold ${t.textPrimary} mb-4`}>
            {titulo}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          {dores.map((dor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${t.bgCard} backdrop-blur-sm ${t.border} border rounded-2xl p-6 overflow-hidden`}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                {/* Problem */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-sm text-red-400 font-medium uppercase tracking-wider mb-1">Problema</h4>
                    <p className={t.textSecondary}>{dor.problema}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className={`w-8 h-8 ${t.textMuted}`} />
                </div>

                {/* Solution */}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full ${t.successBg} flex items-center justify-center flex-shrink-0`}>
                    <Check className={`w-5 h-5 ${t.accent}`} />
                  </div>
                  <div>
                    <h4 className={`text-sm ${t.accent} font-medium uppercase tracking-wider mb-1`}>Solução</h4>
                    <p className={t.textSecondary}>{dor.solucao}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LPPainSolution;
