import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, MapPin, Phone, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ServicoDetalheModal from './ServicoDetalheModal';

interface Servico {
  id: string;
  nome_cliente: string;
  telefone: string;
  endereco: string;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
  data_agendamento: string;
  horario: string | null;
  status: string;
  valor_total: number;
  itens_carrinho: any[];
  latitude?: number | null;
  longitude?: number | null;
  genero_cliente?: string | null;
  cupom_codigo?: string | null;
  cupom_desconto_percentual?: number | null;
  valor_desconto?: number | null;
  valor_frete?: number | null;
  forma_pagamento?: string | null;
  pago_em?: string | null;
  created_at?: string;
}

interface TecnicoCalendarioProps {
  servicos: Servico[];
  onServicoClick?: (servico: Servico) => void;
  onUpdate?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmado': return 'bg-green-500';
    case 'pendente': return 'bg-yellow-500';
    case 'em_andamento': return 'bg-blue-500';
    case 'concluido': return 'bg-emerald-600';
    case 'cancelado': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'confirmado': return 'default';
    case 'concluido': return 'default';
    case 'pendente': return 'secondary';
    case 'cancelado': return 'destructive';
    default: return 'outline';
  }
};

export default function TecnicoCalendario({ servicos, onServicoClick, onUpdate }: TecnicoCalendarioProps) {
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'dia' | 'semana'>('semana');
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Agrupar serviços por data
  const servicosPorData = servicos.reduce((acc, servico) => {
    const data = servico.data_agendamento;
    if (!acc[data]) acc[data] = [];
    acc[data].push(servico);
    return acc;
  }, {} as Record<string, Servico[]>);

  // Dias da semana atual
  const weekStart = startOfWeek(selectedDate, { locale: ptBR });
  const weekEnd = endOfWeek(selectedDate, { locale: ptBR });
  const diasSemana = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Serviços do dia selecionado
  const servicosDoDia = servicos.filter(s => 
    isSameDay(new Date(s.data_agendamento + 'T00:00:00'), selectedDate)
  ).sort((a, b) => {
    if (!a.horario) return 1;
    if (!b.horario) return -1;
    return a.horario.localeCompare(b.horario);
  });

  // Scroll para o dia atual no mobile
  useEffect(() => {
    if (isMobile && scrollContainerRef.current) {
      const today = new Date();
      const todayIndex = diasSemana.findIndex(d => isSameDay(d, today));
      if (todayIndex >= 0) {
        const cardWidth = 110; // min-w-[100px] + gap
        scrollContainerRef.current.scrollLeft = Math.max(0, todayIndex * cardWidth - 50);
      }
    }
  }, [isMobile, diasSemana]);

  const navegarSemana = (direcao: 'anterior' | 'proxima') => {
    const dias = direcao === 'anterior' ? -7 : 7;
    setSelectedDate(new Date(selectedDate.getTime() + dias * 24 * 60 * 60 * 1000));
  };

  const handleServicoClick = (servico: Servico) => {
    setSelectedServico(servico);
    setModalOpen(true);
    onServicoClick?.(servico);
  };

  const handleModalUpdate = () => {
    onUpdate?.();
  };

  return (
    <>
      <div className="space-y-4">
        {/* Controles */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navegarSemana('anterior')}
              className="h-10 w-10 md:h-9 md:w-9 shrink-0"
            >
              <ChevronLeft className="h-5 w-5 md:h-4 md:w-4" />
            </Button>
            <span className="font-medium text-sm md:text-base text-center min-w-0">
              {format(weekStart, "dd MMM", { locale: ptBR })} - {format(weekEnd, "dd MMM", { locale: ptBR })}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navegarSemana('proxima')}
              className="h-10 w-10 md:h-9 md:w-9 shrink-0"
            >
              <ChevronRight className="h-5 w-5 md:h-4 md:w-4" />
            </Button>
          </div>

          <div className="flex gap-1 shrink-0">
            <Button 
              variant={viewMode === 'semana' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('semana')}
              className="h-9 px-3"
            >
              Semana
            </Button>
            <Button 
              variant={viewMode === 'dia' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('dia')}
              className="h-9 px-3"
            >
              Dia
            </Button>
          </div>
        </div>

        {viewMode === 'semana' ? (
          /* Visualização Semanal - Mobile Horizontal Scroll */
          isMobile ? (
            <div 
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              {diasSemana.map((dia) => {
                const servicosDia = servicosPorData[format(dia, 'yyyy-MM-dd')] || [];
                const isHoje = isSameDay(dia, new Date());
                const isSelecionado = isSameDay(dia, selectedDate);

                return (
                  <div
                    key={dia.toISOString()}
                    className={cn(
                      "min-w-[100px] flex-shrink-0 rounded-xl border-2 p-3 cursor-pointer transition-all snap-center",
                      isHoje && "border-primary shadow-md",
                      !isHoje && "border-border",
                      isSelecionado && "bg-primary/5",
                      "hover:bg-muted/50 active:scale-95"
                    )}
                    onClick={() => {
                      setSelectedDate(dia);
                      if (servicosDia.length > 0) setViewMode('dia');
                    }}
                  >
                    <div className="text-center mb-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        {format(dia, 'EEE', { locale: ptBR })}
                      </p>
                      <p className={cn(
                        "text-2xl font-bold mt-1",
                        isHoje && "text-primary"
                      )}>
                        {format(dia, 'd')}
                      </p>
                    </div>

                    {servicosDia.length > 0 ? (
                      <div className="space-y-1.5">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "w-full justify-center text-xs font-medium",
                            servicosDia.length > 0 && "bg-primary/10 text-primary"
                          )}
                        >
                          {servicosDia.length} serviço{servicosDia.length > 1 ? 's' : ''}
                        </Badge>
                        {servicosDia.slice(0, 2).map((servico) => (
                          <div
                            key={servico.id}
                            className={cn(
                              "text-[10px] p-1.5 rounded text-white text-center truncate",
                              getStatusColor(servico.status)
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleServicoClick(servico);
                            }}
                          >
                            {servico.horario || '—'}
                          </div>
                        ))}
                        {servicosDia.length > 2 && (
                          <p className="text-[10px] text-muted-foreground text-center">
                            +{servicosDia.length - 2}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground text-center">
                        Livre
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Desktop Grid */
            <div className="grid grid-cols-7 gap-2">
              {diasSemana.map((dia) => {
                const servicosDia = servicosPorData[format(dia, 'yyyy-MM-dd')] || [];
                const isHoje = isSameDay(dia, new Date());
                const isSelecionado = isSameDay(dia, selectedDate);

                return (
                  <div
                    key={dia.toISOString()}
                    className={cn(
                      "min-h-[120px] rounded-lg border p-2 cursor-pointer transition-colors",
                      isHoje && "border-primary",
                      isSelecionado && "bg-muted",
                      "hover:bg-muted/50"
                    )}
                    onClick={() => {
                      setSelectedDate(dia);
                      if (servicosDia.length > 0) setViewMode('dia');
                    }}
                  >
                    <div className="text-center mb-2">
                      <p className="text-xs text-muted-foreground">
                        {format(dia, 'EEE', { locale: ptBR })}
                      </p>
                      <p className={cn(
                        "text-lg font-bold",
                        isHoje && "text-primary"
                      )}>
                        {format(dia, 'd')}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {servicosDia.slice(0, 3).map((servico) => (
                        <div
                          key={servico.id}
                          className={cn(
                            "text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80",
                            getStatusColor(servico.status)
                          )}
                          title={`${servico.horario || ''} - ${servico.nome_cliente}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServicoClick(servico);
                          }}
                        >
                          {servico.horario && <span className="font-medium">{servico.horario}</span>}
                          <span className="ml-1 truncate">{servico.nome_cliente.split(' ')[0]}</span>
                        </div>
                      ))}
                      {servicosDia.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{servicosDia.length - 3} mais
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Visualização Diária */
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>

            {servicosDoDia.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum serviço agendado para este dia
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {servicosDoDia.map((servico) => (
                  <Card 
                    key={servico.id}
                    className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                    onClick={() => handleServicoClick(servico)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {servico.horario && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {servico.horario}
                              </Badge>
                            )}
                            <Badge variant={getStatusBadgeVariant(servico.status)}>
                              {servico.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium truncate">{servico.nome_cliente}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{servico.telefone}</span>
                          </div>

                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{servico.endereco}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-bold text-lg">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                              .format(servico.valor_total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Array.isArray(servico.itens_carrinho) 
                              ? `${servico.itens_carrinho.length} itens`
                              : 'Serviço'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full h-12" 
              onClick={() => setViewMode('semana')}
            >
              Voltar para Semana
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <ServicoDetalheModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        servico={selectedServico}
        onUpdate={handleModalUpdate}
      />
    </>
  );
}
