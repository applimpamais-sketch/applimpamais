import { motion } from 'framer-motion';
import { Phone, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CountdownTimer from './CountdownTimer';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LPFinalCtaProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  showTimer?: boolean;
  theme?: LPTheme;
  onCtaClick?: () => void;
}

const LPFinalCta = ({
  headline = 'Pronto para transformar seu ambiente?',
  subheadline = 'Aproveite esta oferta especial e agende agora mesmo',
  ctaText = 'Agendar Agora',
  showTimer = true,
  theme = 'midnight',
  onCtaClick,
}: LPFinalCtaProps) => {
  const t = getTheme(theme);
  
  return (
    <section className={`bg-gradient-to-br ${t.gradientCta} py-16 md:py-24 relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {headline}
          </h2>
          <p className="text-xl text-white/80 mb-8">
            {subheadline}
          </p>

          {showTimer && (
            <div className="flex justify-center mb-8">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 inline-block">
                <p className="text-sm text-white/70 mb-2">Esta oferta expira em:</p>
                <CountdownTimer hours={2} minutes={30} seconds={0} theme={theme} />
              </div>
            </div>
          )}

          <Button
            onClick={onCtaClick}
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-7 rounded-full shadow-2xl group font-bold"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {ctaText}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-white/60 text-sm mt-6">
            🔒 Pagamento 100% seguro • Garantia de 7 dias
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LPFinalCta;
