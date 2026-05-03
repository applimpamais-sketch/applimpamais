export interface OrcamentoItem {
  id?: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

export interface OrcamentoData {
  numero: number;
  cliente_nome: string;
  cliente_email?: string;
  cliente_telefone?: string;
  cliente_documento?: string;
  cliente_endereco?: string;
  cliente_cidade?: string;
  empresa_nome?: string;
  itens: OrcamentoItem[];
  subtotal: number;
  desconto_tipo?: 'percentual' | 'fixo';
  desconto_valor?: number;
  valor_total: number;
  condicoes_pagamento?: string;
  observacoes?: string;
  validade_dias: number;
  data_validade?: string;
  created_at: string;
}

export type PdfTemplate = 'classic' | 'modern';

export interface PdfTemplateInfo {
  id: PdfTemplate;
  name: string;
  description: string;
  preview: string;
}

export const PDF_TEMPLATES: PdfTemplateInfo[] = [
  {
    id: 'classic',
    name: 'Clássico',
    description: 'Layout tradicional e profissional com cores sóbrias',
    preview: 'Cabeçalho com logo, blocos de informação, tabela com listras',
  },
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Design contemporâneo com acentos coloridos e visual premium',
    preview: 'Barras de destaque, gradientes sutis, total em destaque verde',
  },
];
