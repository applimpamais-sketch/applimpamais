import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CONSENT_VERSION = 'v1.0';
const CONSENT_TEXT = `Autorizo a RC Limpa Mais a coletar e processar meus dados pessoais conforme descrito na Política de Privacidade, incluindo nome, telefone, endereço e dados de geolocalização, exclusivamente para fins de prestação de serviços de limpeza, conforme Art. 7º, V da LGPD.`;

export function LGPDConsent() {
  const [visible, setVisible] = useState(false);
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem('session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', sid);
    }
    return sid;
  });

  useEffect(() => {
    const consent = localStorage.getItem('lgpd_consent');
    if (!consent) {
      // Pequeno delay para evitar flash no carregamento
      setTimeout(() => setVisible(true), 500);
    }
  }, []);

  const handleAccept = async () => {

    const consentData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    // 🔒 SECURITY: Salvar no banco de dados para compliance
    try {
      const { error } = await supabase
        .from('lgpd_consents')
        .insert({
          session_id: sessionId,
          consent_given: true,
          consent_version: CONSENT_VERSION,
          consent_text: CONSENT_TEXT,
          ip_address: null, // IP será capturado via trigger no backend
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error('Erro ao registrar consentimento LGPD:', error);
        // Não bloquear se o registro falhar, mas logar para investigação
      }
    } catch (error) {
      console.error('Erro ao salvar consentimento:', error);
    }

    // Manter no localStorage para verificação rápida
    localStorage.setItem('lgpd_consent', JSON.stringify(consentData));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-in-up"
      role="dialog"
      aria-live="polite"
      aria-label="Consentimento de privacidade"
    >
      <div className="bg-background/95 backdrop-blur-sm border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Conteúdo principal */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">
                  Utilizamos seus dados para prestar nossos serviços de limpeza.{' '}
                  <a 
                    href="/privacidade" 
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver política completa
                  </a>
                </p>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                size="sm"
                onClick={handleAccept}
                className="flex-1 sm:flex-initial"
              >
                Aceitar
              </Button>
              <Button 
                size="sm"
                variant="ghost"
                onClick={() => setVisible(false)}
                className="sm:hidden"
                aria-label="Fechar banner"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}