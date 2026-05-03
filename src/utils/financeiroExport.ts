import { exportToExcel, exportToPDF, formatCurrencyForExport, formatDateForExport } from './exportHelpers';
import { CATEGORIAS_DESPESAS, STATUS_DESPESA, FORMAS_PAGAMENTO, CATEGORIAS_RECEITA } from './financeiroHelpers';

// ===== DESPESAS =====

export function exportDespesasToExcel(despesas: any[]) {
  const headers = ['Data', 'Descrição', 'Categoria', 'Valor', 'Status', 'Forma Pagamento', 'Origem', 'Observações'];
  const rows = despesas.map(d => [
    formatDateForExport(d.data_despesa),
    d.descricao,
    CATEGORIAS_DESPESAS.find(c => c.value === d.categoria)?.label || d.categoria,
    formatCurrencyForExport(d.valor),
    STATUS_DESPESA.find(s => s.value === d.status)?.label || d.status,
    FORMAS_PAGAMENTO.find(f => f.value === d.forma_pagamento)?.label || d.forma_pagamento || '-',
    d.origem === 'whatsapp' ? 'WhatsApp' : 'Manual',
    d.observacoes || '',
  ]);
  exportToExcel({ headers, rows, fileName: `despesas_${new Date().toISOString().slice(0, 10)}` });
}

export function exportDespesasToPDF(despesas: any[]) {
  const headers = ['Data', 'Descrição', 'Categoria', 'Valor', 'Status', 'Forma Pgto', 'Origem'];
  const rows = despesas.map(d => [
    formatDateForExport(d.data_despesa),
    d.descricao,
    CATEGORIAS_DESPESAS.find(c => c.value === d.categoria)?.label || d.categoria,
    formatCurrencyForExport(d.valor),
    STATUS_DESPESA.find(s => s.value === d.status)?.label || d.status,
    FORMAS_PAGAMENTO.find(f => f.value === d.forma_pagamento)?.label || d.forma_pagamento || '-',
    d.origem === 'whatsapp' ? 'WhatsApp' : 'Manual',
  ]);
  exportToPDF({ headers, rows, fileName: `despesas_${new Date().toISOString().slice(0, 10)}`, title: 'Relatório de Despesas' });
}

// ===== RECEITAS =====

export function exportReceitasToExcel(agendamentos: any[]) {
  const headers = ['Data', 'Cliente', 'Telefone', 'Categoria', 'Valor Total', 'Valor Pago', 'Saldo Pendente', 'Status', 'Origem'];
  const rows = agendamentos.map(a => [
    formatDateForExport(a.data_agendamento),
    a.nome_cliente,
    a.telefone,
    CATEGORIAS_RECEITA.find(c => c.value === a.categoria_receita)?.label || a.categoria_receita || '-',
    formatCurrencyForExport(a.valor_total),
    formatCurrencyForExport(a.valor_pago || 0),
    formatCurrencyForExport(a.saldo_pendente || 0),
    a.status_pagamento || '-',
    a.origem === 'whatsapp' ? 'WhatsApp' : a.origem === 'manual' ? 'Manual' : 'Site',
  ]);
  exportToExcel({ headers, rows, fileName: `receitas_${new Date().toISOString().slice(0, 10)}` });
}

export function exportReceitasToPDF(agendamentos: any[]) {
  const headers = ['Data', 'Cliente', 'Categoria', 'Valor Total', 'Valor Pago', 'Saldo', 'Status'];
  const rows = agendamentos.map(a => [
    formatDateForExport(a.data_agendamento),
    a.nome_cliente,
    CATEGORIAS_RECEITA.find(c => c.value === a.categoria_receita)?.label || a.categoria_receita || '-',
    formatCurrencyForExport(a.valor_total),
    formatCurrencyForExport(a.valor_pago || 0),
    formatCurrencyForExport(a.saldo_pendente || 0),
    a.status_pagamento || '-',
  ]);
  exportToPDF({ headers, rows, fileName: `receitas_${new Date().toISOString().slice(0, 10)}`, title: 'Relatório de Receitas' });
}
