import { useState, useEffect } from 'react';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIntegracoes } from '@/hooks/useIntegracoes';
import { 
  BarChart3, Check, RefreshCw, Zap, 
  CheckCircle2, XCircle, Eye, EyeOff, Key, Save,
  Send, ArrowUpRight, Clock, AlertCircle
} from 'lucide-react';

interface UtmifyEnvio {
  id: string;
  agendamento_id: string;
  status_enviado: string;
  sucesso: boolean;
  erro_mensagem: string | null;
  created_at: string;
}

export default function IntegracoesUTMify() {
  const { integracoes, isLoading, createIntegracao, updateIntegracao } = useIntegracoes('utmify');
  const [apiToken, setApiToken] = useState('');
  const [showApiToken, setShowApiToken] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [envios, setEnvios] = useState<UtmifyEnvio[]>([]);
  const [loadingEnvios, setLoadingEnvios] = useState(false);
  const [testingSend, setTestingSend] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ total: 0, done: 0 });

  const integracao = integracoes?.[0];
  const savedApiToken = integracao?.configuracao?.api_token as string | undefined;

  useEffect(() => {
    if (savedApiToken) setApiToken(savedApiToken);
  }, [savedApiToken]);

  useEffect(() => {
    if (integracao?.status === 'ativo') fetchEnvios();
  }, [integracao]);

  const handleActivate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    let tenantId = null;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .maybeSingle();
      tenantId = profile?.tenant_id;
    }
    await createIntegracao.mutateAsync({
      tipo: 'utmify',
      nome: 'UTMify - Envio de Pedidos',
      configuracao: { tenant_id: tenantId },
      status: 'ativo',
    });
  };

  const handleDeactivate = async () => {
    if (!integracao) return;
    await updateIntegracao.mutateAsync({ id: integracao.id, status: 'inativo' });
  };

  const handleReactivate = async () => {
    if (!integracao) return;
    await updateIntegracao.mutateAsync({ id: integracao.id, status: 'ativo' });
  };

  const handleSaveApiToken = async () => {
    if (!integracao || !apiToken.trim()) {
      toast.error('Insira o API Token da UTMify');
      return;
    }
    setSavingToken(true);
    try {
      await updateIntegracao.mutateAsync({
        id: integracao.id,
        configuracao: { ...integracao.configuracao, api_token: apiToken.trim() },
      });
      toast.success('API Token salvo com sucesso!');
    } finally {
      setSavingToken(false);
    }
  };

  const fetchEnvios = async () => {
    setLoadingEnvios(true);
    try {
      const { data } = await supabase
        .from('utmify_envios' as any)
        .select('id, agendamento_id, status_enviado, sucesso, erro_mensagem, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      setEnvios((data as any[] || []) as UtmifyEnvio[]);
    } catch (e) {
      console.error('Erro ao buscar envios:', e);
    } finally {
      setLoadingEnvios(false);
    }
  };

  const handleSyncPending = async () => {
    if (!savedApiToken) {
      toast.error('Salve o API Token antes de sincronizar');
      return;
    }
    setSyncing(true);
    setSyncProgress({ total: 0, done: 0 });
    try {
      // Get all paid/completed agendamentos
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('id, status')
        .in('status', ['pago', 'concluido']);

      if (!agendamentos || agendamentos.length === 0) {
        toast.info('Nenhum agendamento pago/concluído encontrado');
        return;
      }

      // Get already synced successfully
      const { data: jaEnviados } = await supabase
        .from('utmify_envios' as any)
        .select('agendamento_id')
        .eq('sucesso', true);

      const idsJaEnviados = new Set((jaEnviados as any[] || []).map((e: any) => e.agendamento_id));
      const pendentes = agendamentos.filter(a => !idsJaEnviados.has(a.id));

      if (pendentes.length === 0) {
        toast.success('Todos os agendamentos já foram sincronizados!');
        return;
      }

      setSyncProgress({ total: pendentes.length, done: 0 });
      let sucessos = 0;
      let erros = 0;

      for (const ag of pendentes) {
        try {
          const { data, error } = await supabase.functions.invoke('send-utmify-order', {
            body: { agendamento_id: ag.id, status: ag.status, api_token: savedApiToken },
          });
          if (error || !data?.success) erros++;
          else sucessos++;
        } catch {
          erros++;
        }
        setSyncProgress(prev => ({ ...prev, done: prev.done + 1 }));
      }

      if (erros === 0) toast.success(`${sucessos} agendamentos sincronizados com sucesso!`);
      else toast.warning(`${sucessos} sincronizados, ${erros} com erro`);
      fetchEnvios();
    } catch (e: any) {
      toast.error(`Erro: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestSend = async () => {
    if (!savedApiToken) {
      toast.error('Salve o API Token antes de testar');
      return;
    }
    setTestingSend(true);
    try {
      // Find a recent agendamento to test with
      const { data: ag } = await supabase
        .from('agendamentos')
        .select('id, status')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!ag) {
        toast.error('Nenhum agendamento encontrado para teste');
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'yyrnshankehiqvkndrwk';
      const { data, error } = await supabase.functions.invoke('send-utmify-order', {
        body: { agendamento_id: ag.id, status: ag.status, api_token: savedApiToken },
      });

      if (error) {
        toast.error(`Erro no envio: ${error.message}`);
      } else if (data?.success) {
        toast.success('Pedido enviado com sucesso à UTMify!');
        fetchEnvios();
      } else {
        toast.error(`UTMify retornou erro: ${data?.body || 'Resposta desconhecida'}`);
      }
    } catch (e: any) {
      toast.error(`Erro: ${e.message}`);
    } finally {
      setTestingSend(false);
    }
  };

  const statusBadge = (sucesso: boolean, status: string) => {
    if (sucesso) return <Badge variant="default" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />{status}</Badge>;
    return <Badge variant="destructive" className="text-xs"><XCircle className="h-3 w-3 mr-1" />Erro</Badge>;
  };

  return (
    <AdminContainer>
      <PageHeader
        title="UTMify - Rastreamento de Ads"
        description="Envie dados de vendas automaticamente para a UTMify"
        icon={BarChart3}
      />

      <div className="grid gap-6">
        {/* Status da Integração */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Integração UTMify
                </CardTitle>
                <CardDescription>
                  Envie seus pedidos automaticamente para a UTMify e veja o ROAS real das suas campanhas
                </CardDescription>
              </div>
              {integracao && (
                <Badge variant={integracao.status === 'ativo' ? 'default' : 'secondary'}>
                  {integracao.status === 'ativo' ? (
                    <><CheckCircle2 className="h-3 w-3 mr-1" /> Ativo</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Inativo</>
                  )}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!integracao ? (
              <div className="flex flex-col items-center py-8 space-y-4">
                <ArrowUpRight className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground text-center max-w-md">
                  Ative a integração para enviar automaticamente os pedidos (agendamentos) para a UTMify quando forem pagos ou concluídos.
                </p>
                <Button onClick={handleActivate} disabled={createIntegracao.isPending}>
                  <Zap className="h-4 w-4 mr-2" />
                  Ativar Integração
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stats resumo */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Enviados</p>
                    <p className="text-xl font-bold">{envios.length}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Sucesso</p>
                    <p className="text-xl font-bold text-primary">{envios.filter(e => e.sucesso).length}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Erros</p>
                    <p className="text-xl font-bold text-destructive">{envios.filter(e => !e.sucesso).length}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Último Envio</p>
                    <p className="text-sm font-medium">
                      {envios[0] ? new Date(envios[0].created_at).toLocaleString('pt-BR') : 'Nenhum'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={fetchEnvios} disabled={loadingEnvios}>
                    <RefreshCw className={`h-3 w-3 mr-2 ${loadingEnvios ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleTestSend} disabled={testingSend || !savedApiToken}>
                    <Send className={`h-3 w-3 mr-2 ${testingSend ? 'animate-pulse' : ''}`} />
                    Testar Envio
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSyncPending} disabled={syncing || !savedApiToken}>
                    <RefreshCw className={`h-3 w-3 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? `Sincronizando ${syncProgress.done}/${syncProgress.total}...` : 'Sincronizar Pendentes'}
                  </Button>
                  {integracao.status === 'ativo' ? (
                    <Button variant="destructive" size="sm" onClick={handleDeactivate}>Desativar</Button>
                  ) : (
                    <Button size="sm" onClick={handleReactivate}>Reativar</Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credenciais de API */}
        {integracao && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Credenciais de API
              </CardTitle>
              <CardDescription>
                Vá em <strong>UTMify → Configurações → API → Criar credencial</strong> e cole o token abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-token" className="text-sm font-medium">API Token</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="api-token"
                        type={showApiToken ? 'text' : 'password'}
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        placeholder="Ex: 4Upc7ZXRIBwfM8fK9CtMA6C1WpXjATFI48FY"
                        className="font-mono text-xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiToken(!showApiToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showApiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {savedApiToken && (
                    <div className="flex items-center gap-1.5 text-xs text-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      Token salvo — envios automáticos ativos
                    </div>
                  )}
                </div>
                <Button onClick={handleSaveApiToken} disabled={savingToken || !apiToken.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  {savingToken ? 'Salvando...' : 'Salvar API Token'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Log de Envios */}
        {integracao && envios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Últimos Envios
              </CardTitle>
              <CardDescription>Histórico dos pedidos enviados à UTMify</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {envios.map((envio) => (
                  <div key={envio.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                    <div className="flex items-center gap-3">
                      {statusBadge(envio.sucesso, envio.status_enviado)}
                      <span className="font-mono text-xs text-muted-foreground">
                        {envio.agendamento_id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {envio.erro_mensagem && (
                        <span className="text-xs text-destructive max-w-[200px] truncate" title={envio.erro_mensagem}>
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          {envio.erro_mensagem.slice(0, 50)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(envio.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
            <CardDescription>A integração envia automaticamente seus pedidos para a UTMify</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Ative a integração acima', desc: 'Clique em "Ativar Integração" para habilitar o envio automático' },
                { step: 2, title: 'Crie uma credencial na UTMify', desc: 'Vá em UTMify → Configurações → API → Criar credencial. Copie o API Token gerado.' },
                { step: 3, title: 'Cole o API Token acima', desc: 'Insira o token no campo "Credenciais de API" e clique em Salvar.' },
                { step: 4, title: 'Teste o envio', desc: 'Clique em "Testar Envio" para enviar o último agendamento e verificar se a UTMify recebeu.' },
                { step: 5, title: 'Pronto! Envio automático', desc: 'Cada agendamento pago/concluído será enviado automaticamente. A UTMify cruza com os cliques dos ads para mostrar ROAS.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {step}
                  </div>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminContainer>
  );
}
