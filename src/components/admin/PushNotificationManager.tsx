import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { playNotificationSound } from '@/utils/notificationSound';
import { showKiwifyToast } from './KiwifyNotification';
import { useAuth } from '@/hooks/useAuth';

// VAPID Public Key - adicione ao .env como VITE_VAPID_PUBLIC_KEY
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export function PushNotificationManager() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    // Verificar se as notificações já foram concedidas
    const checkAndInitialize = async () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        await initializePushNotifications();
      }
    };

    checkAndInitialize();
    
    // Configurar listener para novos agendamentos (toast quando app aberto)
    const channel = supabase
      .channel('push-new-agendamentos')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agendamentos'
        },
        (payload) => {
          const agendamento = payload.new;
          
          // Se o usuário está com a janela ativa, mostrar toast customizado
          if (document.visibilityState === 'visible') {
            showKiwifyToast(agendamento);
            playNotificationSound();
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const initializePushNotifications = async () => {
    // Verificar suporte
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('⚠️ Push notifications não suportadas neste navegador');
      return;
    }

    // Não solicita permissão automaticamente - apenas inscreve se já foi concedida
    if (Notification.permission !== 'granted') {
      console.log('ℹ️ Permissão não concedida ainda - aguardando ação do usuário');
      return;
    }

    try {
      // Buscar VAPID public key automaticamente do backend
      console.log('🔑 Buscando VAPID public key automaticamente...');
      const { data: vapidData, error: vapidError } = await supabase.functions.invoke('get-vapid-public-key');
      
      if (vapidError || !vapidData?.publicKey) {
        console.error('❌ Erro ao buscar VAPID public key:', vapidError);
        return;
      }

      console.log('✅ VAPID public key obtida automaticamente!');

      // Aguardar service worker estar pronto
      const registration = await navigator.serviceWorker.ready;
      
      // Verificar se já está inscrito
      let subscription = await (registration as any).pushManager.getSubscription();
      
      if (subscription) {
        console.log('✅ Já inscrito em push notifications');
        setIsSubscribed(true);
        await saveSubscription(subscription);
        return;
      }

      // Criar subscription
      subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey)
      });

      console.log('🔔 Nova subscription criada');
      
      // Salvar no banco
      await saveSubscription(subscription);
      
      setIsSubscribed(true);
      toast.success('Notificações push ativadas! 🎉');
      
    } catch (error) {
      console.error('Erro ao configurar push notifications:', error);
    }
  };

  const saveSubscription = async (subscription: PushSubscription) => {
    const subJSON = subscription.toJSON();
    
    // Detectar dispositivo
    const ua = navigator.userAgent.toLowerCase();
    let dispositivo = 'desktop';
    if (/iphone|ipad|ipod/.test(ua)) {
      dispositivo = 'ios';
    } else if (/android/.test(ua)) {
      dispositivo = 'android';
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user!.id,
        endpoint: subscription.endpoint,
        p256dh: subJSON.keys?.p256dh || '',
        auth: subJSON.keys?.auth || '',
        user_agent: navigator.userAgent,
        dispositivo,
        ativo: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      });

    if (error) {
      console.error('Erro ao salvar subscription:', error);
    }
  };

  // Converter VAPID key de base64 para Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return null; // Componente invisível
}
