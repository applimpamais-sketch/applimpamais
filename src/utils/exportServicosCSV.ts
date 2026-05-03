import { Servico } from '@/hooks/useServicosAdmin';
import { Aluguel } from '@/hooks/useAlugueisAdmin';

const BOM = '\uFEFF';
const SEP = ';';

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatNumber(val: number | null | undefined): string {
  if (val == null) return '';
  return String(val).replace('.', ',');
}

export function exportServicosToCSV(servicos: Servico[]) {
  const headers = [
    'ID',
    'Categoria',
    'Subcategoria',
    'Item',
    'Tamanho',
    'Preco Limpeza',
    'Preco Impermeabilizacao',
    'Preco Limpeza+Impermeabilizacao',
  ];

  const rows = servicos.map(s => [
    s.id,
    s.categoria,
    s.subcategoria,
    s.item,
    s.tamanho || '',
    formatNumber(s.preco_limpeza),
    formatNumber(s.preco_impermeabilizacao),
    formatNumber(s.preco_limpeza_impermeabilizacao),
  ]);

  const csv = [headers, ...rows].map(r => r.join(SEP)).join('\n');
  downloadCSV(csv, `servicos_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportAlugueisToCSV(alugueis: Aluguel[]) {
  const headers = ['ID', 'Equipamento', 'Periodo', 'Preco'];

  const rows = alugueis.map(a => [
    a.id,
    a.equipamento,
    a.periodo_aluguel,
    formatNumber(a.preco),
  ]);

  const csv = [headers, ...rows].map(r => r.join(SEP)).join('\n');
  downloadCSV(csv, `locacoes_${new Date().toISOString().slice(0, 10)}.csv`);
}
