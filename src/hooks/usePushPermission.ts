import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type PermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function usePushPermission() {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = (): PermissionStatus => {
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
      return 'unsupported';
    }
    
    const status = Notification.permission as PermissionStatus;
    setPermissionStatus(status);
    return status;
  };

  const requestPermission = async (): Promise<PermissionStatus> => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    setIsLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission as PermissionStatus);

      // Track permission request
      if (user) {
        await supabase
          .from('push_subscriptions')
          .update({
            permission_status: permission,
            permission_requested_at: new Date().toISOString(),
            permission_denied_count: permission === 'denied' ? 1 : 0
          })
          .eq('user_id', user.id);
      }

      return permission as PermissionStatus;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return 'denied';
    } finally {
      setIsLoading(false);
    }
  };

  const getBrowserName = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'safari';
    if (userAgent.includes('Edg')) return 'edge';
    return 'other';
  };

  return {
    permissionStatus,
    isLoading,
    requestPermission,
    checkPermissionStatus,
    getBrowserName,
    isSupported: 'Notification' in window,
  };
}
