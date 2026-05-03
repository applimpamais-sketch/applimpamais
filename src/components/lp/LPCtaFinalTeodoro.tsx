import { motion } from 'framer-motion';
import { LPTheme, getTheme, getAnimationVariants } from '@/styles/lp-themes';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

interface LPCtaFinalTeodoroProps {
  badgeText?: string;
  titulo?: string;
  subtitulo?: string;
  ctaText?: string;
  ctaHref?: string;
  imagemUrl?: string;
  theme?: LPTheme;
  onCtaClick?: () => void;
}

const LPCtaFinalTeodoro = ({
  badgeText = 'Você não precisa viver com dor!',
  titulo = 'Cuide da Sua Saúde Agora',
  subtitulo = 'Agende uma consulta com o Dr. Teodoro Bernardes e descubra como nossos tratamentos podem ajudar a melhorar sua qualidade de vida.',
  ctaText = 'AGENDAR MINHA CONSULTA',
  ctaHref = 'http://wa.me/558999851484',
  imagemUrl = 'https://page.dsgnrafa.com/wp-content/uploads/2024/07/WhatsApp-Image-2024-07-15-at-11.04.20.jpeg',
  theme = 'midnight',
  onCtaClick,
}: LPCtaFinalTeodoroProps) => {
  const t = getTheme(theme);
  const variants = getAnimationVariants(theme);

  return (
    <section className={`${t.bgSection} py-16 md:py-24`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={variants}
            className="order-2 lg:order-1"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src={imagemUrl}
                alt="Consulta"
                className="w-full h-80 lg:h-[450px] object-cover"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={variants}
            className="order-1 lg:order-2 space-y-6"
          >
            {badgeText && (
              <span className={`inline-block px-4 py-2 rounded-full border ${t.border} ${t.textMuted} text-sm`}>
                {badgeText}
              </span>
            )}

            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${t.textPrimary} leading-tight`}>
              {titulo}
            </h2>

            <p className={`text-lg md:text-xl ${t.textMuted} leading-relaxed font-light`}>
              {subtitulo}
            </p>

            {onCtaClick ? (
              <Button
                onClick={onCtaClick}
                className="bg-black hover:bg-gray-900 text-white px-8 py-6 rounded-lg text-base font-normal group"
              >
                {ctaText}
                <ArrowUpRight className="ml-3 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            ) : (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-lg text-base font-normal group transition-colors"
              >
                {ctaText}
                <ArrowUpRight className="ml-3 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LPCtaFinalTeodoro;
