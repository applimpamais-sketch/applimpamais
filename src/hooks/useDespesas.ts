import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenantContext } from "@/hooks/useTenantContext";

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data_despesa: string;
  categoria: string;
  status: string;
  forma_pagamento?: string;
  comprovante_url?: string;
  observacoes?: string;
  recorrente?: boolean;
  servico_relacionado?: string;
  rateio_percentual?: number;
  origem?: 'manual' | 'whatsapp';
  created_by?: string;
  created_by_profile?: {
    nome_completo: string;
  };
  created_at: string;
  updated_at: string;
}

interface DespesaInput {
  descricao: string;
  valor: number;
  data_despesa: string;
  categoria: string;
  status: string;
  forma_pagamento?: string;
  comprovante_url?: string;
  observacoes?: string;
  recorrente?: boolean;
  servico_relacionado?: string;
  rateio_percentual?: number;
  origem?: 'manual' | 'whatsapp';
}

export interface DespesasFilters {
  categoria?: string;
  status?: string;
  dataInicio?: Date;
  dataFim?: Date;
  search?: string;
  origem?: 'manual' | 'whatsapp';
  formaPagamento?: string;
}

export function useDespesas(filters?: DespesasFilters) {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  const query = useQuery({
    queryKey: ["despesas", filters, tenantId],
    queryFn: async () => {
      // SEGURANÇA: Não executar sem tenant
      if (!tenantId) {
        console.warn('[useDespesas] Sem tenantId - retornando vazio');
        return [];
      }

      let query = supabase
        .from("despesas" as any)
        .select("*")
        .eq("tenant_id", tenantId) // FILTRO TENANT
        .order("data_despesa", { ascending: false });

      if (filters?.categoria) {
        query = query.eq("categoria", filters.categoria);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.dataInicio) {
        query = query.gte("data_despesa", filters.dataInicio.toISOString());
      }

      if (filters?.dataFim) {
        query = query.lte("data_despesa", filters.dataFim.toISOString());
      }

      if (filters?.search) {
        query = query.ilike("descricao", `%${filters.search}%`);
      }

      if (filters?.origem) {
        query = query.eq("origem", filters.origem);
      }

      if (filters?.formaPagamento) {
        query = query.eq("forma_pagamento", filters.formaPagamento);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Erro ao buscar despesas:", error);
        throw error;
      }

      const despesasArray = (data || []) as unknown as Despesa[];
      
      // Enriquecer com nomes dos criadores
      const creatorIds = [...new Set(despesasArray.filter(d => d.created_by).map(d => d.created_by!))];
      let profilesMap: Record<string, string> = {};
      
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, nome_completo")
          .in("id", creatorIds);
        
        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map(p => [p.id, p.nome_completo]));
        }
      }
      
      const enriched = despesasArray.map(d => ({
        ...d,
        created_by_profile: d.created_by && profilesMap[d.created_by] 
          ? { nome_completo: profilesMap[d.created_by] } 
          : undefined,
      }));

      console.log("✅ Despesas carregadas:", enriched.length, "despesas");
      
      return enriched;
    },
    enabled: !!tenantId, // Só executar se tiver tenant
  });

  const createMutation = useMutation({
    mutationFn: async (despesa: DespesaInput) => {
      if (!tenantId) throw new Error('[SECURITY] Criar despesa sem tenantId');
      
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("despesas" as any)
        .insert({
          ...despesa,
          tenant_id: tenantId, // INCLUIR TENANT
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-financeiro"] });
      toast.success("Despesa criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar despesa: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, despesa }: { id: string; despesa: Partial<DespesaInput> }) => {
      if (!tenantId) throw new Error('[SECURITY] Atualizar despesa sem tenantId');
      
      const { data, error } = await supabase
        .from("despesas" as any)
        .update(despesa)
        .eq("id", id)
        .eq("tenant_id", tenantId) // FILTRO TENANT
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-financeiro"] });
      toast.success("Despesa atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar despesa: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!tenantId) throw new Error('[SECURITY] Deletar despesa sem tenantId');
      
      const { error } = await supabase
        .from("despesas" as any)
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenantId); // FILTRO TENANT

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-financeiro"] });
      toast.success("Despesa excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir despesa: ${error.message}`);
    },
  });

  const uploadComprovante = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("comprovantes-despesas")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("comprovantes-despesas")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  return {
    despesas: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createDespesa: createMutation.mutate,
    updateDespesa: updateMutation.mutate,
    deleteDespesa: deleteMutation.mutate,
    uploadComprovante,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useDespesasStats(filters?: DespesasFilters) {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ["despesas-stats", filters, tenantId],
    queryFn: async () => {
      // SEGURANÇA: Não executar sem tenant
      if (!tenantId) {
        return { total: 0, pendentes: 0, pagas: 0, vencidas: 0, quantidade: 0 };
      }

      let query = supabase
        .from("despesas" as any)
        .select("*")
        .eq("tenant_id", tenantId); // FILTRO TENANT

      // Aplicar filtros de data somente se especificados pelo usuário
      if (filters?.dataInicio) {
        query = query.gte("data_despesa", filters.dataInicio.toISOString());
      }

      if (filters?.dataFim) {
        query = query.lte("data_despesa", filters.dataFim.toISOString());
      }

      // Aplicar outros filtros se existirem
      if (filters?.categoria) {
        query = query.eq("categoria", filters.categoria);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.origem) {
        query = query.eq("origem", filters.origem);
      }
      if (filters?.formaPagamento) {
        query = query.eq("forma_pagamento", filters.formaPagamento);
      }

      const { data: despesas, error } = await query;

      if (error) throw error;

      const despesasArray = (despesas || []) as unknown as Despesa[];

      const total = despesasArray.reduce((sum, d) => sum + Number(d.valor), 0);
      const pendentes = despesasArray.filter(d => d.status === "pendente").reduce((sum, d) => sum + Number(d.valor), 0);
      const pagas = despesasArray.filter(d => d.status === "paga").reduce((sum, d) => sum + Number(d.valor), 0);
      const vencidas = despesasArray.filter(d => d.status === "vencida").reduce((sum, d) => sum + Number(d.valor), 0);

      return {
        total,
        pendentes,
        pagas,
        vencidas,
        quantidade: despesasArray.length,
      };
    },
    enabled: !!tenantId, // Só executar se tiver tenant
  });
}
