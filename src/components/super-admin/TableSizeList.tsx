import { Database } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { TableInfo } from '@/hooks/useDatabaseMetrics';

interface TableSizeListProps {
  tables: TableInfo[];
  totalRows: number;
}

export function TableSizeList({ tables, totalRows }: TableSizeListProps) {
  const maxRows = tables.length > 0 ? Math.max(...tables.map(t => t.row_count)) : 1;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Maiores Tabelas</h3>
      </div>
      
      <div className="space-y-3">
        {tables.map((table, index) => {
          const rowPercent = (table.row_count / maxRows) * 100;
          
          return (
            <div key={table.table_name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <span className="text-muted-foreground w-5">{index + 1}.</span>
                  {table.table_name}
                </span>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{table.row_count.toLocaleString('pt-BR')} linhas</span>
                  <span className="w-20 text-right">{table.size_mb.toFixed(2)} MB</span>
                </div>
              </div>
              <Progress 
                value={rowPercent} 
                className="h-2"
                indicatorClassName="bg-primary/70"
              />
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
        <span className="text-muted-foreground">Total de registros</span>
        <span className="font-semibold text-foreground">
          {totalRows.toLocaleString('pt-BR')}
        </span>
      </div>
    </div>
  );
}
