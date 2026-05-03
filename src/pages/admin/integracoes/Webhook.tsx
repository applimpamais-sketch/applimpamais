import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Webhook, Plus, Edit2, Trash2, TestTube2, CheckCircle2, XCircle } from 'lucide-react';
import { useIntegracoes } from '@/hooks/useIntegracoes';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import WebhookFormModal from '@/components/integracoes/WebhookFormModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function IntegracoesWebhook() {
  const { integracoes, isLoading, deleteIntegracao } = useIntegracoes('webhook');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (webhook: any) => {
    setEditingWebhook(webhook);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteIntegracao.mutate(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <AdminContainer>
      <PageHeader
        title="Webhooks"
        description="Configure endpoints para receber eventos em tempo real"
        icon={Webhook}
        actions={
          <Button onClick={() => {
            setEditingWebhook(null);
            setIsModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Webhook
          </Button>
        }
      />

      <div className="grid gap-6">
        {/* Lista de Webhooks */}
        {integracoes && integracoes.length > 0 ? (
          integracoes.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{webhook.nome}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {webhook.configuracao?.url || 'URL não configurada'}
                    </CardDescription>
                  </div>
                  <Badge variant={webhook.status === 'ativo' ? 'default' : webhook.status === 'erro' ? 'destructive' : 'secondary'}>
                    {webhook.status === 'ativo' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {webhook.status === 'erro' && <XCircle className="h-3 w-3 mr-1" />}
                    {webhook.status === 'ativo' ? 'Ativo' : webhook.status === 'erro' ? 'Erro' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Evento</p>
                      <p className="font-medium">{webhook.configuracao?.evento || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Último Disparo</p>
                      <p className="font-medium">
                        {webhook.ultimo_uso 
                          ? new Date(webhook.ultimo_uso).toLocaleString('pt-BR')
                          : 'Nunca'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Método</p>
                      <p className="font-medium">{webhook.configuracao?.metodo || 'POST'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Criado em</p>
                      <p className="font-medium">
                        {new Date(webhook.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(webhook)}>
                      <Edit2 className="h-3 w-3 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <TestTube2 className="h-3 w-3 mr-2" />
                      Testar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setDeletingId(webhook.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Deletar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum webhook configurado</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Webhook
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Card de Eventos Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Disponíveis</CardTitle>
            <CardDescription>
              Você pode configurar webhooks para os seguintes eventos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                { evento: 'agendamento.criado', desc: 'Quando um novo agendamento é criado' },
                { evento: 'agendamento.atualizado', desc: 'Quando um agendamento é atualizado' },
                { evento: 'agendamento.cancelado', desc: 'Quando um agendamento é cancelado' },
                { evento: 'pagamento.confirmado', desc: 'Quando um pagamento é confirmado' },
                { evento: 'carrinho.abandonado', desc: 'Quando um carrinho é abandonado' },
                { evento: 'cupom.usado', desc: 'Quando um cupom é utilizado' },
              ].map(({ evento, desc }) => (
                <div key={evento} className="p-3 border rounded-lg">
                  <p className="font-mono font-medium">{evento}</p>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <WebhookFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        webhook={editingWebhook}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este webhook? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminContainer>
  );
}
