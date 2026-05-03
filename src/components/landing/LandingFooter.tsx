import { Facebook, Instagram, Mail, Phone } from 'lucide-react';
import { PLATFORM_NAME, SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_DIGITS } from '@/lib/constants';

export default function LandingFooter() {
  return (
    <footer className="bg-black border-t border-gray-800 text-white py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <img
              src="/icon-512x512.png"
              alt={PLATFORM_NAME}
              className="h-12 w-auto"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Sistema completo de gestão para empresas de limpeza de estofados. White label e totalmente personalizável.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Solução</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Planos e Preços
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  White Label
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Demonstração
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Suporte</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contato</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{SUPPORT_EMAIL}</span>
                </a>
              </li>
              <li>
                <a href={SUPPORT_PHONE_DIGITS ? `tel:+${SUPPORT_PHONE_DIGITS}` : '#'} className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{SUPPORT_PHONE || 'Telefone não configurado'}</span>
                </a>
              </li>
            </ul>

            {/* Social Media */}
            <div className="flex gap-3 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} {PLATFORM_NAME}. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-accent transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
