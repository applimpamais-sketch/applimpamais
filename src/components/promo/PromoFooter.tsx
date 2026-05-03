import { Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PLATFORM_NAME } from '@/lib/constants';

const PromoFooter = () => {
  return (
    <footer className="py-8 px-4 border-t border-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>{PLATFORM_NAME} • CNPJ: XX.XXX.XXX/0001-XX</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <Link to="/privacidade" className="text-gray-500 hover:text-cyan-400 transition-colors">
              Política de Privacidade
            </Link>
            <span className="flex items-center gap-1 text-gray-500">
              <Lock className="w-3 h-3" />
              Dados protegidos
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          * Promoção válida para sofás de até 2,5 metros. Consulte disponibilidade para sua região.
          <br />
          Atendimento em Belo Horizonte e Região Metropolitana.
        </p>
      </div>
    </footer>
  );
};

export default PromoFooter;
