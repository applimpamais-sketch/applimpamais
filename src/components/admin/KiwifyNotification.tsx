import { toast } from 'sonner';
import { X } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { PLATFORM_NAME } from '@/lib/constants';

export function showKiwifyToast(agendamento: any) {
  const timeAgo = 'há 1m';
  
  toast.custom(
    (t) => (
      <div className="bg-background shadow-lg rounded-lg p-4 flex items-start gap-3 min-w-[320px] max-w-[420px] border border-border animate-in slide-in-from-top-2">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img 
            src="/icon-512x512.png" 
            alt={PLATFORM_NAME}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
          />
        </div>
        
        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground">
              Novo Agendamento!
            </p>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Valor do pedido: <span className="font-semibold text-primary">
              {formatCurrency(agendamento.valor_total || 0)}
            </span>
          </p>
        </div>
        
        {/* Botão fechar */}
        <button
          onClick={() => toast.dismiss(t)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ),
    {
      duration: 5000,
      position: 'top-right'
    }
  );
}
