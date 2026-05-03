import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Constantes para cálculo de combustível
const CONSUMO_KM_POR_LITRO = 10;
const PRECO_LITRO = 5.50;

export interface Waypoint {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  latitude: number;
  longitude: number;
  horario?: string;
  ordemOriginal: number;
  ordemOtimizada?: number;
}

export interface OptimizedRoute {
  waypoints: Waypoint[];
  optimizedOrder: Waypoint[];
  originalDistance: number;
  optimizedDistance: number;
  originalDuration: number;
  optimizedDuration: number;
  originalGeometry: [number, number][];
  optimizedGeometry: [number, number][];
  savings: {
    distanceKm: number;
    distancePercent: number;
    durationMin: number;
    durationPercent: number;
    fuelLiters: number;
    fuelCost: number;
  };
}

interface TecnicoLocation {
  latitude: number;
  longitude: number;
}

// Decodifica polyline encoded do OSRM
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

// Calcula rota sequencial (ordem original)
async function calculateSequentialRoute(
  tecnicoLocation: TecnicoLocation,
  waypoints: Waypoint[]
): Promise<{ distance: number; duration: number; geometry: [number, number][] }> {
  const allPoints = [
    { lat: tecnicoLocation.latitude, lng: tecnicoLocation.longitude },
    ...waypoints.map(w => ({ lat: w.latitude, lng: w.longitude }))
  ];

  const coords = allPoints.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=polyline`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes?.[0]) {
    throw new Error('Erro ao calcular rota original');
  }

  const route = data.routes[0];
  return {
    distance: route.distance / 1000, // metros para km
    duration: route.duration / 60, // segundos para minutos
    geometry: decodePolyline(route.geometry)
  };
}

// Calcula rota otimizada via OSRM Trip API (TSP)
async function calculateOptimizedRoute(
  tecnicoLocation: TecnicoLocation,
  waypoints: Waypoint[]
): Promise<{ 
  distance: number; 
  duration: number; 
  geometry: [number, number][]; 
  waypointOrder: number[] 
}> {
  const allPoints = [
    { lat: tecnicoLocation.latitude, lng: tecnicoLocation.longitude },
    ...waypoints.map(w => ({ lat: w.latitude, lng: w.longitude }))
  ];

  const coords = allPoints.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `https://router.project-osrm.org/trip/v1/driving/${coords}?source=first&roundtrip=false&geometries=polyline&overview=full`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.code !== 'Ok' || !data.trips?.[0]) {
    throw new Error('Erro ao calcular rota otimizada');
  }

  const trip = data.trips[0];
  const waypointOrder = data.waypoints
    .slice(1) // Remove o ponto do técnico
    .map((wp: { waypoint_index: number }) => wp.waypoint_index - 1); // Ajusta índice

  return {
    distance: trip.distance / 1000,
    duration: trip.duration / 60,
    geometry: decodePolyline(trip.geometry),
    waypointOrder
  };
}

export function useOSRMTripOptimizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizedRoute | null>(null);

  const fetchAgendamentos = useCallback(async (tecnicoId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('agendamentos')
      .select('id, nome_cliente, endereco, bairro, latitude, longitude, horario')
      .eq('tecnico_id', tecnicoId)
      .eq('data_agendamento', dateStr)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('horario', { ascending: true });

    if (error) throw error;
    return data || [];
  }, []);

  const fetchTecnicoLocation = useCallback(async (tecnicoId: string): Promise<TecnicoLocation | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('latitude, longitude')
      .eq('id', tecnicoId)
      .single();

    if (error || !data?.latitude || !data?.longitude) {
      return null;
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude
    };
  }, []);

  const optimize = useCallback(async (tecnicoId: string, date: Date) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Buscar localização do técnico
      const tecnicoLocation = await fetchTecnicoLocation(tecnicoId);
      if (!tecnicoLocation) {
        throw new Error('Técnico não possui localização cadastrada');
      }

      // 2. Buscar agendamentos do dia
      const agendamentos = await fetchAgendamentos(tecnicoId, date);
      
      if (agendamentos.length < 2) {
        throw new Error('Mínimo de 2 agendamentos necessários para otimizar');
      }

      // 3. Converter para waypoints
      const waypoints: Waypoint[] = agendamentos.map((ag, index) => ({
        id: ag.id,
        nome: ag.nome_cliente,
        endereco: ag.endereco,
        bairro: ag.bairro || '',
        latitude: ag.latitude!,
        longitude: ag.longitude!,
        horario: ag.horario || undefined,
        ordemOriginal: index + 1
      }));

      // 4. Calcular rotas em paralelo
      const [originalRoute, optimizedRoute] = await Promise.all([
        calculateSequentialRoute(tecnicoLocation, waypoints),
        calculateOptimizedRoute(tecnicoLocation, waypoints)
      ]);

      // 5. Reordenar waypoints conforme otimização
      const optimizedOrder = optimizedRoute.waypointOrder.map((idx, newPos) => ({
        ...waypoints[idx],
        ordemOtimizada: newPos + 1
      }));

      // Atualizar waypoints com ordem otimizada
      const waypointsWithOptimizedOrder = waypoints.map(wp => {
        const optimizedIdx = optimizedRoute.waypointOrder.indexOf(wp.ordemOriginal - 1);
        return {
          ...wp,
          ordemOtimizada: optimizedIdx + 1
        };
      });

      // 6. Calcular economia
      const distanceSaved = originalRoute.distance - optimizedRoute.distance;
      const durationSaved = originalRoute.duration - optimizedRoute.duration;
      const fuelSaved = distanceSaved / CONSUMO_KM_POR_LITRO;
      const moneySaved = fuelSaved * PRECO_LITRO;

      const result: OptimizedRoute = {
        waypoints: waypointsWithOptimizedOrder,
        optimizedOrder,
        originalDistance: originalRoute.distance,
        optimizedDistance: optimizedRoute.distance,
        originalDuration: originalRoute.duration,
        optimizedDuration: optimizedRoute.duration,
        originalGeometry: originalRoute.geometry,
        optimizedGeometry: optimizedRoute.geometry,
        savings: {
          distanceKm: Math.max(0, distanceSaved),
          distancePercent: originalRoute.distance > 0 
            ? Math.max(0, (distanceSaved / originalRoute.distance) * 100) 
            : 0,
          durationMin: Math.max(0, durationSaved),
          durationPercent: originalRoute.duration > 0
            ? Math.max(0, (durationSaved / originalRoute.duration) * 100)
            : 0,
          fuelLiters: Math.max(0, fuelSaved),
          fuelCost: Math.max(0, moneySaved)
        }
      };

      setResult(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao otimizar rota';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchAgendamentos, fetchTecnicoLocation]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    optimize,
    reset,
    result,
    isLoading,
    error
  };
}
