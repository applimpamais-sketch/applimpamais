import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Layout, 
  Plus, 
  ArrowLeft,
  Sparkles,
  Video,
  Users,
  BarChart3,
  MapPin,
  Gift,
  Pencil,
  Eye,
  Trash2,
  Copy,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SITE_DOMAIN } from '@/lib/constants';
import { ModuleGate } from '@/components/admin/ModuleGate';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const templates = [
  {
    id: 'promocao_simples',
    nome: 'Promoção Simples',
    descricao: 'Hero + Oferta + CTA + Timer de urgência',
    icon: Gift,
    color: 'from-orange-500 to-red-500',
    estrutura: ['Hero com oferta', 'Benefícios rápidos', 'CTA principal', 'Contador regressivo'],
    ideal: 'Promoções com prazo'
  },
  {
    id: 'vsl',
    nome: 'VSL (Video Sales)',
    descricao: 'Vídeo principal + Bullets + Testemunhos + CTA',
    icon: Video,
    color: 'from-purple-500 to-pink-500',
    estrutura: ['Vídeo de vendas', 'Lista de benefícios', 'Depoimentos', 'CTA com garantia'],
    ideal: 'Produtos/Serviços premium'
  },
  {
    id: 'captura_leads',
    nome: 'Captura de Leads',
    descricao: 'Hero + Formulário + Benefícios + Prova social',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    estrutura: ['Hero com promessa', 'Formulário simples', 'Lista de benefícios', 'Logos de clientes'],
    ideal: 'Geração de leads'
  },
  {
    id: 'comparativo',
    nome: 'Comparativo',
    descricao: 'Antes/Depois + Preço + Garantia + CTA',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-500',
    estrutura: ['Comparação visual', 'Tabela de preços', 'Garantia em destaque', 'CTA urgente'],
    ideal: 'Transformação visível'
  },
  {
    id: 'servico_local',
    nome: 'Serviço Local',
    descricao: 'Hero local + Serviços + Mapa + CTA WhatsApp',
    icon: MapPin,
    color: 'from-teal-500 to-green-500',
    estrutura: ['Hero com cidade', 'Grid de serviços', 'Mapa de atendimento', 'Botão WhatsApp'],
    ideal: 'Negócios locais'
  }
];

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  rascunho: { label: 'Rascunho', variant: 'secondary' },
  publicada: { label: 'Publicada', variant: 'default' },
  arquivada: { label: 'Arquivada', variant: 'outline' }
};

export default function LandingPages() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Query para buscar LPs existentes
  const { data: landingPages, isLoading, refetch } = useQuery({
    queryKey: ['landing-pages-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iarc_landing_pages')
        .select('id, nome, status, template_tipo, created_at, slug')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleCreateLP = (templateId: string) => {
    toast.info(`Editor de Landing Page em desenvolvimento. Template: ${templateId}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/lp/${id}/editor`);
  };

const handleView = (slug: string | null) => {
    if (slug) {
      // Usar domínio de produção para garantir funcionamento
      window.open(`${SITE_DOMAIN}/lp/${slug}`, '_blank');
    } else {
      toast.error('Esta LP ainda não tem um slug definido');
    }
  };

  const handleDuplicate = async (id: string) => {
    toast.info('Duplicação em desenvolvimento');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta landing page? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Primeiro, deletar revisões relacionadas
      await supabase
        .from('iarc_landing_page_revisions')
        .delete()
        .eq('landing_page_id', id);

      // Depois, deletar a LP
      const { error } = await supabase
        .from('iarc_landing_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Landing page excluída com sucesso');
      refetch();
    } catch (error: any) {
      console.error('Erro ao excluir LP:', error);
      toast.error('Erro ao excluir: ' + (error.message || 'Tente novamente'));
    }
  };

  return (
    <ModuleGate module="iarc_criativos" moduleName="IARC Studio">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/iarc')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Layout className="h-6 w-6 text-blue-500" />
                Landing Pages
              </h1>
              <p className="text-muted-foreground">
                Crie páginas de conversão com templates validados
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/admin/iarc/landing-pages/wizard')}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Criar com IA
          </Button>
        </div>

        {/* Minhas Landing Pages */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Minhas Landing Pages
                {landingPages && landingPages.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {landingPages.length}
                  </Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : landingPages && landingPages.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {landingPages.map((lp) => {
                    const status = statusLabels[lp.status || 'rascunho'] || statusLabels.rascunho;
                    return (
                      <TableRow key={lp.id}>
                        <TableCell className="font-medium">{lp.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {lp.template_tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(lp.created_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleEdit(lp.id)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleView(lp.slug)}
                              title="Visualizar"
                              disabled={!lp.slug}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDuplicate(lp.id)}
                              title="Duplicar"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(lp.id)}
                              title="Excluir"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Layout className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Nenhuma landing page criada ainda</p>
                <p className="text-sm">Escolha um template abaixo para começar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Templates */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Escolha um Template</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card 
                key={template.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${template.color} text-white`}>
                      <template.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {template.ideal}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{template.nome}</CardTitle>
                  <CardDescription>{template.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">ESTRUTURA:</span>
                    <ul className="space-y-1">
                      {template.estrutura.map((item, idx) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateLP(template.id);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ModuleGate>
  );
}
