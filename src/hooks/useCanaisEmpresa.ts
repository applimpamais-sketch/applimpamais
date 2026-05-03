 import { useState, useEffect } from 'react';
 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 import { useTenantContext } from '@/hooks/useTenantContext';
 
 export interface CanalEmpresa {
   id: string;
   codigo: string;
   nome: string;
   descricao: string | null;
   tipo: 'instagram' | 'google' | 'blog' | 'marketplace' | 'email' | 'outro';
   total_cliques: number;
   status: 'ativo' | 'inativo';
   created_at: string;
   updated_at: string;
   // Campos calculados
   conversoes?: number;
   taxa_conversao?: number;
   receita_gerada?: number;
 }
 
 export interface CanalFormData {
   codigo: string;
   nome: string;
   descricao?: string;
   tipo: CanalEmpresa['tipo'];
 }
 
 export function useCanaisEmpresa() {
   const queryClient = useQueryClient();
   const { toast } = useToast();
   const { tenantId } = useTenantContext();

   // Buscar todos os canais com métricas
   const { data: canais, isLoading, error, refetch } = useQuery({
     queryKey: ['canais-empresa', tenantId],
     queryFn: async () => {
       if (!tenantId) return [];
       
       // Buscar canais COM FILTRO DE TENANT
       const { data: canaisData, error: canaisError } = await supabase
         .from('canais_empresa')
         .select('*')
         .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
         .order('total_cliques', { ascending: false });

       if (canaisError) throw canaisError;

       // Buscar conversões por canal (agendamentos com canal_origem) COM FILTRO DE TENANT
       const { data: conversoes, error: convError } = await supabase
         .from('agendamentos')
         .select('canal_origem, valor_total')
         .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
         .not('canal_origem', 'is', null);

       if (convError) {
         console.error('Erro ao buscar conversões:', convError);
       }

       // Calcular métricas por canal
       const conversoesPorCanal = new Map<string, { count: number; receita: number }>();
       
       (conversoes || []).forEach((c: any) => {
         const codigo = c.canal_origem?.toLowerCase();
         if (!codigo) return;
         
         const atual = conversoesPorCanal.get(codigo) || { count: 0, receita: 0 };
         conversoesPorCanal.set(codigo, {
           count: atual.count + 1,
           receita: atual.receita + (c.valor_total || 0)
         });
       });

       // Enriquecer canais com métricas
       return (canaisData || []).map((canal: any) => {
         const metrics = conversoesPorCanal.get(canal.codigo) || { count: 0, receita: 0 };
         return {
           ...canal,
           conversoes: metrics.count,
           receita_gerada: metrics.receita,
           taxa_conversao: canal.total_cliques > 0 
             ? ((metrics.count / canal.total_cliques) * 100)
             : 0
         } as CanalEmpresa;
       });
     },
     refetchInterval: 30000, // Atualizar a cada 30s
     enabled: !!tenantId,
   });

   // Criar canal
   const createCanal = useMutation({
     mutationFn: async (formData: CanalFormData) => {
       if (!tenantId) throw new Error('Tenant não identificado');
       
       const { data, error } = await supabase
         .from('canais_empresa')
         .insert([{
           codigo: formData.codigo.toLowerCase().trim(),
           nome: formData.nome,
           descricao: formData.descricao || null,
           tipo: formData.tipo,
           tenant_id: tenantId, // ← INCLUIR TENANT_ID
         }])
         .select()
         .single();

       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['canais-empresa', tenantId] });
       toast({
         title: 'Canal criado',
         description: 'O canal foi criado com sucesso.',
       });
     },
     onError: (error: any) => {
       toast({
         title: 'Erro ao criar canal',
         description: error.message,
         variant: 'destructive',
       });
     },
   });

   // Atualizar canal
   const updateCanal = useMutation({
     mutationFn: async ({ id, ...formData }: CanalFormData & { id: string }) => {
       if (!tenantId) throw new Error('Tenant não identificado');
       
       const { data, error } = await supabase
         .from('canais_empresa')
         .update({
           nome: formData.nome,
           descricao: formData.descricao || null,
           tipo: formData.tipo,
         })
         .eq('id', id)
         .eq('tenant_id', tenantId) // ← Garantir que só atualiza do próprio tenant
         .select()
         .single();

       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['canais-empresa', tenantId] });
       toast({
         title: 'Canal atualizado',
         description: 'O canal foi atualizado com sucesso.',
       });
     },
     onError: (error: any) => {
       toast({
         title: 'Erro ao atualizar canal',
         description: error.message,
         variant: 'destructive',
       });
     },
   });

   // Alternar status
   const toggleStatus = useMutation({
     mutationFn: async ({ id, status }: { id: string; status: 'ativo' | 'inativo' }) => {
       if (!tenantId) throw new Error('Tenant não identificado');
       
       const { data, error } = await supabase
         .from('canais_empresa')
         .update({ status })
         .eq('id', id)
         .eq('tenant_id', tenantId) // ← Garantir que só atualiza do próprio tenant
         .select()
         .single();

       if (error) throw error;
       return data;
     },
     onSuccess: (data) => {
       queryClient.invalidateQueries({ queryKey: ['canais-empresa', tenantId] });
       toast({
         title: data.status === 'ativo' ? 'Canal ativado' : 'Canal desativado',
       });
     },
   });

   // Deletar canal
   const deleteCanal = useMutation({
     mutationFn: async (id: string) => {
       if (!tenantId) throw new Error('Tenant não identificado');
       
       const { error } = await supabase
         .from('canais_empresa')
         .delete()
         .eq('id', id)
         .eq('tenant_id', tenantId); // ← Garantir que só deleta do próprio tenant

       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['canais-empresa', tenantId] });
       toast({
         title: 'Canal removido',
         description: 'O canal foi removido com sucesso.',
       });
     },
     onError: (error: any) => {
       toast({
         title: 'Erro ao remover canal',
         description: error.message,
         variant: 'destructive',
       });
     },
   });

   // Calcular totais
   const totais = {
     cliques: canais?.reduce((sum, c) => sum + c.total_cliques, 0) || 0,
     conversoes: canais?.reduce((sum, c) => sum + (c.conversoes || 0), 0) || 0,
     receita: canais?.reduce((sum, c) => sum + (c.receita_gerada || 0), 0) || 0,
   };

   const taxaConversaoGeral = totais.cliques > 0 
     ? ((totais.conversoes / totais.cliques) * 100) 
     : 0;

   return {
     canais: canais || [],
     isLoading,
     error,
     refetch,
     createCanal,
     updateCanal,
     toggleStatus,
     deleteCanal,
     totais: {
       ...totais,
       taxaConversao: taxaConversaoGeral,
     },
   };
 }
