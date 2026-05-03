import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus, QrCode, CheckCircle2, AlertCircle, Send, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useIntegracoes } from '@/hooks/useIntegracoes';
import { toast } from 'sonner';

export default function IntegracoesWhatsApp() {
  const { integracoes, isLoading, createIntegracao, updateIntegracao } = useIntegracoes('whatsapp');
  
  // Configurações locais que sincronizam com o banco
  const [configs, setConfigs] = useState({
    autoConfirmacao: true,
    lembrete24h: true,
    notifPagamento: false,
  });

  // Sincronizar configs do banco quando carregar
  useEffect(() => {
    if (integracoes && integracoes.length > 0) {
      const mainConfig = integracoes[0];
      if (mainConfig.configuracao) {
        setConfigs({
          autoConfirmacao: mainConfig.configuracao.autoConfirmacao ?? true,
          lembrete24h: mainConfig.configuracao.lembrete24h ?? true,
          notifPagamento: mainConfig.configuracao.notifPagamento ?? false,
        });
      }
    }
  }, [integracoes]);

  // Mapear integrações para o formato esperado
  const numeros = integracoes?.map((integracao) => ({
    id: integracao.id,
    numero: integracao.configuracao?.numero || '+55 XX XXXXX-XXXX',
    nome_negocio: integracao.nome,
    status: integracao.status === 'ativo' ? 'conectado' : 'pendente',
    ultimo_uso: integracao.ultimo_uso,
    mensagens_hoje: integracao.configuracao?.mensagens_hoje || 0,
  })) || [];

  const handleSaveConfigs = async () => {
    if (integracoes && integracoes.length > 0) {
      updateIntegracao.mutate({
        id: integracoes[0].id,
        configuracao: {
          ...integracoes[0].configuracao,
          ...configs,
        },
      });
    } else {
      // Criar nova integração se não existir
      createIntegracao.mutate({
        tipo: 'whatsapp',
        nome: 'WhatsApp Principal',
        status: 'inativo',
        configuracao: configs,
      });
    }
  };

  const handleAddNumero = () => {
    createIntegracao.mutate({
      tipo: 'whatsapp',
      nome: 'Novo Número WhatsApp',
      status: 'inativo',
      configuracao: {
        numero: '',
        ...configs,
      },
    });
  };

  if (isLoading) {
    return (
      <AdminContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <PageHeader
        title="WhatsApp Business"
        description="Conecte e gerencie seus números de WhatsApp"
        icon={MessageCircle}
        actions={
          <Button onClick={handleAddNumero} disabled={createIntegracao.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Número
          </Button>
        }
      />

      <div className="grid gap-6">
        {/* Números Conectados */}
        <div className="space-y-4">
          {numeros.map((numero) => (
            <Card key={numero.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      numero.status === 'conectado' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <MessageCircle className={`h-6 w-6 ${
                        numero.status === 'conectado' ? 'text-green-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{numero.numero}</CardTitle>
                      {numero.nome_negocio && (
                        <CardDescription>{numero.nome_negocio}</CardDescription>
                      )}
                    </div>
                  </div>
                  <Badge variant={numero.status === 'conectado' ? 'default' : 'secondary'}>
                    {numero.status === 'conectado' ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Conectado
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Aguardando QR Code
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {numero.status === 'conectado' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Última atividade</p>
                        <p className="font-medium">
                          {numero.ultimo_uso 
                            ? new Date(numero.ultimo_uso).toLocaleString('pt-BR')
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mensagens hoje</p>
                        <p className="font-medium">{numero.mensagens_hoje}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status API</p>
                        <p className="font-medium text-green-600">Operacional</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Send className="h-3 w-3 mr-2" />
                        Testar Envio
                      </Button>
                      <Button variant="destructive" size="sm">
                        Desconectar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 space-y-4">
                    <div className="h-48 w-48 border-2 border-dashed rounded-lg flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-muted-foreground" />
                    </div>
                    <Button>
                      <QrCode className="h-4 w-4 mr-2" />
                      Escanear QR Code
                    </Button>
                    <p className="text-xs text-muted-foreground text-center max-w-md">
                      Abra o WhatsApp no seu celular, vá em Configurações → Aparelhos conectados → Conectar um aparelho e escaneie o QR Code.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Configurações de Mensagens Automáticas */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Automáticas</CardTitle>
            <CardDescription>
              Configure quais mensagens devem ser enviadas automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-confirmacao" className="text-base">
                  Confirmação de Agendamento
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enviar mensagem automática ao criar novo agendamento
                </p>
              </div>
              <Switch
                id="auto-confirmacao"
                checked={configs.autoConfirmacao}
                onCheckedChange={(checked) => 
                  setConfigs(prev => ({ ...prev, autoConfirmacao: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="lembrete" className="text-base">
                  Lembrete 24h Antes
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enviar lembrete ao cliente 24 horas antes do agendamento
                </p>
              </div>
              <Switch
                id="lembrete"
                checked={configs.lembrete24h}
                onCheckedChange={(checked) => 
                  setConfigs(prev => ({ ...prev, lembrete24h: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pagamento" className="text-base">
                  Notificação de Pagamento
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notificar cliente quando pagamento for confirmado
                </p>
              </div>
              <Switch
                id="pagamento"
                checked={configs.notifPagamento}
                onCheckedChange={(checked) => 
                  setConfigs(prev => ({ ...prev, notifPagamento: checked }))
                }
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleSaveConfigs}
              disabled={updateIntegracao.isPending || createIntegracao.isPending}
            >
              {(updateIntegracao.isPending || createIntegracao.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>

        {/* Card de Avisos */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="h-5 w-5" />
              Sobre a Integração WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-2">
            <p>
              • Esta integração usa a API oficial do WhatsApp Business ou bibliotecas community.
            </p>
            <p>
              • É necessário ter um número de telefone dedicado para uso comercial.
            </p>
            <p>
              • O WhatsApp Business possui limites de mensagens por dia dependendo do status da conta.
            </p>
            <p>
              • Mensagens automáticas devem seguir as políticas do WhatsApp para evitar bloqueios.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminContainer>
  );
}
