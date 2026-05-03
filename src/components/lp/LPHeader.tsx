import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CountdownTimer from './CountdownTimer';
import { LPTheme, getTheme } from '@/styles/lp-themes';
import { PLATFORM_NAME } from '@/lib/constants';

interface LPHeaderProps {
  showTimer?: boolean;
  ctaText?: string;
  theme?: LPTheme;
  onCtaClick?: () => void;
}

const LPHeader = ({ 
  showTimer = true, 
  ctaText = 'Agendar Agora', 
  theme = 'midnight',
  onCtaClick 
}: LPHeaderProps) => {
  const t = getTheme(theme);
  
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 ${t.bgPrimary}/95 backdrop-blur-md ${t.border} border-b`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradientPrimary} flex items-center justify-center`}>
            <span className="text-white font-bold text-lg">{PLATFORM_NAME.slice(0, 2).toUpperCase()}</span>
          </div>
          <span className={`hidden sm:block ${t.textPrimary} font-semibold`}>{PLATFORM_NAME}</span>
        </div>

        {/* Timer */}
        {showTimer && (
          <div className="hidden md:flex items-center gap-3">
            <span className={`text-sm ${t.textMuted}`}>Oferta expira em:</span>
            <CountdownTimer hours={2} minutes={30} seconds={0} theme={theme} />
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={onCtaClick}
          className={`bg-gradient-to-r ${t.gradientButton} text-white font-semibold px-4 py-2 rounded-full shadow-lg ${t.glowColor}`}
        >
          <Phone className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{ctaText}</span>
          <span className="sm:hidden">Agendar</span>
        </Button>
      </div>
    </motion.header>
  );
};

export default LPHeader;
