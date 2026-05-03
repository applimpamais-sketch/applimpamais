import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Search, Loader2, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGeocode, GeocodeResult } from '@/hooks/useGeocode';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface EditTecnicoLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tecnico: {
    id: string;
    nome_completo: string;
    latitude?: number | null;
    longitude?: number | null;
    endereco?: string | null;
    cidade?: string | null;
  };
}

// Component to update map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function EditTecnicoLocationModal({
  open,
  onOpenChange,
  tecnico
}: EditTecnicoLocationModalProps) {
  const queryClient = useQueryClient();
  const { searchAddress, getCurrentPosition, results, isLoading: isSearching, clearResults } = useGeocode();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<GeocodeResult | null>(null);
  const [isGettingGPS, setIsGettingGPS] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Default center (João Pessoa, PB)
  const defaultCenter: [number, number] = [-7.1195, -34.8450];
  
  const mapCenter: [number, number] = selectedLocation 
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : tecnico.latitude && tecnico.longitude
      ? [tecnico.latitude, tecnico.longitude]
      : defaultCenter;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedLocation(null);
      clearResults();
      setShowSuggestions(false);
      
      // If tecnico already has location, pre-populate
      if (tecnico.latitude && tecnico.longitude) {
        setSelectedLocation({
          latitude: tecnico.latitude,
          longitude: tecnico.longitude,
          displayName: tecnico.endereco || `${tecnico.latitude.toFixed(6)}, ${tecnico.longitude.toFixed(6)}`
        });
      }
    }
  }, [open, tecnico, clearResults]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        searchAddress(searchQuery);
        setShowSuggestions(true);
      } else {
        clearResults();
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchAddress, clearResults]);

  const handleGetCurrentPosition = async () => {
    setIsGettingGPS(true);
    try {
      const result = await getCurrentPosition();
      setSelectedLocation(result);
      setSearchQuery('');
      setShowSuggestions(false);
      toast.success('Localização obtida com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao obter localização');
    } finally {
      setIsGettingGPS(false);
    }
  };

  const handleSelectSuggestion = useCallback((result: GeocodeResult) => {
    setSelectedLocation(result);
    setSearchQuery(result.displayName);
    setShowSuggestions(false);
    clearResults();
  }, [clearResults]);

  const handleSave = async () => {
    if (!selectedLocation) {
      toast.error('Selecione uma localização');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        })
        .eq('id', tecnico.id);

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['tecnicos'] });
      
      toast.success('Localização salva com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar localização:', error);
      toast.error('Erro ao salvar localização');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Definir Localização Base
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{tecnico.nome_completo}</span>
            <br />
            Esta localização será usada como ponto de partida para calcular rotas otimizadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* GPS Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGetCurrentPosition}
            disabled={isGettingGPS}
          >
            {isGettingGPS ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="mr-2 h-4 w-4" />
            )}
            {isGettingGPS ? 'Obtendo localização...' : 'Usar Minha Localização Atual'}
          </Button>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-muted" />
            <span className="px-3 text-sm text-muted-foreground">ou</span>
            <div className="flex-1 border-t border-muted" />
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por endereço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && results.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={index}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors border-b last:border-b-0"
                    onClick={() => handleSelectSuggestion(result)}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{result.displayName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="h-[250px] rounded-lg overflow-hidden border">
            <MapContainer
              center={mapCenter}
              zoom={selectedLocation ? 15 : 12}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {selectedLocation && (
                <>
                  <Marker 
                    position={[selectedLocation.latitude, selectedLocation.longitude]}
                    icon={markerIcon}
                  />
                  <MapUpdater center={[selectedLocation.latitude, selectedLocation.longitude]} />
                </>
              )}
            </MapContainer>
          </div>

          {/* Coordinates Display */}
          {selectedLocation && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span className="font-medium">Localização selecionada:</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {selectedLocation.displayName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Coordenadas: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={!selectedLocation || isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Localização'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
