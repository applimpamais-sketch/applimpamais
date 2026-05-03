import { useState, useCallback } from 'react';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export function useGeocode() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GeocodeResult[]>([]);

  const searchAddress = useCallback(async (query: string): Promise<GeocodeResult[]> => {
    if (!query || query.length < 3) {
      setResults([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=br`,
        {
          headers: {
            'Accept-Language': 'pt-BR',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar endereço');
      }

      const data: NominatimResult[] = await response.json();
      
      const formattedResults: GeocodeResult[] = data.map((item) => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        displayName: item.display_name
      }));

      setResults(formattedResults);
      return formattedResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setResults([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentPosition = useCallback((): Promise<GeocodeResult> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode para obter o endereço
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?` +
              `lat=${latitude}&lon=${longitude}&format=json`,
              {
                headers: {
                  'Accept-Language': 'pt-BR',
                }
              }
            );

            if (response.ok) {
              const data = await response.json();
              resolve({
                latitude,
                longitude,
                displayName: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              });
            } else {
              resolve({
                latitude,
                longitude,
                displayName: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              });
            }
          } catch {
            resolve({
              latitude,
              longitude,
              displayName: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            });
          }
        },
        (error) => {
          let message = 'Erro ao obter localização';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permissão de localização negada. Verifique as configurações do navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Localização indisponível';
              break;
            case error.TIMEOUT:
              message = 'Tempo esgotado ao obter localização';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    searchAddress,
    getCurrentPosition,
    clearResults,
    results,
    isLoading,
    error
  };
}
