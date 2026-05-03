import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LP12DHeaderProps {
  logoUrl?: string;
  ctaUrl?: string;
  ctaText?: string;
  theme?: LPTheme;
}

const LP12DHeader = ({ 
  logoUrl = "https://catiaregiely.com.br/wp-content/uploads/2024/09/Agrupar-1-1.png",
  ctaUrl = "#preco",
  ctaText = "SABER MAIS",
  theme = 'midnight'
}: LP12DHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = getTheme(theme);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Início', href: '#home' },
    { label: 'Depoimentos', href: '#Depoimentos' },
    { label: 'Desafio', href: '#Desafio' },
    { label: 'Preço', href: '#preco' },
    { label: 'Mentora', href: '#Mentora' },
    { label: 'FAQ', href: '#Faq' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? `${t.bgPrimary}/95 backdrop-blur-lg shadow-lg` 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}>
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-8 md:h-10 w-auto"
            />
          </a>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <a
            href={ctaUrl}
            onClick={(e) => { e.preventDefault(); scrollToSection(ctaUrl); }}
            className={`hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${t.gradientButton} rounded-full text-black font-semibold text-sm hover:shadow-lg ${t.shadowCta} transition-all`}
          >
            <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {ctaText}
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`lg:hidden ${t.bgPrimary}/98 backdrop-blur-lg border-t border-white/10`}
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                  className="text-white/80 hover:text-white py-2 text-center font-medium transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={ctaUrl}
                onClick={(e) => { e.preventDefault(); scrollToSection(ctaUrl); }}
                className={`flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r ${t.gradientButton} rounded-full text-black font-semibold mt-2`}
              >
                <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {ctaText}
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LP12DHeader;
