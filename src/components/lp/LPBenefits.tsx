import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Shield, Clock, Award, Leaf } from 'lucide-react';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface Beneficio {
  titulo: string;
  descricao: string;
  icon?: 'check' | 'sparkle' | 'shield' | 'clock' | 'award' | 'leaf';
}

interface LPBenefitsProps {
  titulo?: string;
  subtitulo?: string;
  beneficios: Beneficio[];
  theme?: LPTheme;
}

const iconMap = {
  check: CheckCircle,
  sparkle: Sparkles,
  shield: Shield,
  clock: Clock,
  award: Award,
  leaf: Leaf,
};

const LPBenefits = ({ 
  titulo = 'O que você ganha',
  subtitulo = 'Muito mais do que uma simples limpeza',
  beneficios,
  theme = 'midnight'
}: LPBenefitsProps) => {
  const t = getTheme(theme);
  
  return (
    <section className={`${t.bgPrimary} py-16 md:py-24`}>
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
          <p className={`text-xl ${t.textMuted} max-w-2xl mx-auto`}>
            {subtitulo}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficios.map((beneficio, index) => {
            const Icon = iconMap[beneficio.icon || 'check'];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${t.bgCard} backdrop-blur-sm ${t.border} border ${t.bgCardHover} p-6 rounded-xl group transition-all duration-300`}
              >
                <div className={`bg-gradient-to-br ${t.gradientIcon} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl font-semibold ${t.textPrimary} mb-2`}>
                  {beneficio.titulo}
                </h3>
                <p className={t.textMuted}>
                  {beneficio.descricao}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LPBenefits;
