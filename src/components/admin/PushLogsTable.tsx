import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PushLog {
  id: string;
  tipo_evento: string;
  total_destinatarios: number;
  enviados_sucesso: number;
  enviados_falha: number;
  titulo: string;
  created_at: string;
}

interface PushLogsTableProps {
  logs: PushLog[];
}

const tipoEventoLabels: Record<string, string> = {
  'novo_agendamento': 'Novo Agendamento',
  'agendamento_confirmado': 'Confirmado',
  'agendamento_concluido': 'Concluído',
  'pagamento_recebido': 'Pagamento',
  'carrinho_abandonado': 'Carrinho Abandonado',
  'problema_reportado': 'Problema',
  'meta_atingida': 'Meta Atingida'
};

export default function PushLogsTable({ logs }: PushLogsTableProps) {
  const getTaxaEntrega = (sucesso: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((sucesso / total) * 100);
  };

  const getTaxaColor = (taxa: number) => {
    if (taxa >= 95) return 'text-green-600 bg-green-500/10';
    if (taxa >= 80) return 'text-yellow-600 bg-yellow-500/10';
    return 'text-red-600 bg-red-500/10';
  };

  return (
    <Card className="backdrop-blur-md bg-background/60 border border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Logs Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="text-center">Destinatários</TableHead>
                <TableHead className="text-center">Sucesso</TableHead>
                <TableHead className="text-center">Falha</TableHead>
                <TableHead className="text-center">Taxa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum log disponível
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const taxa = getTaxaEntrega(log.enviados_sucesso, log.total_destinatarios);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {tipoEventoLabels[log.tipo_evento] || log.tipo_evento}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.titulo}
                      </TableCell>
                      <TableCell className="text-center">{log.total_destinatarios}</TableCell>
                      <TableCell className="text-center text-green-600">{log.enviados_sucesso}</TableCell>
                      <TableCell className="text-center text-red-600">{log.enviados_falha}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getTaxaColor(taxa)}>
                          {taxa}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
