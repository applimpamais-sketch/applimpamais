// Service Worker para Push Notifications
// Este arquivo é injetado no service worker do Workbox

// Handler para receber notificações push
self.addEventListener('push', (event) => {
  console.log('📬 Push notification recebida:', event);
  
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'Novo agendamento concluído!',
    icon: '/icon-512x512.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'novo-agendamento',
    requireInteraction: true, // Não desaparecer automaticamente
    data: {
      url: data.url || '/admin/agendamentos',
      agendamentoId: data.agendamentoId
    },
    actions: [
      {
        action: 'open',
        title: '👁️ Ver Detalhes'
      },
      {
        action: 'close',
        title: '✖️ Fechar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || '🎉 Novo Agendamento!',
      options
    )
  );
});

// Handler para clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notificação clicada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Abrir ou focar na janela do PWA
  const urlToOpen = event.notification.data?.url || '/admin/agendamentos';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já tem janela aberta, focar nela
        for (const client of clientList) {
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus().then(() => client.navigate(urlToOpen));
          }
        }
        
        // Caso contrário, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('✅ Service Worker Push Handler carregado');
