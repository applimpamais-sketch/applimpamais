import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RankingItem {
  label: string;
  value: number;
  percentage?: number;
  icon?: React.ReactNode;
}

interface TopRankingCardProps {
  title: string;
  items: RankingItem[];
  type: 'bairros' | 'servicos';
  tooltip?: string;
}

const getMedalEmoji = (index: number) => {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return null;
};

export default function TopRankingCard({ title, items, type, tooltip }: TopRankingCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {title}
          </CardTitle>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.label} className="flex items-center gap-3">
              {/* Medalha ou número */}
              <div className="w-6 flex-shrink-0 text-center">
                {getMedalEmoji(index) ? (
                  <span className="text-lg">{getMedalEmoji(index)}</span>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                )}
              </div>
              
              {type === 'servicos' && item.icon && (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
              )}
              
              {/* Nome/Label */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.label}
                </p>
                {type === 'servicos' && (
                  <p className="text-xs text-muted-foreground">
                    {item.value} {item.value === 1 ? 'agendado' : 'agendados'}
                  </p>
                )}
              </div>
              
              {type === 'bairros' && item.percentage !== undefined && (
                <>
                  {/* Percentual */}
                  <span className="text-sm font-semibold text-primary">
                    {item.percentage}%
                  </span>
                  
                  {/* Barra de progresso */}
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
