// Script para gerar planilha Excel do catálogo
// Execute: node generate-catalog-excel.js

const XLSX = require('xlsx');
const fs = require('fs');

// Ler o catálogo JSON
const catalogoData = JSON.parse(fs.readFileSync('./CATALOGO_SERVICOS_BOT.json', 'utf8'));

// Função para formatar moeda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Preparar dados dos serviços
const servicosRows = catalogoData.servicos.map(servico => [
  servico.subcategoria,
  servico.item,
  servico.tamanho || '-',
  servico.preco_limpeza ? formatCurrency(servico.preco_limpeza) : '-',
  servico.preco_impermeabilizacao ? formatCurrency(servico.preco_impermeabilizacao) : '-',
  servico.preco_limpeza_impermeabilizacao ? formatCurrency(servico.preco_limpeza_impermeabilizacao) : '-'
]);

// Preparar dados dos aluguéis
const alugueisRows = catalogoData.alugueis.map(aluguel => [
  'Aluguel',
  aluguel.equipamento,
  aluguel.periodo_aluguel,
  formatCurrency(aluguel.preco),
  '-',
  '-'
]);

// Headers
const headers = [
  'Categoria',
  'Serviço/Equipamento',
  'Tamanho/Período',
  'Preço Limpeza',
  'Preço Impermeabilização',
  'Preço Limpeza + Impermeabilização'
];

// Criar workbook
const wb = XLSX.utils.book_new();

// Sheet 1: Serviços
const wsServicos = XLSX.utils.aoa_to_sheet([
  headers,
  ...servicosRows
]);

// Ajustar largura das colunas
wsServicos['!cols'] = [
  { wch: 25 }, // Categoria
  { wch: 30 }, // Serviço
  { wch: 20 }, // Tamanho
  { wch: 18 }, // Preço Limpeza
  { wch: 25 }, // Preço Impermeabilização
  { wch: 30 }  // Preço Completo
];

XLSX.utils.book_append_sheet(wb, wsServicos, 'Serviços');

// Sheet 2: Aluguéis
const wsAlugueis = XLSX.utils.aoa_to_sheet([
  headers,
  ...alugueisRows
]);

wsAlugueis['!cols'] = [
  { wch: 25 },
  { wch: 30 },
  { wch: 20 },
  { wch: 18 },
  { wch: 25 },
  { wch: 30 }
];

XLSX.utils.book_append_sheet(wb, wsAlugueis, 'Aluguéis');

// Sheet 3: Resumo
const resumoData = [
  ['Catálogo de Serviços - RC Limpa Mais'],
  [''],
  ['Exportado em:', new Date().toLocaleString('pt-BR')],
  ['Total de Serviços:', catalogoData.meta.total_servicos],
  ['Total de Aluguéis:', catalogoData.meta.total_alugueis],
  ['Total de Subcategorias:', catalogoData.meta.total_subcategorias],
  ['Versão do Catálogo:', catalogoData.meta.versao_catalogo],
  [''],
  ['Categorias Disponíveis:'],
  ...catalogoData.categorias.map(cat => ['', cat])
];

const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
wsResumo['!cols'] = [{ wch: 30 }, { wch: 50 }];

XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

// Salvar arquivo
const fileName = `catalogo-rc-limpa-mais-${new Date().toISOString().split('T')[0]}.xlsx`;
XLSX.writeFile(wb, fileName);

console.log(`✅ Planilha gerada com sucesso: ${fileName}`);
console.log(`📊 ${catalogoData.meta.total_servicos} serviços e ${catalogoData.meta.total_alugueis} aluguéis exportados`);
