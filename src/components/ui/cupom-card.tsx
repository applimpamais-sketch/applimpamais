import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Users, Clock, Zap } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CupomCardProps {
  codigo: string;
  desconto: number;
  validade?: string;
  usoMaximo?: number;
  usoAtual?: number;
  onCopiar: () => void;
}

const CupomCard = ({ 
  codigo, 
  desconto, 
  validade, 
  usoMaximo, 
  usoAtual = 0,
  onCopiar 
}: CupomCardProps) => {
  // Calcular urgência
  const diasRestantes = validade ? differenceInDays(new Date(validade), new Date()) : null;
  const percentualUsado = usoMaximo ? (usoAtual / usoMaximo) * 100 : 0;
  const usosRestantes = usoMaximo ? usoMaximo - usoAtual : null;
  
  // Badges de urgência dinâmicos
  const getBadgeUrgencia = () => {
    if (diasRestantes !== null && diasRestantes <= 3) {
      return { text: 'Últimas Horas!', color: 'bg-gradient-to-r from-red-500 to-orange-500' };
    }
    if (percentualUsado >= 80) {
      return { text: 'Restam Poucos!', color: 'bg-gradient-to-r from-orange-500 to-yellow-500' };
    }
    if (diasRestantes !== null && diasRestantes <= 7) {
      return { text: 'Expira em breve', color: 'bg-gradient-to-r from-yellow-500 to-amber-500' };
    }
    return null;
  };

  const badgeUrgencia = getBadgeUrgencia();
  
  // Cor da progress bar
  const getProgressColor = () => {
    if (percentualUsado >= 80) return 'bg-gradient-to-r from-red-500 to-orange-500';
    if (percentualUsado >= 50) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
    return 'bg-gradient-to-r from-green-500 to-green-600';
  };

  return (
    <TooltipProvider>
      <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badge de urgência */}
        {badgeUrgencia && (
          <div className="absolute top-4 left-4 z-10 animate-fade-in">
            <Badge className={`${badgeUrgencia.color} text-white text-xs font-bold px-3 py-1 shadow-lg border-0 animate-pulse`}>
              <Zap className="w-3 h-3 mr-1 inline" />
              {badgeUrgencia.text}
            </Badge>
          </div>
        )}
        
        {/* Badge de desconto com gradient e shimmer */}
        <div className="absolute top-4 right-4 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
            <Badge className="relative bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-2xl font-bold px-5 py-2.5 shadow-xl border-0 overflow-hidden">
              <span className="relative z-10">{desconto}% OFF</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </Badge>
          </div>
        </div>
      
      {/* Conteúdo */}
      <CardContent className="p-6 space-y-4 relative z-10">
        {/* Código do cupom com tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-muted/50 border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-4 mt-12 transition-all cursor-help">
              <p className="text-xs text-muted-foreground mb-1">Código do cupom</p>
              <p className="text-xl font-mono font-bold text-foreground tracking-[0.25em]">
                {codigo.slice(0, 3)}•••
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="font-mono text-lg font-bold tracking-wider">
            {codigo}
          </TooltipContent>
        </Tooltip>
        
        {/* Descrição */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">
            Válido para serviços de limpeza residencial
          </p>
          
          <div className="space-y-2">
            {validade && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>
                  Válido até {format(new Date(validade), 'dd/MM/yyyy', { locale: ptBR })}
                  {diasRestantes !== null && diasRestantes <= 7 && (
                    <span className="ml-1 text-orange-600 font-semibold">
                      ({diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'})
                    </span>
                  )}
                </span>
              </div>
            )}
            
            {usoMaximo && usosRestantes !== null && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{usosRestantes} usos restantes</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {Math.round(100 - percentualUsado)}%
                  </span>
                </div>
                {/* Progress bar visual */}
                <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor()} transition-all duration-500 relative overflow-hidden`}
                    style={{ width: `${100 - percentualUsado}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Botão CTA estilo cupom destacável - melhorado */}
        <button 
          onClick={onCopiar}
          className="w-full h-16 flex items-stretch rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:scale-[1.02]"
          aria-label={`Ver cupom ${codigo} com ${desconto}% de desconto`}
        >
          {/* Corpo do cupom com seta e gradient animado */}
          <div 
            className="flex-1 bg-gradient-to-r from-[#00A859] to-[#00C46A] group-hover:from-[#008F4D] group-hover:to-[#00A859] flex items-center justify-center text-white font-bold text-base transition-all duration-300 relative overflow-hidden"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)'
            }}
          >
            <span className="pr-4 relative z-10 group-hover:scale-105 transition-transform">Ver Cupom</span>
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>
          
          {/* Stub tracejado com código parcial */}
          <div className="w-16 sm:w-20 bg-muted/90 border-2 border-l-0 border-dashed border-border flex items-center justify-center group-hover:bg-background/80 group-hover:border-primary/30 transition-all">
            <span className="text-xs sm:text-sm font-mono font-bold text-foreground tracking-[0.2em]">
              {codigo.slice(0, 3)}
            </span>
          </div>
        </button>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};

export default CupomCard;
