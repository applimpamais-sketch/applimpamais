import { motion } from 'framer-motion';
import { Shield, CheckCircle } from 'lucide-react';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LPGuaranteeProps {
  titulo?: string;
  texto?: string;
  prazo?: string;
  theme?: LPTheme;
}

const LPGuarantee = ({
  titulo = 'Garantia Total de Satisfação',
  texto = 'Se você não ficar 100% satisfeito com o resultado do nosso serviço, devolvemos seu dinheiro integralmente. Sem perguntas, sem burocracia.',
  prazo = '7 dias',
  theme = 'midnight',
}: LPGuaranteeProps) => {
  const t = getTheme(theme);
  
  return (
    <section className={`${t.bgSection} py-16 md:py-24`}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`bg-gradient-to-br from-current/10 to-current/5 ${t.borderHover} border rounded-3xl p-8 md:p-12 text-center`}
          style={{ '--tw-gradient-from': t.gradientPrimary.includes('blue') ? '#3b82f6' : t.gradientPrimary.includes('orange') ? '#f97316' : t.gradientPrimary.includes('green') ? '#22c55e' : t.gradientPrimary.includes('purple') ? '#a855f7' : '#14b8a6' } as React.CSSProperties}
        >
          {/* Shield Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${t.gradientPrimary} mb-6 shadow-2xl ${t.glowColor}`}
          >
            <Shield className="w-12 h-12 text-white" />
          </motion.div>

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 ${t.successBg} ${t.accent} px-4 py-2 rounded-full text-sm font-medium mb-4`}>
            <CheckCircle className="w-4 h-4" />
            Garantia de {prazo}
          </div>

          {/* Title */}
          <h2 className={`text-3xl md:text-4xl font-bold ${t.textPrimary} mb-4`}>
            {titulo}
          </h2>

          {/* Text */}
          <p className={`text-lg ${t.textMuted} max-w-2xl mx-auto leading-relaxed`}>
            {texto}
          </p>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {['100% Seguro', 'Sem Burocracia', 'Reembolso Rápido'].map((point, index) => (
              <div key={index} className={`flex items-center gap-2 ${t.textSecondary}`}>
                <CheckCircle className={`w-4 h-4 ${t.accent}`} />
                <span className="text-sm">{point}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LPGuarantee;
