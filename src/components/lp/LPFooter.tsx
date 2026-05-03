import { motion } from 'framer-motion';
import { LPTheme, getTheme } from '@/styles/lp-themes';
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { PLATFORM_NAME, SUPPORT_EMAIL, SUPPORT_PHONE_DIGITS, WHATSAPP_BOT } from '@/lib/constants';

interface LPFooterProps {
  empresaNome?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  theme?: LPTheme;
}

const LPFooter = ({
  empresaNome = PLATFORM_NAME,
  telefone = SUPPORT_PHONE_DIGITS ? SUPPORT_PHONE_DIGITS : '(31) 99999-9999',
  email = SUPPORT_EMAIL,
  endereco = 'Belo Horizonte - MG',
  whatsapp = WHATSAPP_BOT.numero || '5531999999999',
  instagram,
  facebook,
  theme = 'midnight',
}: LPFooterProps) => {
  const t = getTheme(theme);
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${t.bgPrimary} border-t ${t.border}`}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo e descrição */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className={`text-2xl font-bold bg-gradient-to-r ${t.gradientHeadline} bg-clip-text text-transparent`}>
              {empresaNome}
            </h3>
            <p className={`${t.textMuted} text-sm leading-relaxed`}>
              Especialistas em higienização de estofados. Transformando ambientes e cuidando da saúde da sua família desde 2018.
            </p>
            
            {/* Social links */}
            <div className="flex gap-3 pt-2">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full ${t.bgCard} ${t.border} border flex items-center justify-center ${t.textMuted} hover:${t.accent} transition-colors`}
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full ${t.bgCard} ${t.border} border flex items-center justify-center ${t.textMuted} hover:${t.accent} transition-colors`}
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full ${t.bgCard} ${t.border} border flex items-center justify-center ${t.textMuted} hover:${t.accent} transition-colors`}
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>

          {/* Contato */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className={`text-lg font-semibold ${t.textPrimary}`}>
              Contato
            </h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href={`tel:${telefone.replace(/\D/g, '')}`}
                  className={`flex items-center gap-3 ${t.textMuted} hover:${t.accent} transition-colors text-sm`}
                >
                  <Phone className="w-4 h-4" />
                  {telefone}
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${email}`}
                  className={`flex items-center gap-3 ${t.textMuted} hover:${t.accent} transition-colors text-sm`}
                >
                  <Mail className="w-4 h-4" />
                  {email}
                </a>
              </li>
              <li>
                <span className={`flex items-center gap-3 ${t.textMuted} text-sm`}>
                  <MapPin className="w-4 h-4" />
                  {endereco}
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Links rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className={`text-lg font-semibold ${t.textPrimary}`}>
              Links Rápidos
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#hero" className={`${t.textMuted} hover:${t.accent} transition-colors text-sm`}>
                  Início
                </a>
              </li>
              <li>
                <a href="#beneficios" className={`${t.textMuted} hover:${t.accent} transition-colors text-sm`}>
                  Nossos Serviços
                </a>
              </li>
              <li>
                <a href="#depoimentos" className={`${t.textMuted} hover:${t.accent} transition-colors text-sm`}>
                  Depoimentos
                </a>
              </li>
              <li>
                <a href="#faq" className={`${t.textMuted} hover:${t.accent} transition-colors text-sm`}>
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className={`mt-12 pt-8 border-t ${t.border} text-center`}
        >
          <p className={`${t.textMuted} text-sm`}>
            © {currentYear} {empresaNome}. Todos os direitos reservados.
          </p>
          <p className={`${t.textMuted} text-xs mt-2`}>
            Desenvolvido com ❤️ para transformar ambientes
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default LPFooter;
