import { motion } from 'framer-motion';
import { Phone, ArrowRight, Clock, Star, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CountdownTimer from './CountdownTimer';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LPHeroProps {
  headline: string;
  subheadline?: string;
  badgeUrgencia?: string;
  precoOriginal?: number;
  precoFinal?: number;
  descontoPercent?: number;
  mostrarPreco?: boolean;
  ctaText?: string;
  ctaSubtext?: string;
  provaSocialText?: string;
  showTimer?: boolean;
  theme?: LPTheme;
  onCtaClick?: () => void;
}

const LPHero = ({
  headline,
  subheadline,
  badgeUrgencia,
  precoOriginal,
  precoFinal,
  descontoPercent,
  mostrarPreco = true,
  ctaText = 'Agendar Agora',
  ctaSubtext,
  provaSocialText,
  showTimer = true,
  theme = 'midnight',
  onCtaClick,
}: LPHeroProps) => {
  const t = getTheme(theme);
  
  // Animation variants based on theme
  const getAnimation = () => {
    switch (t.animationStyle) {
      case 'scale':
        return { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } };
      case 'fade':
        return { initial: { opacity: 0 }, animate: { opacity: 1 } };
      case 'elegant':
        return { initial: { opacity: 0, y: 30, rotateX: 15 }, animate: { opacity: 1, y: 0, rotateX: 0 } };
      case 'wave':
        return { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 } };
      default: // slide
        return { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
    }
  };
  
  const anim = getAnimation();
  
  return (
    <section className={`relative min-h-screen ${t.bgPrimary} overflow-hidden pt-20`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(210_100%_50%/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(210_100%_50%/0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-current via-transparent to-transparent blur-3xl opacity-20`} 
           style={{ color: t.gradientPrimary.includes('blue') ? '#3b82f6' : t.gradientPrimary.includes('orange') ? '#f97316' : t.gradientPrimary.includes('green') ? '#22c55e' : t.gradientPrimary.includes('purple') ? '#a855f7' : '#14b8a6' }} />
      
      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          {/* Urgency Badge */}
          {badgeUrgencia && (
            <motion.div
              initial={anim.initial}
              animate={anim.animate}
              className={`inline-flex items-center gap-2 ${t.urgencyBg} ${t.urgency} px-4 py-2 rounded-full mb-6`}
            >
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">{badgeUrgencia}</span>
            </motion.div>
          )}

          {/* Headline */}
          <motion.h1
            initial={anim.initial}
            animate={anim.animate}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            <span className={`bg-gradient-to-r ${t.gradientHeadline} bg-clip-text text-transparent`}>
              {headline}
            </span>
          </motion.h1>

          {/* Subheadline */}
          {subheadline && (
            <motion.p
              initial={anim.initial}
              animate={anim.animate}
              transition={{ delay: 0.2 }}
              className={`text-xl md:text-2xl ${t.textMuted} max-w-2xl mb-8`}
            >
              {subheadline}
            </motion.p>
          )}

          {/* Pricing */}
          {mostrarPreco && precoFinal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-4">
                {precoOriginal && (
                  <span className="text-2xl text-gray-500 line-through">
                    R$ {precoOriginal.toFixed(2)}
                  </span>
                )}
                <div className="flex items-baseline gap-2">
                  <span className={`text-sm ${t.textMuted}`}>por apenas</span>
                  <span className={`text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r ${t.price} bg-clip-text`}>
                    R$ {precoFinal.toFixed(2)}
                  </span>
                </div>
                {descontoPercent && (
                  <span className={`bg-gradient-to-r ${t.gradientPrimary} text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse`}>
                    -{descontoPercent}%
                  </span>
                )}
              </div>
              {precoFinal && (
                <p className={t.textMuted + ' mt-2'}>
                  ou 12x de <span className={`${t.accent} font-semibold`}>R$ {(precoFinal / 12).toFixed(2)}</span>
                </p>
              )}
            </motion.div>
          )}

          {/* Timer */}
          {showTimer && (
            <motion.div
              initial={anim.initial}
              animate={anim.animate}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <p className={`text-sm ${t.textMuted} mb-3`}>⚡ Oferta expira em:</p>
              <CountdownTimer hours={2} minutes={30} seconds={0} theme={theme} />
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.div
            initial={anim.initial}
            animate={anim.animate}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <Button
              onClick={onCtaClick}
              size="lg"
              className={`bg-gradient-to-r ${t.gradientButton} text-white text-lg px-10 py-7 rounded-full shadow-2xl ${t.shadowCta} transition-all group`}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {ctaText}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            {ctaSubtext && (
              <span className={`text-sm ${t.textMuted} flex items-center gap-2`}>
                <CheckCircle className={`w-4 h-4 ${t.success}`} />
                {ctaSubtext}
              </span>
            )}
          </motion.div>

          {/* Social Proof */}
          {provaSocialText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`mt-10 flex items-center gap-2 ${t.textMuted}`}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.gradientIcon} border-2 border-black`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 ml-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <span className="text-sm">{provaSocialText}</span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LPHero;
