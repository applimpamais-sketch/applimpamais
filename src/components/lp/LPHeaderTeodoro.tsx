import { motion } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LPTheme, getTheme } from '@/styles/lp-themes';
import { useState } from 'react';

interface MenuItem {
  titulo: string;
  href: string;
}

interface LPHeaderTeodoroProps {
  logoUrl?: string;
  logoText?: string;
  menuItems?: MenuItem[];
  ctaText?: string;
  ctaHref?: string;
  theme?: LPTheme;
  onCtaClick?: () => void;
}

const defaultMenuItems: MenuItem[] = [
  { titulo: 'HOME', href: '#home' },
  { titulo: 'CLÍNICA', href: '#clin' },
  { titulo: 'ESPECIALISTA', href: '#esp' },
  { titulo: 'DEPOIMENTOS', href: '#dep' },
];

const LPHeaderTeodoro = ({
  logoUrl = 'https://page.dsgnrafa.com/wp-content/uploads/2024/07/03-1.svg',
  logoText,
  menuItems = defaultMenuItems,
  ctaText = 'AGENDAR MINHA CONSULTA',
  ctaHref = 'http://wa.me/558999851484',
  theme = 'midnight',
  onCtaClick,
}: LPHeaderTeodoroProps) => {
  const t = getTheme(theme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        const offset = 80; // Height of fixed header
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-8 md:h-10 w-auto"
            />
          ) : logoText ? (
            <span className="text-white font-semibold text-xl">{logoText}</span>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold">TB</span>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavClick(item.href)}
              className="px-4 py-2 text-gray-400 hover:text-white text-sm font-light tracking-wide transition-colors rounded-lg hover:bg-white/10"
            >
              {item.titulo}
            </button>
          ))}
        </nav>

        {/* CTA Desktop */}
        <div className="hidden md:block">
          {onCtaClick ? (
            <Button
              onClick={onCtaClick}
              className="bg-black border border-white/20 hover:bg-white/10 text-white px-6 py-2 rounded-lg text-sm font-normal group"
            >
              {ctaText}
              <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          ) : (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-black border border-white/20 hover:bg-white/10 text-white px-6 py-2 rounded-lg text-sm font-normal group transition-colors"
            >
              {ctaText}
              <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black border-t border-white/10"
        >
          <nav className="flex flex-col p-4 gap-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item.href)}
                className="text-left px-4 py-3 text-gray-400 hover:text-white text-base font-light transition-colors rounded-lg hover:bg-white/10"
              >
                {item.titulo}
              </button>
            ))}
            <div className="pt-4 border-t border-white/10 mt-2">
              {onCtaClick ? (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onCtaClick();
                  }}
                  className="w-full bg-white text-black hover:bg-gray-100 py-3"
                >
                  {ctaText}
                  <ArrowUpRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <a
                  href={ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-white text-black hover:bg-gray-100 py-3 rounded-lg font-medium transition-colors"
                >
                  {ctaText}
                  <ArrowUpRight className="ml-2 w-4 h-4" />
                </a>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default LPHeaderTeodoro;
