import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  invalid: number;
  total_processed: number;
  batch_id: string;
  columns_detected: {
    keyword: boolean;
    volume: boolean;
    competition: boolean;
    cpc: boolean;
  };
  cluster_summary: Record<string, number>;
  top_opportunities: Array<{
    keyword: string;
    volume: number;
    opportunity: number;
    competition: string;
    cluster: string;
  }>;
}

export interface PreviewKeyword {
  keyword: string;
  volume: number;
  competition: string;
  cpc: number | null;
  intent: string;
  cluster: string;
  funnelStage: string;
  city: string | null;
  status: 'ok' | 'duplicate' | 'invalid';
}

// Preview CSV parsing (client-side for fast preview)
export function parseCSVPreview(csvContent: string): {
  headers: string[];
  keywords: PreviewKeyword[];
  columnsDetected: {
    keyword: number;
    volume: number;
    competition: number;
    cpc: number;
  };
} {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) {
    return { headers: [], keywords: [], columnsDetected: { keyword: -1, volume: -1, competition: -1, cpc: -1 } };
  }
  
  // Parse headers
  const headers = parseCSVLine(lines[0]);
  
  // Find column indices
  const COLUMN_MAPPINGS = {
    keyword: ['Keyword', 'keyword', 'Palavra-chave', 'palavra-chave', 'Term', 'Termo', 'Keywords'],
    volume: ['Avg. monthly searches', 'Avg. Monthly Searches', 'Média de pesquisas mensais', 'Search Volume', 'Volume de busca'],
    competition: ['Competition', 'Concorrência', 'Comp.'],
    cpc: ['Top of page bid (low range)', 'Top of page bid (high range)', 'CPC', 'Lance'],
  };
  
  const findIndex = (names: string[]) => {
    for (const name of names) {
      const idx = headers.findIndex(h => 
        h.toLowerCase().includes(name.toLowerCase())
      );
      if (idx !== -1) return idx;
    }
    return -1;
  };
  
  const keywordIdx = findIndex(COLUMN_MAPPINGS.keyword);
  const volumeIdx = findIndex(COLUMN_MAPPINGS.volume);
  const competitionIdx = findIndex(COLUMN_MAPPINGS.competition);
  const cpcIdx = findIndex(COLUMN_MAPPINGS.cpc);
  
  const keywords: PreviewKeyword[] = [];
  const seen = new Set<string>();
  
  // Parse first 100 rows for preview
  for (let i = 1; i < Math.min(lines.length, 101); i++) {
    const row = parseCSVLine(lines[i]);
    const keyword = row[keywordIdx]?.trim() || '';
    
    if (!keyword || keyword.length < 3) {
      keywords.push({
        keyword: keyword || '(vazio)',
        volume: 0,
        competition: 'medium',
        cpc: null,
        intent: 'info',
        cluster: 'outros',
        funnelStage: 'topo',
        city: null,
        status: 'invalid',
      });
      continue;
    }
    
    const normalizedKeyword = keyword.toLowerCase();
    if (seen.has(normalizedKeyword)) {
      keywords.push({
        keyword,
        volume: 0,
        competition: 'medium',
        cpc: null,
        intent: 'info',
        cluster: 'outros',
        funnelStage: 'topo',
        city: null,
        status: 'duplicate',
      });
      continue;
    }
    seen.add(normalizedKeyword);
    
    const volume = volumeIdx !== -1 ? parseVolume(row[volumeIdx]) : 0;
    const competition = competitionIdx !== -1 ? parseCompetition(row[competitionIdx]) : 'medium';
    const cpc = cpcIdx !== -1 ? parseCPC(row[cpcIdx]) : null;
    const intent = detectIntent(keyword);
    const cluster = detectCluster(keyword);
    const city = detectCity(keyword);
    const funnelStage = detectFunnelStage(keyword, intent);
    
    keywords.push({
      keyword,
      volume,
      competition,
      cpc,
      intent,
      cluster,
      funnelStage,
      city,
      status: 'ok',
    });
  }
  
  return {
    headers,
    keywords,
    columnsDetected: {
      keyword: keywordIdx,
      volume: volumeIdx,
      competition: competitionIdx,
      cpc: cpcIdx,
    },
  };
}

function parseCSVLine(line: string): string[] {
  const row: string[] = [];
  let field = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(field.trim());
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field.trim());
  return row;
}

function parseVolume(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d.,K]/gi, '').trim();
  if (!cleaned) return 0;
  if (cleaned.toUpperCase().includes('K')) {
    return Math.round(parseFloat(cleaned.replace(/K/i, '')) * 1000);
  }
  if (cleaned.includes('-')) {
    const [min, max] = cleaned.split('-').map(s => parseInt(s.replace(/\D/g, '')));
    return Math.round((min + max) / 2);
  }
  return parseInt(cleaned.replace(/\D/g, '')) || 0;
}

function parseCompetition(value: string): string {
  if (!value) return 'medium';
  const lower = value.toLowerCase().trim();
  if (lower === 'low' || lower === 'baixa' || lower === 'baixo') return 'low';
  if (lower === 'high' || lower === 'alta' || lower === 'alto') return 'high';
  return 'medium';
}

function parseCPC(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.').trim();
  return cleaned ? parseFloat(cleaned) : null;
}

const CIDADES = [
  'belo horizonte', 'bh', 'contagem', 'betim', 'santa luzia', 'ibirité', 
  'sabará', 'nova lima', 'ribeirão das neves', 'vespasiano', 'lagoa santa'
];

function detectIntent(keyword: string): string {
  const kw = keyword.toLowerCase();
  if (/^(como|o que|quando|onde|por que|qual|quanto)/.test(kw) || kw.includes('?')) return 'question';
  if (/(pre[çc]o|valor|custo|quanto custa|or[çc]amento|contratar|agendar|comprar|empresa)/.test(kw)) return 'transacional';
  if (/(vs|versus| ou |melhor|comparar|diferen[çc]a|vale a pena)/.test(kw)) return 'comparativo';
  if (CIDADES.some(c => kw.includes(c)) || /(perto|regi[ãa]o|bairro| em bh| belo horizonte)/.test(kw)) return 'local';
  return 'info';
}

const CLUSTER_PATTERNS: Record<string, RegExp[]> = {
  sofa: [/sof[áa]/i, /estofado/i, /chaise/i],
  colchao: [/colch[ãa]o/i, /cama /i],
  poltrona: [/poltrona/i, /puff/i, /div[ãa]/i],
  tapete: [/tapete/i, /carpete/i, /passadeira/i],
  carro: [/carro/i, /automotiv/i, /ve[íi]culo/i],
  bebe: [/beb[êe]/i, /carrinho/i, /cadeirinha/i],
  aluguel: [/extratora/i, /alugu/i, /loca[çc][ãa]o/i],
};

function detectCluster(keyword: string): string {
  const kw = keyword.toLowerCase();
  for (const [cluster, regexes] of Object.entries(CLUSTER_PATTERNS)) {
    if (regexes.some(r => r.test(kw))) return cluster;
  }
  return 'outros';
}

function detectCity(keyword: string): string | null {
  const kw = keyword.toLowerCase();
  if (kw.includes('belo horizonte') || kw.includes(' bh')) return 'Belo Horizonte';
  for (const cidade of CIDADES) {
    if (cidade !== 'bh' && kw.includes(cidade)) {
      return cidade.charAt(0).toUpperCase() + cidade.slice(1);
    }
  }
  return null;
}

function detectFunnelStage(keyword: string, intent: string): string {
  const kw = keyword.toLowerCase();
  if (intent === 'transacional' || /(contratar|agendar|or[çc]amento|empresa|pre[çc]o)/.test(kw)) return 'fundo';
  if (intent === 'comparativo' || intent === 'local' || /(melhor|vale a pena)/.test(kw)) return 'meio';
  return 'topo';
}

export function useBlogImport() {
  const queryClient = useQueryClient();
  
  const importKeywords = useMutation({
    mutationFn: async (csvContent: string): Promise<ImportResult> => {
      const { data, error } = await supabase.functions.invoke('blog-import-planner', {
        body: { csv: csvContent },
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data as ImportResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blog-keywords'] });
      queryClient.invalidateQueries({ queryKey: ['blog-keywords-count'] });
      queryClient.invalidateQueries({ queryKey: ['blog-keywords-stats'] });
      queryClient.invalidateQueries({ queryKey: ['blog-keywords-top-opportunity'] });
      toast.success(`${data.imported} keywords importadas com sucesso!`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao importar: ${error.message}`);
    },
  });
  
  return { 
    importKeywords,
    isImporting: importKeywords.isPending,
    parseCSVPreview,
  };
}
