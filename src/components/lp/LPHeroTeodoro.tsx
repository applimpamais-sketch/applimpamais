import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

interface LPHeroTeodoroProps {
  badge?: string;
  headline?: string;
  highlightText?: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}

const LPHeroTeodoro = ({
  badge = 'Melhore sua Qualidade de Vida:',
  headline = 'O Tratamento que está Melhorando a Saúde de quem',
  highlightText = 'convive com dores crônicas!',
  subheadline = 'Alívio Seguro e Eficaz com Procedimentos Minimamente Invasivos e com Tecnologia de Alta Performance',
  ctaText = 'AGENDAR MINHA CONSULTA',
  ctaHref = 'http://wa.me/558999851484',
  onCtaClick,
}: LPHeroTeodoroProps) => {
  return (
    <section 
      id="home" 
      className="relative min-h-screen bg-[#080808] flex flex-col items-center justify-center text-center px-4 py-32 pt-40"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080808]/50 to-[#080808] pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-8"
          >
            <span className="px-6 py-3 text-white text-sm md:text-base font-light rounded-md border border-white/20 bg-black/50">
              {badge}
            </span>
          </motion.div>
        )}

        {/* Headline with highlight */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-4xl lg:text-5xl font-light text-white leading-tight mb-6"
        >
          {headline}
          <br />
          <span className="relative inline-block">
            <span className="text-[#FF6B35] font-normal">{highlightText}</span>
            {/* Underline decoration */}
            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FF6B35] transform translate-y-1" />
          </span>
        </motion.h1>

        {/* Subheadline */}
        {subheadline && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-white/70 font-light max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {subheadline}
          </motion.p>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
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

        {/* Video placeholder text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.5 }}
          className="absolute right-8 bottom-1/3 text-white/30 text-sm hidden lg:block"
        >
          video fundo
        </motion.p>
      </div>
    </section>
  );
};

export default LPHeroTeodoro;
