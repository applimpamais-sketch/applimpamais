import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// OneSignal App ID
const ONESIGNAL_APP_ID = '64a2fd66-20c0-4ca5-ae3a-62e166855924';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

export function OneSignalInit() {
  const { user } = useAuth();

  useEffect(() => {
    // Only initialize OneSignal for admin routes
    if (!window.location.pathname.startsWith('/admin')) {
      return;
    }

    // Check if already loaded
    if (window.OneSignal) {
      return;
    }

    // Load OneSignal SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    document.head.appendChild(script);

    // Initialize OneSignal
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal: any) {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true, // For development
      });

      // Set external user ID if logged in (for targeted notifications)
      if (user?.id) {
        await OneSignal.login(user.id);
        console.log('✅ OneSignal: User logged in', user.id);
      }

      console.log('✅ OneSignal initialized for admin');
    });

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src*="OneSignalSDK"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [user?.id]);

  return null; // Invisible component
}
