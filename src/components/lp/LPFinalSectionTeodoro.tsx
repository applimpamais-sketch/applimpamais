import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

interface LPFinalSectionTeodoroProps {
  badgeText?: string;
  titulo?: string;
  tituloDestaque?: string;
  imagemUrl?: string;
  ctaText?: string;
  ctaHref?: string;
  theme?: string;
  onCtaClick?: () => void;
}

const LPFinalSectionTeodoro = ({
  badgeText = 'Você não precisa viver com dor',
  titulo = 'Cuide da Sua',
  tituloDestaque = 'Saúde Agora',
  imagemUrl = 'https://page.dsgnrafa.com/wp-content/uploads/2024/07/Group-5.png',
  ctaText = 'AGENDAR MINHA CONSULTA',
  ctaHref = 'http://wa.me/558999851484',
  onCtaClick,
}: LPFinalSectionTeodoroProps) => {
  return (
    <section className="bg-gradient-to-br from-[#1a3a4a] to-[#0d2530] py-20 md:py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image with laptop */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <img 
              src={imagemUrl}
              alt="Cuide da sua saúde"
              className="w-full max-w-md mx-auto h-auto"
            />
            
            {/* Rotating badge */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-4 right-4 w-24 h-24 md:w-32 md:h-32"
            >
              <img 
                src="https://page.dsgnrafa.com/wp-content/uploads/2024/07/Teodoro-Bernardes-Teodoro-Bernardes-Teodoro-Bernardes-copiar.png"
                alt="Selo"
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-left"
          >
            {badgeText && (
              <span className="inline-block px-4 py-2 rounded-full border border-white/20 text-white/70 text-sm mb-6">
                {badgeText}
              </span>
            )}

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-8">
              {titulo}{' '}
              <span className="text-[#FF6B35] font-normal italic">{tituloDestaque}</span>
            </h2>

            {onCtaClick ? (
              <Button
                onClick={onCtaClick}
                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-8 py-6 rounded-lg text-sm font-medium group"
              >
                {ctaText}
                <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            ) : (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-8 py-4 rounded-lg text-sm font-medium group transition-colors"
              >
                {ctaText}
                <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LPFinalSectionTeodoro;
