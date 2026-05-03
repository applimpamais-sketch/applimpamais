import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function MobileOptimizations() {
  const location = useLocation();
  
  useEffect(() => {
    // Registrar SW quando entrar na área admin
    if (location.pathname.startsWith('/admin')) {
      import('virtual:pwa-register').then(({ registerSW }) => {
        registerSW({ immediate: true });
      }).catch(() => {
        // SW já registrado ou erro silencioso
      });
    }
    
    // Prevenir pull-to-refresh excessivo em PWAs
    document.body.style.overscrollBehavior = 'contain';
    
    // Adicionar classe para PWA instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      document.body.classList.add('pwa-installed');
    }
    
    return () => {
      document.body.style.overscrollBehavior = 'auto';
    };
  }, [location.pathname]);
  
  // Componente invisível, só aplica otimizações
  return null;
}
