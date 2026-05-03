import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTenantModules, useModulosCatalogo } from '@/hooks/useTenantModules';

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function PerfilModulosCard() {
  const { data: catalogo, isLoading: isLoadingCatalogo } = useModulosCatalogo();
  const { modulos, isLoading: isLoadingModulos } = useTenantModules();

  const isLoading = isLoadingCatalogo || isLoadingModulos;
  const modulosAtivosMap = new Map((modulos || []).map((m) => [m.modulo_id, m]));
  const totalValor = (modulos || []).reduce((sum, m) => {
    const preco = m.preco_negociado ?? m.modulo?.preco_base ?? 0;
    return sum + preco;
  }, 0);

  const totalAtivos = modulos?.length || 0;
  const totalCatalogo = catalogo?.length || 0;

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Modulos Contratados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Modulos Contratados
          </CardTitle>
          <Badge variant="secondary">
            {totalAtivos}/{totalCatalogo}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {catalogo?.map((modulo) => {
            const moduloAtivo = modulosAtivosMap.get(modulo.id);
            const isAtivo = !!moduloAtivo;
            const preco = moduloAtivo?.preco_negociado ?? modulo.preco_base;

            return (
              <div
                key={modulo.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isAtivo ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/30 border-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isAtivo ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className={`font-medium ${!isAtivo ? 'text-muted-foreground' : ''}`}>{modulo.nome}</p>
                    {modulo.descricao && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{modulo.descricao}</p>
                    )}
                  </div>
                </div>
                <span className={`font-medium ${isAtivo ? 'text-primary' : 'text-muted-foreground'}`}>
                  {isAtivo ? formatCurrency(preco) : '-'}
                </span>
              </div>
            );
          })}
        </div>

        {totalAtivos > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold">Total Mensal</span>
              <span className="font-bold text-lg text-primary">{formatCurrency(totalValor)}</span>
            </div>
          </>
        )}

        {totalAtivos === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">Nenhum modulo contratado.</p>
        )}
      </CardContent>
    </Card>
  );
}
