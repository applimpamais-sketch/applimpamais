import { useState } from 'react';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, MessageSquare } from 'lucide-react';
import { useTemplates, Template } from '@/hooks/useTemplates';
import TemplateCard from '@/components/admin/TemplateCard';
import TemplateFormModal from '@/components/admin/TemplateFormModal';
import TemplateTestModal from '@/components/admin/TemplateTestModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Templates() {
  const {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplate,
    duplicateTemplate,
    isCreating,
    isUpdating,
  } = useTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // Filtrar templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.conteudo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'todos' || template.categoria === categoryFilter;
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'ativo' && template.ativo) ||
      (statusFilter === 'inativo' && !template.ativo);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateNew = () => {
    setSelectedTemplate(undefined);
    setFormModalOpen(true);
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setFormModalOpen(true);
  };

  const handleView = (template: Template) => {
    setSelectedTemplate(template);
    setViewModalOpen(true);
  };

  const handleTest = (template: Template) => {
    setSelectedTemplate(template);
    setTestModalOpen(true);
  };

  const handleSave = (templateData: Partial<Template>) => {
    if (selectedTemplate) {
      updateTemplate({ id: selectedTemplate.id, updates: templateData });
    } else {
      createTemplate(templateData as any);
    }
    setFormModalOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete);
    }
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  return (
    <AdminContainer>
      <PageHeader
        title="Templates de Mensagens"
        description="Gerencie templates de WhatsApp para comunicação com clientes"
        icon={MessageSquare}
      />

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative" data-tour="templates-busca">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div data-tour="templates-categoria">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Categorias</SelectItem>
              <SelectItem value="agendamento">Agendamento</SelectItem>
              <SelectItem value="carrinho">Carrinho</SelectItem>
              <SelectItem value="pos-venda">Pós-Venda</SelectItem>
              <SelectItem value="promocao">Promoção</SelectItem>
              <SelectItem value="suporte">Suporte</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleCreateNew} data-tour="templates-novo">
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum template encontrado</p>
            <p className="text-sm">
              {searchQuery || categoryFilter !== 'todos' || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de busca'
                : 'Crie seu primeiro template de mensagem'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onToggle={() => toggleTemplate({ id: template.id, ativo: !template.ativo })}
              onEdit={() => handleEdit(template)}
              onDuplicate={() => duplicateTemplate(template)}
              onDelete={() => handleDeleteClick(template.id)}
              onTest={() => handleTest(template)}
              onView={() => handleView(template)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <TemplateFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSave={handleSave}
        template={selectedTemplate}
        isLoading={isCreating || isUpdating}
      />

      <TemplateTestModal
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
        template={selectedTemplate || null}
      />

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Conteúdo:</p>
              <Card className="p-4 bg-muted/30">
                <p className="text-sm whitespace-pre-wrap">{selectedTemplate?.conteudo}</p>
              </Card>
            </div>
            {selectedTemplate?.variaveis && selectedTemplate.variaveis.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Variáveis:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variaveis.map((variable) => (
                    <code key={variable} className="bg-muted px-2 py-1 rounded text-xs">
                      {`{${variable}}`}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminContainer>
  );
}
