import React from 'react';
import { MessageSquare, ShoppingCart, Bell, MapPin, Star } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Etapa = 'checkout' | 'carrinho' | 'lembrete' | 'tracking' | 'pos-venda';

interface JourneyRow {
  etapa: Etapa;
  etapaLabel: string;
  gatilho: string;
  mensagem: string;
  destinatario: string;
}

const etapaConfig: Record<Etapa, { color: string; icon: React.ElementType }> = {
  checkout: { color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30', icon: ShoppingCart },
  carrinho: { color: 'bg-amber-500/15 text-amber-700 border-amber-500/30', icon: ShoppingCart },
  lembrete: { color: 'bg-blue-500/15 text-blue-700 border-blue-500/30', icon: Bell },
  tracking: { color: 'bg-violet-500/15 text-violet-700 border-violet-500/30', icon: MapPin },
  'pos-venda': { color: 'bg-orange-500/15 text-orange-700 border-orange-500/30', icon: Star },
};

const journeyData: JourneyRow[] = [
  { etapa: 'checkout', etapaLabel: 'Checkout Online', gatilho: 'Agendamento criado (site)', mensagem: 'Confirmação + resumo do pedido', destinatario: 'Cliente + Staff' },
  { etapa: 'carrinho', etapaLabel: 'Carrinho Aband.', gatilho: '2 min sem finalizar', mensagem: 'Recuperação padrão', destinatario: 'Cliente' },
  { etapa: 'carrinho', etapaLabel: 'Carrinho Aband.', gatilho: '30 min sem finalizar', mensagem: 'Cupom de desconto', destinatario: 'Cliente' },
  { etapa: 'carrinho', etapaLabel: 'Carrinho Aband.', gatilho: '24h sem finalizar', mensagem: 'Oferta final', destinatario: 'Cliente' },
  { etapa: 'lembrete', etapaLabel: 'Lembrete', gatilho: '1 dia antes do serviço', mensagem: 'Lembrete de agendamento', destinatario: 'Cliente' },
  { etapa: 'lembrete', etapaLabel: 'Lembrete', gatilho: 'No dia do serviço', mensagem: 'Confirmação do dia', destinatario: 'Cliente' },
  { etapa: 'tracking', etapaLabel: 'Tracking', gatilho: 'Técnico inicia rota', mensagem: 'Link de rastreamento ao vivo', destinatario: 'Cliente' },
  { etapa: 'tracking', etapaLabel: 'Tracking (Locação)', gatilho: '3s após link de tracking', mensagem: 'Seleção forma de pagamento', destinatario: 'Cliente' },
  { etapa: 'pos-venda', etapaLabel: 'Pós-Venda', gatilho: '24h após conclusão', mensagem: 'Pesquisa de satisfação (NPS)', destinatario: 'Cliente' },
  { etapa: 'pos-venda', etapaLabel: 'Pós-Venda', gatilho: 'Nota ≥ threshold', mensagem: 'Pedido de avaliação pública', destinatario: 'Cliente' },
  { etapa: 'pos-venda', etapaLabel: 'Pós-Venda', gatilho: 'Nota < threshold', mensagem: 'Coleta de feedback privado', destinatario: 'Cliente' },
];

export default function WhatsAppJourneyTable() {
  return (
    <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          Jornada WhatsApp Automática
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-4 px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Etapa</TableHead>
              <TableHead className="text-xs">Gatilho</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Mensagem</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Destinatário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journeyData.map((row, i) => {
              const config = etapaConfig[row.etapa];
              return (
                <TableRow key={i} className="text-xs">
                  <TableCell className="py-2 px-3">
                    <Badge className={`${config.color} text-[10px] font-medium whitespace-nowrap`}>
                      {row.etapaLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-muted-foreground">{row.gatilho}</TableCell>
                  <TableCell className="py-2 px-3 hidden sm:table-cell">{row.mensagem}</TableCell>
                  <TableCell className="py-2 px-3 hidden md:table-cell text-muted-foreground">{row.destinatario}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
