import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

interface UseGeoTrackingOptions {
  trackingSessionId: string | null;
  enabled: boolean;
  intervalMs?: number;
}

export function useGeoTracking({ trackingSessionId, enabled, intervalMs = 10000 }: UseGeoTrackingOptions) {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  // Verificar permissão de geolocalização
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setPermissionStatus('unknown');
      return 'unknown';
    }
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
      return result.state;
    } catch {
      setPermissionStatus('unknown');
      return 'unknown';
    }
  }, []);

  // Solicitar permissão
  const requestPermission = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocalização não suportada neste dispositivo');
        toast.error('Seu navegador não suporta geolocalização');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionStatus('granted');
          setError(null);
          resolve(true);
        },
        (err) => {
          if (err.code === 1) {
            setPermissionStatus('denied');
            setError('Permissão de localização negada');
            toast.error('Por favor, permita o acesso à sua localização');
          } else if (err.code === 2) {
            setError('Localização indisponível');
            toast.error('Não foi possível obter sua localização');
          } else {
            setError('Erro ao obter localização');
            toast.error('Erro ao obter localização');
          }
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  // Enviar posição para o banco
  const sendPosition = useCallback(async (pos: GeoPosition) => {
    if (!trackingSessionId) return;

    const now = Date.now();
    // Evitar envios muito frequentes
    if (now - lastSentRef.current < intervalMs - 1000) return;
    lastSentRef.current = now;

    try {
      // Inserir nova posição
      const { error: insertError } = await supabase
        .from('tracking_positions')
        .insert({
          tracking_session_id: trackingSessionId,
          latitude: pos.latitude,
          longitude: pos.longitude,
          velocidade: pos.speed ? pos.speed * 3.6 : null, // m/s para km/h
          precisao: pos.accuracy,
          heading: pos.heading,
        });

      if (insertError) {
        console.error('Erro ao enviar posição:', insertError);
      }
    } catch (err) {
      console.error('Erro ao enviar posição:', err);
    }
  }, [trackingSessionId, intervalMs]);

  // Iniciar tracking
  const startTracking = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada');
      return false;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) return false;

    setIsTracking(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (geoPosition) => {
        const newPos: GeoPosition = {
          latitude: geoPosition.coords.latitude,
          longitude: geoPosition.coords.longitude,
          accuracy: geoPosition.coords.accuracy,
          heading: geoPosition.coords.heading,
          speed: geoPosition.coords.speed,
          timestamp: geoPosition.timestamp,
        };
        
        setPosition(newPos);
        
        if (enabled && trackingSessionId) {
          sendPosition(newPos);
        }
      },
      (err) => {
        console.error('Erro de geolocalização:', err);
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    return true;
  }, [enabled, trackingSessionId, requestPermission, sendPosition]);

  // Parar tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Efeito para controlar tracking
  useEffect(() => {
    if (enabled && trackingSessionId) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [enabled, trackingSessionId, startTracking, stopTracking]);

  // Verificar permissão inicial
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    position,
    error,
    isTracking,
    permissionStatus,
    requestPermission,
    startTracking,
    stopTracking,
  };
}
