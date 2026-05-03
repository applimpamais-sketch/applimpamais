import { useState } from 'react';
import { MessageCircle, ExternalLink, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { WHATSAPP_BOT } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ComandosWhatsAppCardProps {
  tipo: 'parceiro' | 'tecnico';
}

const comandosParceiro = [
  { comando: '@saldo', descricao: 'Consultar seu saldo disponível' },
  { comando: '@link', descricao: 'Ver seu link de indicação' },
  { comando: '@conversoes', descricao: 'Ver suas últimas vendas' },
  { comando: '@qrcode', descricao: 'Ver seu QR Code' },
  { comando: '@ajuda', descricao: 'Lista de comandos' },
];

const comandosTecnico = [
  { comando: '@agenda', descricao: 'Ver serviços de hoje' },
  { comando: '@proximo', descricao: 'Ver o próximo serviço' },
  { comando: '@concluir [código]', descricao: 'Finalizar um serviço' },
  { comando: '@ajuda', descricao: 'Lista de comandos' },
];

export default function ComandosWhatsAppCard({ tipo }: ComandosWhatsAppCardProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  
  const comandos = tipo === 'parceiro' ? comandosParceiro : comandosTecnico;
  const titulo = tipo === 'parceiro' 
    ? 'Acompanhe suas indicações pelo WhatsApp!' 
    : 'Gerencie seus serviços pelo WhatsApp!';
  const emoji = tipo === 'parceiro' ? '🤝' : '🔧';
  const dica = tipo === 'tecnico' 
    ? 'Use o código do serviço (ex: @concluir LS-AB123)' 
    : 'Salve nosso número nos contatos!';

  // Versão colapsável para mobile
  if (isMobile) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-green-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-green-50/50 dark:hover:bg-green-950/30 rounded-t-lg transition-colors">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Bot WhatsApp</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <p className="text-sm text-muted-foreground">{titulo}</p>
              
              <Button 
                asChild 
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
              >
                <a 
                  href={WHATSAPP_BOT.waLink('@ajuda')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Iniciar Conversa
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>

              <div className="pt-2">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span>{emoji}</span> Comandos:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {comandos.map((cmd) => (
                    <div 
                      key={cmd.comando} 
                      className="flex items-center gap-3 text-sm p-2 bg-white/50 dark:bg-black/20 rounded-lg"
                    >
                      <code className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded font-mono text-xs shrink-0">
                        {cmd.comando}
                      </code>
                      <span className="text-muted-foreground text-xs truncate">{cmd.descricao}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Smartphone className="h-4 w-4 shrink-0 mt-0.5" />
                <span>💡 {dica}</span>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  // Versão desktop (sem collapse)
  return (
    <Card className="border-green-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <span>Bot WhatsApp</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{titulo}</p>
        
        <Button 
          asChild 
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <a 
            href={WHATSAPP_BOT.waLink('@ajuda')} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Iniciar Conversa no WhatsApp
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>

        <div className="pt-2">
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <span>{emoji}</span> Comandos Disponíveis:
          </p>
          <div className="space-y-2">
            {comandos.map((cmd) => (
              <div 
                key={cmd.comando} 
                className="flex items-start gap-3 text-sm"
              >
                <code className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded font-mono text-xs shrink-0">
                  {cmd.comando}
                </code>
                <span className="text-muted-foreground">{cmd.descricao}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 pt-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <Smartphone className="h-4 w-4 shrink-0 mt-0.5" />
          <span>💡 {dica}</span>
        </div>
      </CardContent>
    </Card>
  );
}
