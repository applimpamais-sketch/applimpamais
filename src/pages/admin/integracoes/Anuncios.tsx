import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, CheckCircle2, AlertCircle } from 'lucide-react';
import { useIntegracoes } from '@/hooks/useIntegracoes';
import { Badge } from '@/components/ui/badge';

export default function IntegracoesAnuncios() {
  const { integracoes, isLoading } = useIntegracoes('facebook');
  const facebookIntegracao = integracoes?.[0];

  return (
    <AdminContainer>
      <PageHeader
        title="Anúncios - Facebook Ads"
        description="Conecte sua conta do Facebook para gerenciar campanhas publicitárias"
        icon={Facebook}
      />

      <div className="grid gap-6">
        {/* Card de Conexão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              Conexão com Facebook
            </CardTitle>
            <CardDescription>
              Conecte sua conta para importar e gerenciar suas campanhas de anúncios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!facebookIntegracao ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Facebook className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Status: <span className="font-medium">Não conectado</span>
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Facebook className="h-4 w-4 mr-2" />
                    Conectar com Facebook
                  </Button>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Ao conectar, você poderá visualizar estatísticas, criar e gerenciar campanhas diretamente pelo painel.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{facebookIntegracao.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Conectado em {new Date(facebookIntegracao.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={facebookIntegracao.status === 'ativo' ? 'default' : 'destructive'}>
                    {facebookIntegracao.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Atualizar Conexão
                  </Button>
                  <Button variant="destructive" size="sm">
                    Desconectar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Configuração de Conta */}
        {facebookIntegracao && (
          <Card>
            <CardHeader>
              <CardTitle>Conta de Anúncios</CardTitle>
              <CardDescription>
                Selecione a conta de anúncios que deseja gerenciar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Conta Selecionada:</label>
                    <Button variant="outline" size="sm">
                      Trocar Conta
                    </Button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID da Conta:</span>
                      <span className="font-mono">act_123456789</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nome:</span>
                      <span className="font-medium">RC Limpa Mais - Anúncios</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moeda:</span>
                      <span>BRL (R$)</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  Salvar Configuração
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card de Estatísticas */}
        {facebookIntegracao && (
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas dos Últimos 30 Dias</CardTitle>
              <CardDescription>
                Desempenho geral das suas campanhas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Impressões</p>
                  <p className="text-2xl font-bold">12.543</p>
                  <p className="text-xs text-green-600">+18% vs mês anterior</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cliques</p>
                  <p className="text-2xl font-bold">340</p>
                  <p className="text-xs text-green-600">+12% vs mês anterior</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Conversões</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-red-600">-5% vs mês anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card de Avisos */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="h-5 w-5" />
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-900 space-y-2">
            <p>
              • Para conectar com o Facebook Ads, você precisa ter uma conta comercial no Facebook.
            </p>
            <p>
              • É necessário criar um App no Facebook Developers e obter aprovação para usar a Marketing API.
            </p>
            <p>
              • As permissões necessárias incluem: ads_read, ads_management, business_management.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminContainer>
  );
}
