import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function SessionMonitor() {
  const { session } = useAuth();
  const [status, setStatus] = useState<'active' | 'expiring' | 'expired'>('active');

  useEffect(() => {
    if (!session) {
      setStatus('expired');
      return;
    }

    const checkExpiry = () => {
      const expiresAt = session.expires_at;
      if (!expiresAt) return;

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 0) {
        setStatus('expired');
      } else if (timeUntilExpiry < 300) { // Menos de 5 minutos
        setStatus('expiring');
      } else {
        setStatus('active');
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 30000); // Verifica a cada 30s

    return () => clearInterval(interval);
  }, [session]);

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-500',
          text: 'Sessão ativa',
          variant: 'default' as const
        };
      case 'expiring':
        return {
          color: 'bg-yellow-500',
          text: 'Sessão expirando em breve',
          variant: 'secondary' as const
        };
      case 'expired':
        return {
          color: 'bg-red-500',
          text: 'Sessão expirada',
          variant: 'destructive' as const
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={config.variant} className="gap-2 cursor-help">
          <span className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
          <span className="text-xs">{config.text}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">
          {session?.expires_at 
            ? `Expira em: ${new Date(session.expires_at * 1000).toLocaleString('pt-BR')}`
            : 'Sessão não detectada'
          }
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
