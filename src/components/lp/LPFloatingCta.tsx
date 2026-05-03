import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LPFloatingCtaProps {
  ctaText?: string;
  preco?: number;
  theme?: LPTheme;
  onCtaClick?: () => void;
}

const LPFloatingCta = ({
  ctaText = 'Agendar Agora',
  preco,
  theme = 'midnight',
  onCtaClick,
}: LPFloatingCtaProps) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const t = getTheme(theme);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className={`fixed bottom-0 left-0 right-0 z-50 ${t.bgPrimary}/95 backdrop-blur-md ${t.border} border-t p-4 safe-bottom`}
        >
          <div className="flex items-center justify-between gap-4">
            {preco && (
              <div className="flex flex-col">
                <span className={`text-xs ${t.textMuted}`}>Por apenas</span>
                <span className={`text-xl font-bold text-transparent bg-gradient-to-r ${t.price} bg-clip-text`}>
                  R$ {preco.toFixed(2)}
                </span>
              </div>
            )}
            <Button
              onClick={onCtaClick}
              className={`flex-1 bg-gradient-to-r ${t.gradientButton} text-white font-semibold py-6 rounded-full`}
            >
              <Phone className="w-4 h-4 mr-2" />
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LPFloatingCta;
