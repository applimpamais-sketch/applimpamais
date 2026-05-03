export function setupPWAPrompt() {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir o prompt automático
    e.preventDefault();
    
    // Só permitir na área admin
    if (!window.location.pathname.startsWith('/admin')) {
      return;
    }
    
    deferredPrompt = e;
  });

  return {
    showInstallPrompt: async () => {
      if (!deferredPrompt) return false;
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      
      return outcome === 'accepted';
    }
  };
}
