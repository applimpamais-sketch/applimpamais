import { Button } from '@/components/ui/button';
import { Zap, Loader2 } from 'lucide-react';
import { WhatsAppStatus } from '@/hooks/useWhatsAppStatus';
import { Badge } from '@/components/ui/badge';

interface WhatsAppConnectionTestProps {
  onTest: () => Promise<any>;
  loading: boolean;
  status: WhatsAppStatus;
}

export default function WhatsAppConnectionTest({ 
  onTest, 
  loading, 
  status 
}: WhatsAppConnectionTestProps) {
  const getStatusBadge = () => {
    if (!status.status) {
      return null;
    }

    if (status.status === 'authenticated' && status.substatus === 'connected') {
      return (
        <Badge className="bg-green-500 text-white">
          ✅ Online
        </Badge>
      );
    }
    
    if (status.status === 'authenticated') {
      return (
        <Badge className="bg-yellow-500 text-white">
          ⚠️ Autenticado {status.substatus ? `(${status.substatus})` : ''}
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive">
        ❌ Não Autenticado
      </Badge>
    );
  };

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">Teste de Conexão</h4>
          {getStatusBadge()}
        </div>
        <p className="text-xs text-muted-foreground">
          Verifica se o UltraMsg está configurado e respondendo
        </p>
      </div>
      
      <Button 
        onClick={onTest}
        disabled={loading}
        size="sm"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Testando...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" />
            Testar Agora
          </>
        )}
      </Button>
    </div>
  );
}
