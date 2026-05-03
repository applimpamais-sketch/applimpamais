import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useOSRMRoute } from '@/hooks/useOSRMRoute';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface TrackingMapProps {
  tecnicoPosition: { latitude: number; longitude: number } | null;
  destinoPosition: { latitude: number; longitude: number } | null;
  etaMinutos?: number | null;
  distanciaMetros?: number | null;
  className?: string;
}

// Ícone do técnico estilo Uber (carro SVG compacto)
const tecnicoIcon = L.divIcon({
  html: `
    <div style="
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    ">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="#1f2937">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>
    </div>
  `,
  className: 'tecnico-marker-uber',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Ícone do destino estilo Uber (pin preto minimalista)
const destinoIcon = L.divIcon({
  html: `
    <div style="
      width: 24px;
      height: 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        width: 20px;
        height: 20px;
        background: #1f2937;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `,
  className: 'destino-marker-uber',
  iconSize: [24, 36],
  iconAnchor: [12, 36],
});

export default function TrackingMap({ 
  tecnicoPosition, 
  destinoPosition, 
  etaMinutos,
  distanciaMetros,
  className = '' 
}: TrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tecnicoMarkerRef = useRef<L.Marker | null>(null);
  const destinoMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const etaTooltipRef = useRef<L.Tooltip | null>(null);

  // Buscar rota real via OSRM
  const { route } = useOSRMRoute(tecnicoPosition, destinoPosition);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Centro inicial (Brasil)
    const initialCenter: [number, number] = destinoPosition 
      ? [destinoPosition.latitude, destinoPosition.longitude]
      : tecnicoPosition
        ? [tecnicoPosition.latitude, tecnicoPosition.longitude]
        : [-19.9167, -43.9333]; // BH como fallback

    mapRef.current = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false, // Remover controles para visual mais limpo
      scrollWheelZoom: true,
    });

    // Tile layer CartoDB Positron (estilo minimalista cinza)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(mapRef.current);

    // Adicionar controle de zoom discreto no canto inferior direito
    L.control.zoom({
      position: 'bottomright',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Atualizar marcador do técnico
  useEffect(() => {
    if (!mapRef.current || !tecnicoPosition) return;

    const { latitude, longitude } = tecnicoPosition;

    if (tecnicoMarkerRef.current) {
      // Animar movimento do marcador
      tecnicoMarkerRef.current.setLatLng([latitude, longitude]);
    } else {
      // Criar marcador
      tecnicoMarkerRef.current = L.marker([latitude, longitude], { icon: tecnicoIcon })
        .addTo(mapRef.current);
    }

    // Ajustar view se tiver destino também
    if (destinoPosition) {
      const bounds = L.latLngBounds(
        [tecnicoPosition.latitude, tecnicoPosition.longitude],
        [destinoPosition.latitude, destinoPosition.longitude]
      );
      mapRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    } else {
      mapRef.current.setView([latitude, longitude], 15);
    }
  }, [tecnicoPosition, destinoPosition]);

  // Atualizar marcador do destino
  useEffect(() => {
    if (!mapRef.current || !destinoPosition) return;

    const { latitude, longitude } = destinoPosition;

    if (!destinoMarkerRef.current) {
      destinoMarkerRef.current = L.marker([latitude, longitude], { icon: destinoIcon })
        .addTo(mapRef.current);
    }
  }, [destinoPosition]);

  // Atualizar ETA tooltip no destino
  useEffect(() => {
    if (!destinoMarkerRef.current || !mapRef.current) return;

    // Remover tooltip anterior se existir
    if (etaTooltipRef.current) {
      destinoMarkerRef.current.unbindTooltip();
      etaTooltipRef.current = null;
    }

    if (etaMinutos !== null && etaMinutos !== undefined) {
      const formatETA = (minutos: number) => {
        if (minutos < 60) {
          return `${minutos} min`;
        }
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return mins > 0 ? `${horas}h${mins}min` : `${horas}h`;
      };

      const formatDistance = (metros: number) => {
        if (metros >= 1000) {
          return `${(metros / 1000).toFixed(1)} km`;
        }
        return `${metros} m`;
      };

      const tooltipContent = `
        <div style="
          background: white;
          padding: 8px 14px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-family: system-ui, -apple-system, sans-serif;
          min-width: 80px;
          text-align: center;
        ">
          <div style="
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          ">Chegada</div>
          <div style="
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            line-height: 1.2;
          ">${formatETA(etaMinutos)}</div>
          ${distanciaMetros ? `
            <div style="
              font-size: 11px;
              color: #9ca3af;
              margin-top: 2px;
            ">${formatDistance(distanciaMetros)}</div>
          ` : ''}
        </div>
      `;

      destinoMarkerRef.current.bindTooltip(tooltipContent, {
        permanent: true,
        direction: 'left',
        offset: [-15, -18],
        className: 'eta-tooltip-uber',
      });

      etaTooltipRef.current = destinoMarkerRef.current.getTooltip() || null;
    }
  }, [etaMinutos, distanciaMetros]);

  // Desenhar rota real do OSRM
  useEffect(() => {
    if (!mapRef.current) return;

    // Remover rota anterior
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (route && route.coordinates.length > 0) {
      // Rota cinza escura estilo Uber
      routePolylineRef.current = L.polyline(route.coordinates, {
        color: '#374151', // Cinza escuro
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapRef.current);

      // Trazer a rota para trás dos marcadores
      routePolylineRef.current.bringToBack();
    } else if (tecnicoPosition && destinoPosition) {
      // Fallback: linha reta tracejada se OSRM falhar
      routePolylineRef.current = L.polyline(
        [
          [tecnicoPosition.latitude, tecnicoPosition.longitude],
          [destinoPosition.latitude, destinoPosition.longitude],
        ],
        {
          color: '#9ca3af',
          weight: 3,
          opacity: 0.6,
          dashArray: '8, 8',
        }
      ).addTo(mapRef.current);
    }
  }, [route, tecnicoPosition, destinoPosition]);

  return (
    <>
      <style>{`
        .tecnico-marker-uber,
        .destino-marker-uber {
          background: transparent !important;
          border: none !important;
        }
        .eta-tooltip-uber {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .eta-tooltip-uber::before {
          display: none !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #374151 !important;
          border: none !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f3f4f6 !important;
        }
      `}</style>
      <div className={`relative w-full h-full min-h-[300px] ${className}`}>
        <div 
          ref={mapContainerRef} 
          className="w-full h-full rounded-xl overflow-hidden"
          style={{ zIndex: 0 }}
        />
      </div>
    </>
  );
}
