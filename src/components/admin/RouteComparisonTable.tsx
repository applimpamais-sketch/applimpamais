import { AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Waypoint } from '@/hooks/useOSRMTripOptimizer';

interface RouteComparisonTableProps {
  waypoints: Waypoint[];
}

export default function RouteComparisonTable({ waypoints }: RouteComparisonTableProps) {
  // Ordenar por ordem original para exibição
  const sortedWaypoints = [...waypoints].sort((a, b) => a.ordemOriginal - b.ordemOriginal);

  // Verificar conflitos de horário
  const hasTimeConflict = (waypoint: Waypoint): boolean => {
    if (!waypoint.horario || !waypoint.ordemOtimizada) return false;
    
    // Se a ordem otimizada é muito diferente da original e tem horário específico
    const orderDiff = Math.abs(waypoint.ordemOtimizada - waypoint.ordemOriginal);
    return orderDiff >= 2;
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Comparação de Ordem de Visitas</h4>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Original</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden sm:table-cell">Bairro</TableHead>
              <TableHead className="hidden md:table-cell">Horário</TableHead>
              <TableHead className="w-[100px] text-center">Otimizada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedWaypoints.map((waypoint) => {
              const conflict = hasTimeConflict(waypoint);
              const improved = waypoint.ordemOtimizada! < waypoint.ordemOriginal;
              const delayed = waypoint.ordemOtimizada! > waypoint.ordemOriginal;
              
              return (
                <TableRow key={waypoint.id}>
                  <TableCell className="font-medium">
                    {waypoint.ordemOriginal}º
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[150px]">{waypoint.nome}</span>
                      {conflict && (
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {waypoint.bairro || '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {waypoint.horario || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={improved ? 'default' : delayed ? 'secondary' : 'outline'}
                      className={improved ? 'bg-green-600' : ''}
                    >
                      {waypoint.ordemOtimizada}º
                      {improved && ' ↑'}
                      {delayed && ' ↓'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Aviso sobre conflitos */}
      {sortedWaypoints.some(hasTimeConflict) && (
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 text-amber-700 rounded-lg text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Atenção:</strong> Alguns agendamentos podem ter conflito com a janela de horário agendada. 
            Verifique antes de alterar a ordem de visitas.
          </div>
        </div>
      )}
    </div>
  );
}
