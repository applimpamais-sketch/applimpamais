import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Route, CalendarIcon, Loader2, MapPin, Clock, Fuel, TrendingDown, AlertCircle, MapPinOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useTecnicos } from '@/hooks/useTecnicos';
import { useOSRMTripOptimizer, OptimizedRoute } from '@/hooks/useOSRMTripOptimizer';
import RouteOptimizerMap from './RouteOptimizerMap';
import RouteComparisonTable from './RouteComparisonTable';
import EditTecnicoLocationModal from './EditTecnicoLocationModal';

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  return `${mins}min`;
}

export default function RouteOptimizerCard() {
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMap, setShowMap] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  
  const { data: tecnicos, isLoading: loadingTecnicos } = useTecnicos();
  const { optimize, reset, result, isLoading, error } = useOSRMTripOptimizer();

  const handleOptimize = async () => {
    if (!selectedTecnico || !selectedDate) return;
    
    try {
      await optimize(selectedTecnico, selectedDate);
      setShowMap(true);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleReset = () => {
    reset();
    setShowMap(false);
  };

  const selectedTecnicoData = tecnicos?.find(t => t.id === selectedTecnico);
  const tecnicoHasLocation = selectedTecnicoData?.latitude && selectedTecnicoData?.longitude;
  const isNoLocationError = error?.includes('não possui localização');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          Otimizador de Rotas
        </CardTitle>
        <CardDescription>
          Calcule a rota mais eficiente para economia de combustível
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seletores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Técnico</label>
            <Select 
              value={selectedTecnico} 
              onValueChange={(value) => {
                setSelectedTecnico(value);
                handleReset();
              }}
              disabled={loadingTecnicos}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um técnico" />
              </SelectTrigger>
              <SelectContent>
                {tecnicos?.map((tecnico) => (
                  <SelectItem key={tecnico.id} value={tecnico.id}>
                    {tecnico.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      handleReset();
                    }
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Botão de ação */}
        <Button 
          onClick={handleOptimize} 
          disabled={!selectedTecnico || !selectedDate || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Route className="mr-2 h-4 w-4" />
              Calcular Rota Otimizada
            </>
          )}
        </Button>

        {/* Erro */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg">
            <div className="flex items-center gap-2">
              {isNoLocationError ? (
                <MapPinOff className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="text-sm">{error}</span>
            </div>
            {isNoLocationError && selectedTecnicoData && (
              <Button
                variant="link"
                size="sm"
                className="mt-2 h-auto p-0 text-primary"
                onClick={() => setLocationModalOpen(true)}
              >
                <MapPin className="mr-1 h-3 w-3" />
                Cadastrar Localização
              </Button>
            )}
          </div>
        )}

        {/* Resultados */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            {/* Cards de comparação */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-destructive/20">
                <div className="text-sm text-muted-foreground mb-1">Rota Original</div>
                <div className="flex items-center gap-1 text-lg font-semibold">
                  <MapPin className="h-4 w-4 text-destructive" />
                  {result.originalDistance.toFixed(1)} km
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(result.originalDuration)}
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">Rota Otimizada</div>
                <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                  <MapPin className="h-4 w-4" />
                  {result.optimizedDistance.toFixed(1)} km
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(result.optimizedDuration)}
                </div>
              </div>
            </div>

            {/* Economia */}
            {result.savings.distanceKm > 0 && (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-700">Economia Estimada</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Distância</div>
                    <div className="font-medium text-green-700">
                      -{result.savings.distanceKm.toFixed(1)} km ({result.savings.distancePercent.toFixed(0)}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tempo</div>
                    <div className="font-medium text-green-700">
                      -{Math.round(result.savings.durationMin)} min
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Fuel className="h-3 w-3" />
                      Combustível
                    </div>
                    <div className="font-medium text-green-700">
                      R$ {result.savings.fuelCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Toggle mapa */}
            <Button 
              variant="outline" 
              onClick={() => setShowMap(!showMap)}
              className="w-full"
            >
              {showMap ? 'Ocultar Mapa' : 'Ver Mapa Comparativo'}
            </Button>

            {/* Mapa */}
            {showMap && selectedTecnicoData && (
              <RouteOptimizerMap 
                result={result}
                tecnicoLocation={{
                  latitude: selectedTecnicoData.latitude!,
                  longitude: selectedTecnicoData.longitude!,
                  nome: selectedTecnicoData.nome_completo
                }}
              />
            )}

            {/* Tabela de comparação */}
            <RouteComparisonTable waypoints={result.waypoints} />
          </div>
        )}
      </CardContent>

      {/* Modal de Localização */}
      {selectedTecnicoData && (
        <EditTecnicoLocationModal
          open={locationModalOpen}
          onOpenChange={setLocationModalOpen}
          tecnico={selectedTecnicoData}
        />
      )}
    </Card>
  );
}
