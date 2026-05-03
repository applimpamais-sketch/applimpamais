import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Template {
  id: string;
  nome: string;
  titulo: string;
  categoria: string;
  conteudo: string;
  variaveis: string[];
  ativo: boolean;
  uso_count: number;
  created_at: string;
  updated_at: string;
}

export function useTemplates() {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('templates_mensagens')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as any) as Template[];
    }
  });

  const createTemplate = useMutation({
    mutationFn: async (templateData: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'uso_count'>) => {
      const { data, error } = await (supabase as any)
        .from('templates_mensagens')
        .insert([{ ...templateData, uso_count: 0 } as any])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ 
        title: 'Template criado!',
        description: 'O template está pronto para uso.'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao criar template',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Template> }) => {
      const { data, error } = await (supabase as any)
        .from('templates_mensagens')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ 
        title: 'Template atualizado!',
        description: 'As alterações foram salvas.'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('templates_mensagens')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ 
        title: 'Template excluído!',
        description: 'O template foi removido permanentemente.'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao excluir template',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const toggleTemplate = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await (supabase as any)
        .from('templates_mensagens')
        .update({ ativo } as any)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const duplicateTemplate = useMutation({
    mutationFn: async (template: Template) => {
      const { data, error } = await (supabase as any)
        .from('templates_mensagens')
        .insert([{
          nome: `${template.nome} (Cópia)`,
          titulo: template.titulo,
          categoria: template.categoria,
          conteudo: template.conteudo,
          variaveis: template.variaveis,
          ativo: false,
          uso_count: 0
        } as any])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ 
        title: 'Template duplicado!',
        description: 'Uma cópia foi criada como inativo.'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao duplicar template',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    templates: templates || [],
    isLoading,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    toggleTemplate: toggleTemplate.mutate,
    duplicateTemplate: duplicateTemplate.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
}
