import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LPPricingProps {
  precoOriginal?: number;
  precoFinal?: number;
  descontoPercent?: number;
  mostrarPreco?: boolean;
  entregas?: string[];
  garantiaTexto?: string;
  garantiaPrazo?: string;
  ctaText?: string;
  theme?: LPTheme;
  onCtaClick?: () => void;
}

const defaultEntregas = [
  'Higienização profunda completa',
  'Remoção de manchas difíceis',
  'Eliminação de 99% dos ácaros',
  'Desodorização especial',
  'Secagem rápida (2-4 horas)',
  'Atendimento agendado',
];

const LPPricing = ({
  precoOriginal,
  precoFinal,
  descontoPercent,
  mostrarPreco = true,
  entregas = defaultEntregas,
  garantiaTexto = 'Satisfação garantida ou seu dinheiro de volta',
  garantiaPrazo = '7 dias',
  ctaText = 'Agendar Agora',
  theme = 'midnight',
  onCtaClick,
}: LPPricingProps) => {
  const t = getTheme(theme);
  
  return (
    <section className={`${t.bgPrimary} py-16 md:py-24`}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`${t.borderHighlight} ${t.bgCard} backdrop-blur-sm border rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]`}
        >
          {/* Background Glow */}
          <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-current via-transparent to-transparent blur-3xl opacity-20`}
               style={{ color: t.gradientPrimary.includes('blue') ? '#3b82f6' : t.gradientPrimary.includes('orange') ? '#f97316' : t.gradientPrimary.includes('green') ? '#22c55e' : t.gradientPrimary.includes('purple') ? '#a855f7' : '#14b8a6' }} />
          
          <div className="relative">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${t.gradientPrimary} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
                <Sparkles className="w-4 h-4" />
                Oferta Especial
              </span>
            </div>

            {/* Pricing */}
            {mostrarPreco && precoFinal && (
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-2">
                  {precoOriginal && (
                    <span className="text-2xl text-gray-500 line-through">
                      R$ {precoOriginal.toFixed(2)}
                    </span>
                  )}
                  {descontoPercent && (
                    <span className={`bg-gradient-to-r ${t.gradientPrimary} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                      -{descontoPercent}%
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-2xl ${t.textMuted}`}>R$</span>
                  <span className={`text-6xl md:text-7xl font-black text-transparent bg-gradient-to-r ${t.price} bg-clip-text`}>
                    {precoFinal.toFixed(2).split('.')[0]}
                  </span>
                  <span className={`text-2xl ${t.textMuted}`}>
                    ,{precoFinal.toFixed(2).split('.')[1]}
                  </span>
                </div>
                <p className={`${t.textMuted} mt-2`}>
                  ou 12x de <span className={`${t.accent} font-semibold`}>R$ {(precoFinal / 12).toFixed(2)}</span> sem juros
                </p>
              </div>
            )}

            {/* Deliverables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {entregas.map((entrega, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <Check className={`w-5 h-5 ${t.accent} flex-shrink-0`} />
                  <span className={t.textSecondary}>{entrega}</span>
                </motion.div>
              ))}
            </div>

            {/* Guarantee */}
            <div className={`flex items-center justify-center gap-3 ${t.bgSection} rounded-xl p-4 mb-8`}>
              <Shield className={`w-8 h-8 ${t.accent}`} />
              <div className="text-left">
                <p className={`${t.textPrimary} font-semibold`}>{garantiaTexto}</p>
                <p className={`text-sm ${t.textMuted}`}>Garantia de {garantiaPrazo}</p>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={onCtaClick}
              size="lg"
              className={`bg-gradient-to-r ${t.gradientButton} text-white w-full text-lg py-7 rounded-full shadow-2xl ${t.glowColor} group`}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {ctaText}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LPPricing;
