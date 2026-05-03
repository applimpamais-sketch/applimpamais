import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { OptimizedRoute } from '@/hooks/useOSRMTripOptimizer';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Ícone do técnico (carro)
const tecnicoIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8));
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    font-size: 18px;
  ">🚗</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Criar ícone numerado
function createNumberedIcon(number: number, isOptimized: boolean) {
  const color = isOptimized ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

interface TecnicoLocation {
  latitude: number;
  longitude: number;
  nome: string;
}

interface RouteOptimizerMapProps {
  result: OptimizedRoute;
  tecnicoLocation: TecnicoLocation;
}

// Componente para ajustar bounds do mapa
function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useMemo(() => {
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, bounds]);
  return null;
}

export default function RouteOptimizerMap({ result, tecnicoLocation }: RouteOptimizerMapProps) {
  const [showOriginal, setShowOriginal] = useState(true);
  const [showOptimized, setShowOptimized] = useState(true);

  // Calcular bounds para incluir todos os pontos
  const bounds = useMemo(() => {
    const allPoints: [number, number][] = [
      [tecnicoLocation.latitude, tecnicoLocation.longitude],
      ...result.waypoints.map(w => [w.latitude, w.longitude] as [number, number])
    ];
    return L.latLngBounds(allPoints.map(p => L.latLng(p[0], p[1])));
  }, [result.waypoints, tecnicoLocation]);

  const center: [number, number] = [tecnicoLocation.latitude, tecnicoLocation.longitude];

  return (
    <div className="space-y-3">
      {/* Toggle controls */}
      <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Switch
            id="show-original"
            checked={showOriginal}
            onCheckedChange={setShowOriginal}
          />
          <Label htmlFor="show-original" className="flex items-center gap-2 cursor-pointer">
            <div className="w-4 h-1 bg-destructive rounded" style={{ borderStyle: 'dashed' }} />
            Rota Original
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="show-optimized"
            checked={showOptimized}
            onCheckedChange={setShowOptimized}
          />
          <Label htmlFor="show-optimized" className="flex items-center gap-2 cursor-pointer">
            <div className="w-4 h-1 bg-green-600 rounded" />
            Rota Otimizada
          </Label>
        </div>
      </div>

      {/* Mapa */}
      <div className="h-[400px] rounded-lg overflow-hidden border">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds bounds={bounds} />

          {/* Rota original (vermelho tracejado) */}
          {showOriginal && result.originalGeometry.length > 0 && (
            <Polyline
              positions={result.originalGeometry}
              pathOptions={{
                color: '#ef4444',
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 10'
              }}
            />
          )}

          {/* Rota otimizada (verde sólido) */}
          {showOptimized && result.optimizedGeometry.length > 0 && (
            <Polyline
              positions={result.optimizedGeometry}
              pathOptions={{
                color: '#22c55e',
                weight: 4,
                opacity: 0.9
              }}
            />
          )}

          {/* Marcador do técnico */}
          <Marker 
            position={[tecnicoLocation.latitude, tecnicoLocation.longitude]}
            icon={tecnicoIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Ponto de Partida</strong>
                <br />
                {tecnicoLocation.nome}
              </div>
            </Popup>
          </Marker>

          {/* Marcadores dos waypoints */}
          {result.waypoints.map((waypoint) => (
            <Marker
              key={waypoint.id}
              position={[waypoint.latitude, waypoint.longitude]}
              icon={createNumberedIcon(
                showOptimized ? waypoint.ordemOtimizada! : waypoint.ordemOriginal,
                showOptimized
              )}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <strong>{waypoint.nome}</strong>
                  <div className="text-muted-foreground">{waypoint.endereco}</div>
                  {waypoint.bairro && (
                    <div className="text-muted-foreground">{waypoint.bairro}</div>
                  )}
                  {waypoint.horario && (
                    <div className="text-xs">Horário: {waypoint.horario}</div>
                  )}
                  <div className="text-xs pt-1 border-t">
                    Original: {waypoint.ordemOriginal}º | Otimizada: {waypoint.ordemOtimizada}º
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>🚗</span> Ponto de partida
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-destructive rounded-full border border-white" />
          Ordem original
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-600 rounded-full border border-white" />
          Ordem otimizada
        </div>
      </div>
    </div>
  );
}
