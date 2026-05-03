import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUp, MessageCircle } from 'lucide-react';

interface LPFooterTeodoroProps {
  ano?: string;
  ctaText?: string;
  ctaHref?: string;
}

const LPFooterTeodoro = ({
  ano = '2024',
  ctaText = 'WhatsApp',
  ctaHref = 'http://wa.me/558999851484',
}: LPFooterTeodoroProps) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#080808] border-t border-white/10 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-white/50 text-sm">
            {ano}
          </p>

          {/* Rights */}
          <p className="text-white/50 text-sm text-center">
            TODOS OS DIREITOS RESERVADOS
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* WhatsApp Button */}
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {ctaText}
            </a>

            {/* Back to top */}
            <Button
              onClick={scrollToTop}
              variant="outline"
              size="icon"
              className="rounded-lg border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LPFooterTeodoro;
