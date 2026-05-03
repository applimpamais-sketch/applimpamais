import { PLATFORM_NAME, SUPPORT_PHONE, WHATSAPP_BOT } from "@/lib/constants";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-primary-foreground mb-3">{PLATFORM_NAME}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Serviço profissional de higienização e impermeabilização de estofados em BH e região.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-primary transition-colors">Início</Link></li>
              <li><Link to="/agendamento" className="text-gray-400 hover:text-primary transition-colors">Agendamento</Link></li>
              <li><Link to="/avaliacoes" className="text-gray-400 hover:text-primary transition-colors">Avaliações</Link></li>
              <li><Link to="/cupons" className="text-gray-400 hover:text-primary transition-colors">Cupons</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacidade" className="text-gray-400 hover:text-primary transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/solucao-empresas" className="text-gray-400 hover:text-primary transition-colors">Solução Empresas</Link></li>
              <li><Link to="/seja-parceiro" className="text-gray-400 hover:text-primary transition-colors">Seja Parceiro</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                Belo Horizonte, MG
              </li>
              <li>
                <a href={WHATSAPP_BOT.waLink()} className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  {SUPPORT_PHONE || 'WhatsApp'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {PLATFORM_NAME}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
