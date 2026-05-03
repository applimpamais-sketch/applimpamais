import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface LocationData {
  cidade: string;
  estado: string;
  count: number;
  percentual: number;
}

interface LiveViewLocationsProps {
  locations: LocationData[];
  loading?: boolean;
  period?: string;
}

const progressColors = [
  'bg-blue-600',
  'bg-purple-600', 
  'bg-green-600',
  'bg-orange-600',
  'bg-pink-600'
];

export function LiveViewLocations({ locations, loading = false, period = '30d' }: LiveViewLocationsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Principais Locais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Principais Locais
          </CardTitle>
          <Badge variant="outline" className="text-xs">{period}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {locations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum dado de localização no período
          </p>
        ) : (
          <div className="space-y-4">
            {locations.map((local, index) => (
              <div key={`${local.cidade}-${local.estado}`}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">
                    {local.cidade} • {local.estado}
                  </span>
                  <span className="text-muted-foreground">
                    {local.percentual.toFixed(0)}% ({local.count})
                  </span>
                </div>
                <Progress 
                  value={local.percentual} 
                  className="h-2"
                  indicatorClassName={progressColors[index % progressColors.length]}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
