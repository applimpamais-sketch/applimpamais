import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PixelEvent } from '@/hooks/usePixelStats';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/utils/format';

interface PixelEventsTableProps {
  events: PixelEvent[];
}

const eventTypeColors: Record<string, string> = {
  PageView: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  ViewContent: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  AddToCart: 'bg-green-500/10 text-green-600 border-green-500/20',
  InitiateCheckout: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  Purchase: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const eventTypeLabels: Record<string, string> = {
  PageView: 'Visualização',
  ViewContent: 'Visualização Produto',
  AddToCart: 'Add ao Carrinho',
  InitiateCheckout: 'Checkout Iniciado',
  Purchase: 'Compra',
};

export default function PixelEventsTable({ events }: PixelEventsTableProps) {
  return (
    <Card className="backdrop-blur-md bg-background/60 border border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Eventos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Evento</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Quando</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.slice(0, 10).map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Badge variant="outline" className={eventTypeColors[event.type]}>
                      {eventTypeLabels[event.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {event.product || '-'}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {event.value ? formatCurrency(event.value) : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
