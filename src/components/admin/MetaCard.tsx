import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetaCardProps {
  meta: {
    id: string;
    mes_referencia: string;
    valor_meta: number;
    valor_realizado: number;
    percentual_atingido: number;
    status: string;
    observacoes?: string;
  };
  onEdit: (meta: any) => void;
  onDelete: (id: string) => void;
}

export default function MetaCard({ meta, onEdit, onDelete }: MetaCardProps) {
  const percentual = ((meta.valor_realizado / meta.valor_meta) * 100).toFixed(1);
  const atingida = Number(percentual) >= 100;
  const faltam = meta.valor_meta - meta.valor_realizado;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          {format(new Date(meta.mes_referencia), 'MMMM yyyy', { locale: ptBR })}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(meta)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(meta.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className={atingida ? 'text-success' : 'text-foreground'}>
              {percentual}%
            </span>
          </div>
          <Progress value={Number(percentual)} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Meta</p>
            <p className="text-lg font-semibold">
              R$ {meta.valor_meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Realizado</p>
            <p className="text-lg font-semibold">
              R$ {meta.valor_realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {!atingida && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              {faltam > 0 ? (
                <TrendingUp className="h-4 w-4 text-warning" />
              ) : (
                <TrendingDown className="h-4 w-4 text-success" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">
                  {faltam > 0 ? 'Faltam' : 'Superou em'}
                </p>
                <p className="text-sm font-medium">
                  R$ {Math.abs(faltam).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}

        {atingida && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-success">✅ Meta Atingida!</p>
          </div>
        )}

        {meta.observacoes && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            {meta.observacoes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
