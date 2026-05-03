export interface CleaningEstimate {
  icon: string;
  label: string;
  qty: string;
}

export const PERIODO_INFO: Record<string, { 
  subtitle: string; 
  subprice?: string; 
  included: string[];
  cleaningEstimate?: CleaningEstimate[];
}> = {
  'Diária': {
    subtitle: 'Entregamos pela manhã e buscamos no dia seguinte pela manhã',
    included: [
      '1 Máquina extratora IPC EA135 127V',
      '2 Frascos de Shampoo para Estofados',
      '1 Escova manual',
      '1 Mangueira de Aspiração com bico para estofados',
      '1 Borrifador de pressão prévia',
      'Manual de uso fácil'
    ],
    cleaningEstimate: [
      { icon: '🛋️', label: 'Sofá Retrátil', qty: '1' },
      { icon: '🪑', label: 'Cadeiras', qty: '4' },
      { icon: '🛏️', label: 'Colchão Casal', qty: '1' },
      { icon: '🛏️', label: 'Colchão Solteiro', qty: '1' },
    ]
  },
  'Final de Semana': {
    subtitle: 'Entregamos no sábado pela manhã e buscamos na segunda pela manhã',
    included: [
      '1 Máquina extratora IPC EA135 127V',
      '2 Frascos de Shampoo para Estofados',
      '1 Escova manual',
      '1 Mangueira de Aspiração com bico para estofados',
      '1 Borrifador de pressão prévia',
      'Manual de uso fácil'
    ],
    cleaningEstimate: [
      { icon: '🛋️', label: 'Sofá Retrátil', qty: '1' },
      { icon: '🪑', label: 'Cadeiras', qty: '6' },
      { icon: '🛏️', label: 'Colchão Casal', qty: '2' },
      { icon: '🛏️', label: 'Colchão Solteiro', qty: '2' },
    ]
  },
  'Semanal': {
    subtitle: 'Entregamos no dia escolhido e buscamos ao completar uma semana',
    subprice: 'R$ 50,00 por dia',
    included: [
      '1 Máquina extratora IPC EA135 127V',
      '2 Frascos de Shampoo para Estofados',
      '1 Escova manual',
      '1 Mangueira de Aspiração com bico para estofados',
      '1 Borrifador de pressão prévia',
      'Manual de uso fácil'
    ],
    cleaningEstimate: [
      { icon: '🛋️', label: 'Sofás', qty: '2' },
      { icon: '🪑', label: 'Cadeiras', qty: '8' },
      { icon: '🛏️', label: 'Colchão Casal', qty: '3' },
      { icon: '🛏️', label: 'Colchão Solteiro', qty: '3' },
    ]
  },
  'Econômico': {
    subtitle: 'Entregamos pela manhã e buscamos no dia seguinte pela manhã',
    included: [
      '1 Máquina extratora IPC EA135 127V',
      '1 Mangueira de Aspiração com bico para estofados',
      'Manual de uso fácil'
    ],
    cleaningEstimate: [
      { icon: '🛋️', label: 'Sofá Retrátil', qty: '1' },
      { icon: '🪑', label: 'Cadeiras', qty: '2' },
    ]
  }
};
