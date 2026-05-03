import type { Servico, Aluguel } from '@/services/api';

export function calculateServicePrice(
  servico: Servico,
  serviceType: 'limpeza' | 'impermeabilizacao' | 'ambos'
): number {
  if (serviceType === 'limpeza' && servico.preco_limpeza) {
    return servico.preco_limpeza;
  }
  
  if (serviceType === 'impermeabilizacao' && servico.preco_impermeabilizacao) {
    return servico.preco_impermeabilizacao;
  }
  
  if (serviceType === 'ambos' && servico.preco_limpeza_impermeabilizacao) {
    return servico.preco_limpeza_impermeabilizacao;
  }
  
  return 0;
}

export function findServico(
  servicos: Servico[],
  subcategoria: string,
  item: string,
  tamanho?: string | null
): Servico | undefined {
  return servicos.find(s => {
    const matchSubcategoria = s.subcategoria === subcategoria;
    const matchItem = s.item === item;
    const matchTamanho = !tamanho || s.tamanho === tamanho || !s.tamanho;
    
    return matchSubcategoria && matchItem && matchTamanho;
  });
}

export function findAluguel(
  alugueis: Aluguel[],
  equipamento: string,
  periodo: string
): Aluguel | undefined {
  return alugueis.find(a => 
    a.equipamento === equipamento && a.periodo_aluguel === periodo
  );
}
