import { Servico } from '@/hooks/useServicosAdmin';
import { Aluguel } from '@/hooks/useAlugueisAdmin';

const SEP = ';';

function parseNumber(val: string): number | null {
  if (!val || val.trim() === '') return null;
  const num = Number(val.trim().replace(',', '.'));
  return isNaN(num) ? null : num;
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'UTF-8');
  });
}

function parseCSVLines(text: string): string[][] {
  // Remove BOM if present
  const clean = text.replace(/^\uFEFF/, '');
  return clean
    .split(/\r?\n/)
    .filter(line => line.trim() !== '')
    .map(line => line.split(SEP).map(cell => cell.trim()));
}

export interface ServicoChange {
  id: string;
  categoria: string;
  subcategoria: string;
  item: string;
  tamanho: string | null;
  preco_limpeza: number | null;
  preco_impermeabilizacao: number | null;
  preco_limpeza_impermeabilizacao: number | null;
  changes: {
    field: string;
    oldValue: number | null;
    newValue: number | null;
  }[];
}

export interface AluguelChange {
  id: string;
  equipamento: string;
  periodo_aluguel: string;
  preco: number;
  changes: {
    field: string;
    oldValue: number;
    newValue: number;
  }[];
}

export interface ImportResult<T> {
  updates: T[];
  errors: string[];
  skipped: number;
}

export async function parseServicosCSV(
  file: File,
  existingServicos: Servico[]
): Promise<ImportResult<ServicoChange>> {
  const text = await readFileAsText(file);
  const lines = parseCSVLines(text);

  if (lines.length < 2) {
    return { updates: [], errors: ['Arquivo vazio ou sem dados'], skipped: 0 };
  }

  // Skip header
  const dataLines = lines.slice(1);
  const errors: string[] = [];
  const updates: ServicoChange[] = [];
  let skipped = 0;

  const existingMap = new Map(existingServicos.map(s => [s.id, s]));

  for (let i = 0; i < dataLines.length; i++) {
    const row = dataLines[i];
    const lineNum = i + 2;

    if (row.length < 8) {
      errors.push(`Linha ${lineNum}: número de colunas insuficiente (${row.length}/8)`);
      continue;
    }

    const [id, categoria, subcategoria, item, tamanho, precoLimpStr, precoImpStr, precoLIStr] = row;

    if (!id) {
      errors.push(`Linha ${lineNum}: ID vazio`);
      continue;
    }

    const existing = existingMap.get(id);
    if (!existing) {
      errors.push(`Linha ${lineNum}: ID "${id}" não encontrado`);
      skipped++;
      continue;
    }

    const precoLimpeza = parseNumber(precoLimpStr);
    const precoImpermeabilizacao = parseNumber(precoImpStr);
    const precoLI = parseNumber(precoLIStr);

    const changes: ServicoChange['changes'] = [];

    if (precoLimpeza !== existing.preco_limpeza) {
      changes.push({ field: 'Preço Limpeza', oldValue: existing.preco_limpeza, newValue: precoLimpeza });
    }
    if (precoImpermeabilizacao !== existing.preco_impermeabilizacao) {
      changes.push({ field: 'Preço Impermeabilização', oldValue: existing.preco_impermeabilizacao, newValue: precoImpermeabilizacao });
    }
    if (precoLI !== existing.preco_limpeza_impermeabilizacao) {
      changes.push({ field: 'Preço Limp+Imp', oldValue: existing.preco_limpeza_impermeabilizacao, newValue: precoLI });
    }

    if (changes.length > 0) {
      updates.push({
        id,
        categoria,
        subcategoria,
        item,
        tamanho: tamanho || null,
        preco_limpeza: precoLimpeza,
        preco_impermeabilizacao: precoImpermeabilizacao,
        preco_limpeza_impermeabilizacao: precoLI,
        changes,
      });
    } else {
      skipped++;
    }
  }

  return { updates, errors, skipped };
}

export async function parseAlugueisCSV(
  file: File,
  existingAlugueis: Aluguel[]
): Promise<ImportResult<AluguelChange>> {
  const text = await readFileAsText(file);
  const lines = parseCSVLines(text);

  if (lines.length < 2) {
    return { updates: [], errors: ['Arquivo vazio ou sem dados'], skipped: 0 };
  }

  const dataLines = lines.slice(1);
  const errors: string[] = [];
  const updates: AluguelChange[] = [];
  let skipped = 0;

  const existingMap = new Map(existingAlugueis.map(a => [a.id, a]));

  for (let i = 0; i < dataLines.length; i++) {
    const row = dataLines[i];
    const lineNum = i + 2;

    if (row.length < 4) {
      errors.push(`Linha ${lineNum}: número de colunas insuficiente (${row.length}/4)`);
      continue;
    }

    const [id, equipamento, periodo, precoStr] = row;

    if (!id) {
      errors.push(`Linha ${lineNum}: ID vazio`);
      continue;
    }

    const existing = existingMap.get(id);
    if (!existing) {
      errors.push(`Linha ${lineNum}: ID "${id}" não encontrado`);
      skipped++;
      continue;
    }

    const preco = parseNumber(precoStr);
    if (preco === null) {
      errors.push(`Linha ${lineNum}: preço inválido "${precoStr}"`);
      continue;
    }

    const changes: AluguelChange['changes'] = [];
    if (preco !== existing.preco) {
      changes.push({ field: 'Preço', oldValue: existing.preco, newValue: preco });
    }

    if (changes.length > 0) {
      updates.push({ id, equipamento, periodo_aluguel: periodo, preco, changes });
    } else {
      skipped++;
    }
  }

  return { updates, errors, skipped };
}
