import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/utils/format';

interface ProductData {
  nome: string;
  quantidade: number;
  receita: number;
  imagem?: string;
}

interface LiveViewProductsProps {
  products: ProductData[];
  loading?: boolean;
  period?: string;
}

export function LiveViewProducts({ products, loading = false, period = '30d' }: LiveViewProductsProps) {
  const maxQuantidade = Math.max(...products.map(p => p.quantidade), 1);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
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
          <CardTitle className="text-base">Produtos Mais Vendidos</CardTitle>
          <Badge variant="outline" className="text-xs">{period}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma venda no período
          </p>
        ) : (
          <div className="space-y-4">
            {products.map((produto, index) => (
              <div key={produto.nome} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-5">
                    {index + 1}.
                  </span>
                  {produto.imagem ? (
                    <img 
                      src={produto.imagem} 
                      alt={produto.nome}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{produto.nome}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{produto.quantidade}x vendidos</span>
                      <span>•</span>
                      <span>{formatCurrency(produto.receita)}</span>
                    </div>
                  </div>
                </div>
                <Progress 
                  value={(produto.quantidade / maxQuantidade) * 100} 
                  className="h-1.5"
                  indicatorClassName="bg-primary"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
