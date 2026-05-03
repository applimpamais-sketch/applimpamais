import { supabase } from '@/integrations/supabase/client';

// Tipos para os dados
export interface Servico {
  id: string;
  categoria: string;
  subcategoria: string;
  item: string;
  tamanho: string | null;
  preco_limpeza: number | null;
  preco_impermeabilizacao: number | null;
  preco_limpeza_impermeabilizacao: number | null;
}

export interface Aluguel {
  id: string;
  equipamento: string;
  periodo_aluguel: string;
  preco: number;
}

export interface CalendarioDisponibilidade {
  id: string;
  data: string;
  vagas_disponiveis: number;
  vagas_totais: number;
}

export interface Agendamento {
  nome_cliente: string;
  telefone: string;
  endereco: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  data_agendamento: string;
  horario?: string;
  itens_carrinho: any[];
  valor_total: number;
  cupom_codigo?: string | null;
  cupom_desconto_percentual?: number | null;
  valor_desconto?: number;
  valor_frete?: number;
  parceiro_codigo?: string | null;
  canal_origem?: string | null;
  forma_pagamento?: string | null;
}

// Função para buscar serviços (com filtro opcional de tenant para dados públicos)
export async function fetchServicos(categoria?: string, tenantId?: string | null) {
  let query = supabase.from('servicos').select('*');
  
  // Serviços são filtrados por tenant se fornecido
  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }
  
  if (categoria) {
    query = query.eq('categoria', categoria);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as Servico[];
}

// Função para buscar aluguéis (com filtro de tenant)
export async function fetchAlugueis(tenantId?: string | null) {
  let query = supabase
    .from('alugueis')
    .select('*');
  
  // Aluguéis são filtrados por tenant se fornecido
  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as Aluguel[];
}

// Função para buscar disponibilidade do calendário (com filtro de tenant)
export async function fetchCalendarioDisponibilidade(startDate: Date, endDate: Date, tenantId?: string | null) {
  let query = supabase
    .from('calendario_disponibilidade')
    .select('*')
    .gte('data', startDate.toISOString().split('T')[0])
    .lte('data', endDate.toISOString().split('T')[0])
    .order('data');
  
  // Calendário é filtrado por tenant se fornecido
  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as CalendarioDisponibilidade[];
}

// Função para criar agendamento através da edge function (bypassa RLS)
export async function createAgendamento(agendamento: Agendamento): Promise<any> {
  console.log("📝 [Agendamento] Chamando função create-public-agendamento...", {
    nome_cliente: agendamento.nome_cliente,
    data_agendamento: agendamento.data_agendamento,
    valor_total: agendamento.valor_total,
    timestamp: new Date().toISOString()
  });

  try {
    const { data, error } = await supabase.functions.invoke("create-public-agendamento", {
      body: agendamento,
    });

    if (error) {
      console.error("❌ [Agendamento] Erro na função create-public-agendamento:", {
        message: error.message,
        status: (error as any).status,
        timestamp: new Date().toISOString()
      });

      throw {
        ...error,
        source: "agendamentos",
      };
    }

    if (!data?.success || !data?.agendamento) {
      console.error("❌ [Agendamento] Resposta inválida da função:", data);
      throw {
        message: data?.error || "Erro ao criar agendamento",
        code: data?.code,
        missing_fields: data?.missing_fields,
        hint: data?.hint,
        request_id: data?.request_id,
        source: "agendamentos",
      };
    }

    console.log("✅ [Agendamento] Agendamento criado com sucesso:", {
      id: data.agendamento.id,
      nome_cliente: data.agendamento.nome_cliente,
      data_agendamento: data.agendamento.data_agendamento,
      valor_total: data.agendamento.valor_total,
      timestamp: new Date().toISOString()
    });

    return data.agendamento;
  } catch (error: any) {
    console.error("❌ [Agendamento] Erro ao criar agendamento:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      timestamp: new Date().toISOString()
    });

    throw {
      ...error,
      message: error.message || "Erro ao criar agendamento",
      source: "agendamentos",
    };
  }
}

// Função para admin criar agendamento manual (direto no banco, bypassa validações públicas)
export async function createAgendamentoManual(agendamento: Agendamento & {
  status?: string;
  tecnico_id?: string;
  origem?: string;
  criado_por?: string;
  criado_manualmente?: boolean;
  tenant_id?: string;
}): Promise<any> {
  console.log("📝 [Agendamento Manual] Criando agendamento direto no banco...", {
    nome_cliente: agendamento.nome_cliente,
    data_agendamento: agendamento.data_agendamento,
    valor_total: agendamento.valor_total,
    tenant_id: agendamento.tenant_id,
    timestamp: new Date().toISOString()
  });

  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .insert([{
        ...agendamento,
        origem: agendamento.origem || 'admin_manual',
        status: agendamento.status || 'pendente',
        criado_manualmente: agendamento.criado_manualmente !== undefined ? agendamento.criado_manualmente : true,
        // tenant_id será preenchido automaticamente pelo trigger se não informado
      }])
      .select()
      .single();

    if (error) {
      console.error("❌ [Agendamento Manual] Erro ao criar:", error);
      throw error;
    }

    console.log("✅ [Agendamento Manual] Agendamento criado com sucesso:", {
      id: data.id,
      nome_cliente: data.nome_cliente,
      timestamp: new Date().toISOString()
    });

    return data;
  } catch (error: any) {
    console.error("❌ [Agendamento Manual] Erro:", error);
    throw {
      ...error,
      message: error.message || "Erro ao criar agendamento manual",
      source: "agendamentos_manual",
    };
  }
}

// Função para inicializar calendário com disponibilidade (com tenant_id)
export async function initializeCalendario(days: number = 60, tenantId?: string | null) {
  const today = new Date();
  const slots = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    slots.push({
      data: dateStr,
      vagas_disponiveis: Math.floor(Math.random() * 11), // 0 a 10 vagas
      vagas_totais: 10,
      tenant_id: tenantId,
    });
  }
  
  // Inserir dados (ignora se já existirem)
  const { error } = await supabase
    .from('calendario_disponibilidade')
    .upsert(slots, { onConflict: 'data', ignoreDuplicates: true });
  
  if (error) console.error('Erro ao inicializar calendário:', error);
}
