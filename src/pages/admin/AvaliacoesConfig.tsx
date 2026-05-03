import { useState, useEffect } from 'react';
import { Star, Settings, MessageSquare, TrendingUp, TrendingDown, Users, ExternalLink, Eye } from 'lucide-react';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAvaliacoesConfig, type AvaliacoesConfig as ConfigType } from '@/hooks/useAvaliacoesConfig';
import { FeedbackDetailsModal } from '@/components/admin/FeedbackDetailsModal';
import type { Feedback } from '@/hooks/useAvaliacoesConfig';

export default function AvaliacoesConfig() {
  const { config, sistemaAtivo, feedbacks, stats, isLoading, isSaving, saveConfig } = useAvaliacoesConfig();
  
  const [localConfig, setLocalConfig] = useState<ConfigType>(config);
  const [localAtivo, setLocalAtivo] = useState(sistemaAtivo);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sincronizar estado local quando config carregar
  useEffect(() => {
    setLocalConfig(config);
    setLocalAtivo(sistemaAtivo);
  }, [config, sistemaAtivo]);

  const handleSave = () => {
    saveConfig(localConfig, localAtivo);
  };

  const formatPhone = (phone: string) => {
    if (phone.length >= 10) {
      return `(${phone.slice(0, 2)}) ****-${phone.slice(-4)}`;
    }
    return phone;
  };

  const getNotaBadge = (nota: number | null) => {
    if (nota === null) return <Badge variant="outline">N/A</Badge>;
    if (nota >= localConfig.nota_minima_review) {
      return <Badge className="bg-green-500 hover:bg-green-600">{nota}</Badge>;
    }
    if (nota >= 5) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{nota}</Badge>;
    }
    return <Badge variant="destructive">{nota}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminContainer>
        <PageHeader
          icon={Star}
          title="Configuração de Avaliações"
          subtitle="Carregando..."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <PageHeader
        icon={Star}
        title="Configuração de Avaliações"
        subtitle="Gerencie links de review e visualize feedbacks dos clientes"
      />

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList data-tour="avaliacoes-config">
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="feedbacks" className="gap-2" data-tour="avaliacoes-feedbacks">
            <MessageSquare className="h-4 w-4" />
            Feedbacks ({stats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total de Feedbacks</span>
                </div>
                <p className="text-2xl font-bold mt-2">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Média de Notas</span>
                </div>
                <p className="text-2xl font-bold mt-2">{stats.media.toFixed(1)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Promotores (≥{localConfig.nota_minima_review})</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-green-600">{stats.positivos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-muted-foreground">Detratores (&lt;{localConfig.nota_minima_review})</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-red-600">{stats.negativos}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Card de Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Links de Avaliação
                </CardTitle>
                <CardDescription>
                  Configure os links para onde clientes satisfeitos serão direcionados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2" data-tour="avaliacoes-url">
                  <Label htmlFor="google_reviews">URL Google Reviews</Label>
                  <Input
                    id="google_reviews"
                    placeholder="https://g.page/r/xxx/review"
                    value={localConfig.google_reviews_url}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, google_reviews_url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_reviews">URL Facebook Reviews (opcional)</Label>
                  <Input
                    id="facebook_reviews"
                    placeholder="https://facebook.com/xxx/reviews"
                    value={localConfig.facebook_reviews_url}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, facebook_reviews_url: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-1">
                    <Label>Sistema Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar envio automático de pedidos de avaliação
                    </p>
                  </div>
                  <Switch
                    checked={localAtivo}
                    onCheckedChange={setLocalAtivo}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card de Threshold */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Nota Mínima para Review
                </CardTitle>
                <CardDescription>
                  Clientes com nota igual ou superior serão direcionados para avaliação pública
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4" data-tour="avaliacoes-threshold">
                  <div className="flex items-center justify-between">
                    <Label>Nota Mínima</Label>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {localConfig.nota_minima_review}
                    </Badge>
                  </div>
                  <Slider
                    value={[localConfig.nota_minima_review]}
                    onValueChange={(value) => setLocalConfig(prev => ({ ...prev, nota_minima_review: value[0] }))}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        Nota ≥ {localConfig.nota_minima_review}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        → Envia link do Google Reviews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <TrendingDown className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Nota &lt; {localConfig.nota_minima_review}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        → Pede feedback privado para melhoria
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card de Mensagens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mensagens Personalizadas
              </CardTitle>
              <CardDescription>
                Personalize as mensagens enviadas aos clientes via WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="msg_pedido">Pedido de Nota</Label>
                  <Textarea
                    id="msg_pedido"
                    placeholder="De 0 a 10, como você avalia..."
                    value={localConfig.mensagem_pedido_nota}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, mensagem_pedido_nota: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="msg_alta">Nota Alta (usar {'{link}'})</Label>
                  <Textarea
                    id="msg_alta"
                    placeholder="Ficamos felizes! Deixe sua avaliação: {link}"
                    value={localConfig.mensagem_nota_alta}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, mensagem_nota_alta: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="msg_baixa">Nota Baixa</Label>
                  <Textarea
                    id="msg_baixa"
                    placeholder="O que podemos melhorar?"
                    value={localConfig.mensagem_nota_baixa}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, mensagem_nota_baixa: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="feedbacks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedbacks Recebidos</CardTitle>
              <CardDescription>
                Lista de avaliações e feedbacks enviados pelos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedbacks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum feedback recebido ainda.</p>
                  <p className="text-sm">Os feedbacks aparecerão aqui quando os clientes responderem.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="text-center">Nota</TableHead>
                      <TableHead>Comentário</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacks.map((feedback) => (
                      <TableRow key={feedback.id}>
                        <TableCell className="font-medium">
                          {feedback.nome_cliente || 'Não identificado'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatPhone(feedback.telefone)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getNotaBadge(feedback.nota_geral)}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {feedback.comentario_positivo || feedback.comentario_negativo || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {feedback.created_at 
                            ? format(new Date(feedback.created_at), 'dd/MM/yyyy', { locale: ptBR })
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FeedbackDetailsModal
        feedback={selectedFeedback}
        open={modalOpen}
        onOpenChange={setModalOpen}
        notaMinima={localConfig.nota_minima_review}
      />
    </AdminContainer>
  );
}
