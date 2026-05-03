import { motion } from 'framer-motion';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LP12DFooterProps {
  logoUrl?: string;
  copyrightText?: string;
  designerLogoUrl?: string;
  designerUrl?: string;
  theme?: LPTheme;
}

const LP12DFooter = ({
  logoUrl = "https://catiaregiely.com.br/wp-content/uploads/2024/09/Agrupar-1-1.png",
  copyrightText = "© 2024 Catia Regiely. Todos os direitos reservados.",
  designerLogoUrl = "https://catiaregiely.com.br/wp-content/uploads/2024/10/tiny-1.webp",
  designerUrl = "https://www.tinydigital.com.br",
  theme = 'midnight'
}: LP12DFooterProps) => {
  const t = getTheme(theme);

  return (
    <footer className="relative py-10 overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 ${t.bgPrimary}`} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6"
        >
          {/* Logo */}
          <img
            src={logoUrl}
            alt="Logo"
            className="h-8 md:h-10 w-auto opacity-80"
          />

          {/* Copyright */}
          <p className="text-gray-400 text-sm text-center">
            {copyrightText}
          </p>

          {/* Divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Designer Credit */}
          <a
            href={designerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-500 text-xs hover:text-gray-400 transition-colors"
          >
            <span>Desenvolvido por</span>
            <img
              src={designerLogoUrl}
              alt="Designer"
              className="h-5 w-auto opacity-60 hover:opacity-80 transition-opacity"
            />
          </a>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="/privacidade" className="hover:text-gray-400 transition-colors">
              Política de Privacidade
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-400 transition-colors">
              Termos de Uso
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default LP12DFooter;
