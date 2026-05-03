import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServicoIARC {
  id: string;
  categoria: string;
  subcategoria: string;
  item: string;
  tamanho: string | null;
  preco_limpeza: number | null;
  preco_impermeabilizacao: number | null;
}

export interface ServicoAgrupado {
  subcategoria: string;
  itens: ServicoIARC[];
}

export interface CategoriaAgrupada {
  categoria: string;
  subcategorias: ServicoAgrupado[];
}

function groupByCategoria(servicos: ServicoIARC[]): CategoriaAgrupada[] {
  const grouped = new Map<string, Map<string, ServicoIARC[]>>();
  
  for (const servico of servicos) {
    if (!grouped.has(servico.categoria)) {
      grouped.set(servico.categoria, new Map());
    }
    const categoriaMap = grouped.get(servico.categoria)!;
    if (!categoriaMap.has(servico.subcategoria)) {
      categoriaMap.set(servico.subcategoria, []);
    }
    categoriaMap.get(servico.subcategoria)!.push(servico);
  }
  
  return Array.from(grouped.entries()).map(([categoria, subcategorias]) => ({
    categoria,
    subcategorias: Array.from(subcategorias.entries()).map(([subcategoria, itens]) => ({
      subcategoria,
      itens: itens.sort((a, b) => a.item.localeCompare(b.item))
    }))
  }));
}

function getItensUnicos(servicos: ServicoIARC[]): ServicoIARC[] {
  const uniqueMap = new Map<string, ServicoIARC>();
  
  for (const servico of servicos) {
    // Usa subcategoria como chave para pegar apenas um item de cada tipo
    const key = `${servico.categoria}-${servico.subcategoria}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, servico);
    } else {
      // Se já existe, pegar o item com o preço mais representativo (não nulo)
      const existing = uniqueMap.get(key)!;
      if (!existing.preco_limpeza && servico.preco_limpeza) {
        uniqueMap.set(key, servico);
      }
    }
  }
  
  return Array.from(uniqueMap.values());
}

export function useServicosParaIARC() {
  return useQuery({
    queryKey: ['servicos-iarc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicos')
        .select('id, categoria, subcategoria, item, tamanho, preco_limpeza, preco_impermeabilizacao')
        .order('categoria, subcategoria, item');
      
      if (error) {
        console.error('Erro ao buscar serviços para IARC:', error);
        throw error;
      }
      
      return data as ServicoIARC[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useServicosAgrupadosIARC() {
  const { data: servicos, ...rest } = useServicosParaIARC();
  
  const agrupados = servicos ? groupByCategoria(servicos) : [];
  const itensUnicos = servicos ? getItensUnicos(servicos) : [];
  
  return {
    ...rest,
    servicos,
    agrupados,
    itensUnicos,
  };
}
