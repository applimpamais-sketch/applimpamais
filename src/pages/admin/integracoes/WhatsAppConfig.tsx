import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Copy, CheckCircle2, AlertCircle, HelpCircle, ExternalLink, Zap, Phone, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWhatsAppStatus } from '@/hooks/useWhatsAppStatus';
import { useWhatsAppFinanceiroStatus } from '@/hooks/useWhatsAppFinanceiroStatus';
import WhatsAppConnectionTest from '@/components/admin/WhatsAppConnectionTest';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function WhatsAppConfig() {
  const { status, lastMessage, loading, testConnection } = useWhatsAppStatus();
  const { 
    status: financeiroStatus, 
    loading: financeiroLoading, 
    testConnection: testFinanceiroConnection 
  } = useWhatsAppFinanceiroStatus();

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/receive-whatsapp-webhook`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('URL copiada!', {
      description: 'Cole essa URL no painel do UltraMsg',
    });
  };

  return (
    <AdminContainer>
      <PageHeader
        title="Configuração WhatsApp"
        description="Gerencie as duas instâncias WhatsApp: Agendamentos e Bot Financeiro"
        icon={MessageCircle}
      />

      <div className="grid gap-6">
        {/* Aviso sobre duas instâncias */}
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertTitle>Duas Instâncias Separadas</AlertTitle>
          <AlertDescription>
            Este sistema usa dois números WhatsApp diferentes: um para agendamentos e outro para o bot financeiro.
          </AlertDescription>
        </Alert>

        {/* Instância Principal - Agendamentos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  WhatsApp Principal - Agendamentos
                </CardTitle>
                <CardDescription>
                  Usado para confirmações de agendamentos e recuperação de carrinho
                </CardDescription>
              </div>
              <Badge 
                variant={status.connected ? "default" : "secondary"}
                className="px-3 py-1"
              >
                {status.connected ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Configurado
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Aguardando Configuração
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Última Mensagem</p>
                <p className="text-sm font-medium">
                  {lastMessage 
                    ? new Date(lastMessage).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Nenhuma mensagem recebida'
                  }
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Webhook URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                    ...{webhookUrl.slice(-30)}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={copyWebhookUrl}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status UltraMsg</p>
                <div className="flex items-center gap-2">
                  {status.ultraMsgConfigured ? (
                    <>
                      {status.status === 'authenticated' && status.substatus === 'connected' ? (
                        <Badge className="bg-green-500 text-white">
                          ✅ Configurado & Conectado
                        </Badge>
                      ) : status.status === 'authenticated' ? (
                        <Badge className="bg-yellow-500 text-white">
                          ⚠️ Autenticado {status.substatus ? `(${status.substatus})` : ''}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          ⚙️ Configurado
                        </Badge>
                      )}
                    </>
                  ) : (
                    <Badge variant="outline">
                      ⚠️ Não configurado
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Teste de Conexão */}
            <WhatsAppConnectionTest 
              onTest={testConnection}
              loading={loading}
              status={status}
            />
            
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                Esta instância é usada pelas funções: <code className="text-xs">send-whatsapp</code>, <code className="text-xs">send-recovery-whatsapp</code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Instância Bot Financeiro */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Bot Financeiro - Despesas/Receitas
                </CardTitle>
                <CardDescription>
                  Número separado para receber e processar despesas/receitas via WhatsApp
                </CardDescription>
              </div>
              <Badge 
                variant={financeiroStatus.configured ? "default" : "secondary"}
                className="px-3 py-1"
              >
                {financeiroStatus.configured ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Configurado
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Aguardando Configuração
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Última Atividade</p>
                <p className="text-sm font-medium">
                  {financeiroStatus.lastActivity 
                    ? new Date(financeiroStatus.lastActivity).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Nenhuma mensagem recebida'
                  }
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Webhook URL (mesma URL)</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                    ...{webhookUrl.slice(-30)}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={copyWebhookUrl}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <WhatsAppConnectionTest 
              onTest={testFinanceiroConnection}
              loading={financeiroLoading}
              status={{
                connected: financeiroStatus.configured,
                ultraMsgConfigured: financeiroStatus.configured,
                lastMessageAt: financeiroStatus.lastActivity ? new Date(financeiroStatus.lastActivity) : undefined,
              }}
            />

            {!financeiroStatus.configured && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configure o Bot Financeiro</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-2 mt-2">
                    <li>Crie uma <strong>nova instância</strong> no UltraMsg (diferente da instância de agendamentos)</li>
                    <li>Configure o webhook dessa nova instância com a URL acima</li>
                    <li>Os secrets <code className="text-xs">ULTRAMSG_FINANCEIRO_INSTANCE_ID</code> e <code className="text-xs">ULTRAMSG_FINANCEIRO_TOKEN</code> já foram configurados</li>
                    <li>Teste enviando: "Gastei R$ 50 com gasolina"</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Tutorial Passo a Passo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Tutorial de Configuração
            </CardTitle>
            <CardDescription>
              Siga os passos abaixo para configurar o webhook do WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {/* Passo 1 */}
              <AccordionItem value="step-1">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      1
                    </div>
                    <span className="font-medium">Copie a URL do Webhook</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pl-11">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Esta é a URL que o UltraMsg usará para enviar as mensagens recebidas:
                    </p>
                    <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                      <code className="text-xs flex-1 break-all">
                        {webhookUrl}
                      </code>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={copyWebhookUrl}
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Passo 2 */}
              <AccordionItem value="step-2">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      2
                    </div>
                    <span className="font-medium">Acesse o Painel do UltraMsg</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pl-11">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Entre no painel do UltraMsg e navegue até as configurações:
                    </p>
                    <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                      <li>Acesse <a href="https://ultramsg.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">ultramsg.com <ExternalLink className="h-3 w-3" /></a></li>
                      <li>Faça login na sua conta</li>
                      <li>Selecione sua instância do WhatsApp</li>
                      <li>Vá em <strong>Settings → Webhooks</strong></li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Passo 3 */}
              <AccordionItem value="step-3">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      3
                    </div>
                    <span className="font-medium">Configure os Eventos do Webhook</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pl-11">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Cole a URL copiada e ative os seguintes eventos:
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Message Received</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Image Received</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Audio Received</span>
                      </div>
                    </div>
                    <Alert>
                      <HelpCircle className="h-4 w-4" />
                      <AlertTitle>Importante</AlertTitle>
                      <AlertDescription className="text-xs">
                        Certifique-se de salvar as configurações no painel do UltraMsg após colar a URL e selecionar os eventos.
                      </AlertDescription>
                    </Alert>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Passo 4 */}
              <AccordionItem value="step-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      4
                    </div>
                    <span className="font-medium">Registre seu Telefone</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pl-11">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Para que o bot processe suas mensagens, seu telefone precisa estar cadastrado:
                    </p>
                    <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                      <li>Vá em <strong>Admin → Equipe</strong></li>
                      <li>Edite seu perfil ou adicione um novo membro</li>
                      <li>Adicione o número do WhatsApp no formato: <code className="bg-muted px-1 rounded">+5531999999999</code></li>
                      <li>Salve as alterações</li>
                    </ol>
                    <Alert>
                      <Phone className="h-4 w-4" />
                      <AlertTitle>Formato do Número</AlertTitle>
                      <AlertDescription className="text-xs">
                        Use o formato internacional: <strong>+55</strong> (código do país) + <strong>31</strong> (DDD) + <strong>999999999</strong> (número)
                      </AlertDescription>
                    </Alert>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Passo 5 */}
              <AccordionItem value="step-5">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      5
                    </div>
                    <span className="font-medium">Teste a Conexão</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pl-11">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Envie uma mensagem de teste para verificar se está tudo funcionando:
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <p className="text-sm font-medium">Exemplos de mensagens:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-muted-foreground">💬</span>
                          <code className="bg-background px-2 py-1 rounded text-xs">Gastei R$ 50 com gasolina hoje</code>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-muted-foreground">💬</span>
                          <code className="bg-background px-2 py-1 rounded text-xs">Paguei R$ 150 de almoço da equipe</code>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-muted-foreground">📷</span>
                          <span className="text-xs text-muted-foreground">Envie uma foto de um cupom fiscal</span>
                        </li>
                      </ul>
                    </div>
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>O que esperar</AlertTitle>
                      <AlertDescription className="text-xs">
                        Você deve receber uma confirmação do bot via WhatsApp, e a despesa deve aparecer no <strong>Dashboard Financeiro → Despesas</strong>.
                      </AlertDescription>
                    </Alert>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Como Funciona */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Como o Bot Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">Você envia uma mensagem</p>
                  <p className="text-xs text-muted-foreground">
                    Pode ser texto descrevendo o gasto, foto de cupom fiscal ou áudio
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">IA processa a informação</p>
                  <p className="text-xs text-muted-foreground">
                    Extrai valor, descrição, categoria e data da despesa
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">Confirmação automática</p>
                  <p className="text-xs text-muted-foreground">
                    Se confiança ≥ 70%, cria a despesa e confirma via WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <p className="text-sm font-medium">Despesa registrada</p>
                  <p className="text-xs text-muted-foreground">
                    Aparece automaticamente no Dashboard Financeiro
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminContainer>
  );
}
