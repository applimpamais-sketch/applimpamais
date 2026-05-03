import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TrackingSession } from '@/hooks/useTrackingHistory';
import { calcularPontualidade } from '@/hooks/useTrackingHistory';

interface TrackingSessionsTableProps {
  sessions: TrackingSession[];
  isLoading: boolean;
  tecnicoFilter: string;
  onTecnicoFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  pontualidadeFilter: string;
  onPontualidadeFilterChange: (value: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  em_rota: 'Em Rota',
  chegou: 'Chegou',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  em_rota: 'bg-blue-500/10 text-blue-700 border-blue-200',
  chegou: 'bg-green-500/10 text-green-700 border-green-200',
  concluido: 'bg-gray-500/10 text-gray-700 border-gray-200',
  cancelado: 'bg-red-500/10 text-red-700 border-red-200',
};

const PONTUALIDADE_CONFIG = {
  pontual: { label: 'Pontual', className: 'bg-green-500/10 text-green-700 border-green-200' },
  toleravel: { label: 'Tolerável', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' },
  atrasado: { label: 'Atrasado', className: 'bg-red-500/10 text-red-700 border-red-200' },
  sem_dados: { label: '-', className: 'bg-gray-500/10 text-gray-500 border-gray-200' },
};

export default function TrackingSessionsTable({
  sessions,
  isLoading,
  tecnicoFilter,
  onTecnicoFilterChange,
  statusFilter,
  onStatusFilterChange,
  pontualidadeFilter,
  onPontualidadeFilterChange,
}: TrackingSessionsTableProps) {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Get unique technicians for filter
  const tecnicos = Array.from(
    new Map(sessions.map(s => [s.tecnico_id, s.tecnico_nome])).entries()
  ).map(([id, nome]) => ({ id, nome }));

  // Filter sessions
  let filtered = sessions;
  if (statusFilter && statusFilter !== 'todos') {
    filtered = filtered.filter(s => s.status === statusFilter);
  }
  
  // Filter by punctuality
  if (pontualidadeFilter && pontualidadeFilter !== 'todos') {
    filtered = filtered.filter(s => {
      const pontualidade = calcularPontualidade(s.chegou_em, s.horario, s.data_agendamento);
      return pontualidade === pontualidadeFilter;
    });
  }

  // Paginate
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedSessions = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const calcularTempoTrajeto = (iniciado: string, chegou: string | null): string => {
    if (!chegou) return '-';
    const inicio = new Date(iniciado).getTime();
    const fim = new Date(chegou).getTime();
    const minutos = Math.round((fim - inicio) / 60000);
    return `${minutos} min`;
  };

  if (isLoading) {
    return (
      <div className="h-64 bg-muted/50 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={tecnicoFilter || 'todos'} onValueChange={(v) => onTecnicoFilterChange(v === 'todos' ? '' : v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por técnico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os técnicos</SelectItem>
            {tecnicos.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter || 'todos'} onValueChange={(v) => onStatusFilterChange(v === 'todos' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="em_rota">Em Rota</SelectItem>
            <SelectItem value="chegou">Chegou</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={pontualidadeFilter || 'todos'} onValueChange={(v) => onPontualidadeFilterChange(v === 'todos' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar pontualidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas pontualidades</SelectItem>
            <SelectItem value="pontual">Pontual</SelectItem>
            <SelectItem value="toleravel">Tolerável</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Técnico</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Bairro</TableHead>
              <TableHead>Iniciado</TableHead>
              <TableHead>Chegou</TableHead>
              <TableHead>Tempo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pontualidade</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhuma sessão de rastreamento encontrada
                </TableCell>
              </TableRow>
            ) : (
              paginatedSessions.map((session) => {
                const pontualidade = calcularPontualidade(
                  session.chegou_em,
                  session.horario,
                  session.data_agendamento
                );
                const pontConfig = PONTUALIDADE_CONFIG[pontualidade];

                return (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.tecnico_nome}</TableCell>
                    <TableCell>{session.nome_cliente || '-'}</TableCell>
                    <TableCell>{session.bairro || '-'}</TableCell>
                    <TableCell>
                      {format(new Date(session.iniciado_em), "dd/MM HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {session.chegou_em 
                        ? format(new Date(session.chegou_em), "HH:mm", { locale: ptBR })
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {calcularTempoTrajeto(session.iniciado_em, session.chegou_em)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[session.status]}>
                        {STATUS_LABELS[session.status] || session.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={pontConfig.className}>
                        {pontConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/admin/agendamentos?id=${session.agendamento_id}`, '_blank')}
                        title="Ver agendamento"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {page * pageSize + 1} a {Math.min((page + 1) * pageSize, filtered.length)} de {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
