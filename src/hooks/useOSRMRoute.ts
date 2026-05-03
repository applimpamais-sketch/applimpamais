import { useState, useEffect, useCallback, useRef } from 'react';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface RouteData {
  coordinates: [number, number][];
  distance: number; // metros
  duration: number; // segundos
}

// Decodificar polyline do OSRM
function decodePolyline(str: string, precision = 5): [number, number][] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: [number, number][] = [];
  const factor = Math.pow(10, precision);

  while (index < str.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}

// Calcular distância entre dois pontos (Haversine)
function getDistance(p1: Coordinate, p2: Coordinate): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.latitude * Math.PI) / 180) *
      Math.cos((p2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useOSRMRoute(
  origin: Coordinate | null,
  destination: Coordinate | null
) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastOriginRef = useRef<Coordinate | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRoute = useCallback(async () => {
    if (!origin || !destination) {
      setRoute(null);
      return;
    }

    // Verificar se origem mudou mais de 100m (evitar chamadas excessivas)
    if (lastOriginRef.current) {
      const distance = getDistance(lastOriginRef.current, origin);
      if (distance < 100) {
        return; // Não refazer se moveu menos de 100m
      }
    }

    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=polyline`;

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar rota');
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes?.[0]) {
        throw new Error('Rota não encontrada');
      }

      const routeData = data.routes[0];
      const coordinates = decodePolyline(routeData.geometry);

      setRoute({
        coordinates,
        distance: routeData.distance,
        duration: routeData.duration,
      });

      lastOriginRef.current = origin;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Erro OSRM:', err);
      setError(err.message);
      // Em caso de erro, manter rota anterior ou null
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination]);

  // Refazer rota quando origem/destino mudar
  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    route,
    isLoading,
    error,
    refetch: fetchRoute,
  };
}
