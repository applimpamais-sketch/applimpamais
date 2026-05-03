import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lista de cidades atendidas para detecção local
const CIDADES = [
  'belo horizonte', 'bh', 'contagem', 'betim', 'santa luzia', 'ibirité', 
  'sabará', 'nova lima', 'ribeirão das neves', 'vespasiano', 'lagoa santa',
  'pedro leopoldo', 'esmeraldas', 'caeté', 'brumadinho', 'sarzedo'
];

// Mapeamento de colunas do Google Keyword Planner (PT/EN)
const COLUMN_MAPPINGS = {
  keyword: ['Keyword', 'keyword', 'Palavra-chave', 'palavra-chave', 'Term', 'Termo', 'Keywords'],
  volume: ['Avg. monthly searches', 'Avg. Monthly Searches', 'Média de pesquisas mensais', 'Search Volume', 'Volume de busca', 'Pesquisas mensais'],
  competition: ['Competition', 'Concorrência', 'Comp.', 'Competição', 'Nível de concorrência'],
  cpc: ['Top of page bid (low range)', 'Top of page bid (high range)', 'CPC', 'Lance', 'Lance de topo'],
};

// Padrões de clusters para detecção
const CLUSTER_PATTERNS: Record<string, RegExp[]> = {
  sofa: [/sof[áa]/i, /estofado/i, /chaise/i],
  colchao: [/colch[ãa]o/i, /cama /i],
  poltrona: [/poltrona/i, /puff/i, /div[ãa]/i, /banco estofado/i],
  cadeira: [/cadeira/i],
  tapete: [/tapete/i, /carpete/i, /passadeira/i],
  carro: [/carro/i, /automotiv/i, /ve[íi]culo/i, /banco do carro/i, /interno carro/i],
  bebe: [/beb[êe]/i, /carrinho/i, /cadeirinha/i, /ber[çc]o/i],
  aluguel: [/extratora/i, /alugu/i, /loca[çc][ãa]o/i, /alugar/i],
  impermeabilizacao: [/impermeabiliz/i],
  cortina: [/cortina/i, /persiana/i, /blecaute/i],
};

function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
  const result: string[][] = [];
  
  for (const line of lines) {
    // Parse CSV properly handling quoted fields
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
    result.push(row);
  }
  
  return result;
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => 
      h.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(h.toLowerCase())
    );
    if (index !== -1) return index;
  }
  return -1;
}

function parseVolume(value: string): number {
  if (!value) return 0;
  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleaned = value.replace(/[^\d.,K]/gi, '').trim();
  if (!cleaned) return 0;
  
  // Handle "1K", "10K" notation
  if (cleaned.toUpperCase().includes('K')) {
    return Math.round(parseFloat(cleaned.replace(/K/i, '')) * 1000);
  }
  
  // Handle ranges like "100-1000" -> take average
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

function detectIntent(keyword: string): string {
  const kw = keyword.toLowerCase();
  
  // Perguntas (Featured Snippet potential)
  if (/^(como|o que|quando|onde|por que|qual|quanto)/.test(kw) || kw.includes('?')) {
    return 'question';
  }
  
  // Comercial / Transacional
  if (/(pre[çc]o|valor|custo|quanto custa|or[çc]amento|contratar|agendar|comprar|empresa|servi[çc]o)/.test(kw)) {
    return 'transacional';
  }
  
  // Comparativo
  if (/(vs|versus| ou |melhor|comparar|diferen[çc]a|vale a pena)/.test(kw)) {
    return 'comparativo';
  }
  
  // Local
  if (CIDADES.some(c => kw.includes(c)) || /(perto|regi[ãa]o|bairro| em bh| belo horizonte)/.test(kw)) {
    return 'local';
  }
  
  // Default: Informacional
  return 'info';
}

function detectCluster(keyword: string): string {
  const kw = keyword.toLowerCase();
  
  for (const [cluster, regexes] of Object.entries(CLUSTER_PATTERNS)) {
    if (regexes.some(r => r.test(kw))) {
      return cluster;
    }
  }
  
  return 'outros';
}

function detectCity(keyword: string): string | null {
  const kw = keyword.toLowerCase();
  
  if (kw.includes('belo horizonte') || kw.includes(' bh')) {
    return 'Belo Horizonte';
  }
  
  for (const cidade of CIDADES) {
    if (cidade !== 'bh' && kw.includes(cidade)) {
      return cidade.charAt(0).toUpperCase() + cidade.slice(1);
    }
  }
  
  return null;
}

function detectFunnelStage(keyword: string, intent: string): string {
  const kw = keyword.toLowerCase();
  
  // Fundo de funil - intenção de compra
  if (intent === 'transacional' || 
      /(contratar|agendar|or[çc]amento|empresa|pre[çc]o|quanto custa)/.test(kw)) {
    return 'fundo';
  }
  
  // Meio de funil - comparação e consideração
  if (intent === 'comparativo' || intent === 'local' ||
      /(melhor|vale a pena|diferença|vantagem|desvantagem)/.test(kw)) {
    return 'meio';
  }
  
  // Topo de funil - informacional
  return 'topo';
}

function calculatePriorityScore(
  keyword: string,
  volume: number,
  competition: string,
  intent: string
): { difficulty: number; opportunity: number } {
  // Volume Score (0-40)
  let volumeScore = 0;
  if (volume >= 5000) volumeScore = 40;
  else if (volume >= 1000) volumeScore = 35;
  else if (volume >= 500) volumeScore = 30;
  else if (volume >= 100) volumeScore = 20;
  else if (volume >= 10) volumeScore = 15;
  else volumeScore = 10;
  
  // Competition Score (0-30)
  let compScore = 0;
  if (competition === 'low') compScore = 30;
  else if (competition === 'medium') compScore = 15;
  else compScore = 5;
  
  // Intent Score (0-20)
  let intentScore = 0;
  if (intent === 'transacional') intentScore = 20;
  else if (intent === 'local') intentScore = 18;
  else if (intent === 'comparativo') intentScore = 12;
  else if (intent === 'question') intentScore = 10;
  else intentScore = 5;
  
  // Long-tail Bonus (0-10)
  const wordCount = keyword.split(/\s+/).length;
  const longTailBonus = Math.min(wordCount * 2, 10);
  
  const opportunity = Math.min(volumeScore + compScore + intentScore + longTailBonus, 100);
  
  // Difficulty calculation
  let difficulty = 50;
  if (competition === 'high') difficulty = 75;
  else if (competition === 'medium') difficulty = 50;
  else difficulty = 25;
  difficulty -= longTailBonus;
  
  return {
    difficulty: Math.max(10, Math.min(90, difficulty)),
    opportunity: Math.max(10, Math.min(95, opportunity)),
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { csv } = await req.json();
    
    if (!csv || typeof csv !== 'string') {
      return new Response(
        JSON.stringify({ error: 'CSV content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Processing CSV import...');
    const rows = parseCSV(csv);
    
    if (rows.length < 2) {
      return new Response(
        JSON.stringify({ error: 'CSV must have at least a header and one row' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const headers = rows[0];
    console.log('Headers detected:', headers);
    
    // Find column indices
    const keywordIdx = findColumnIndex(headers, COLUMN_MAPPINGS.keyword);
    const volumeIdx = findColumnIndex(headers, COLUMN_MAPPINGS.volume);
    const competitionIdx = findColumnIndex(headers, COLUMN_MAPPINGS.competition);
    const cpcIdx = findColumnIndex(headers, COLUMN_MAPPINGS.cpc);
    
    if (keywordIdx === -1) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not find keyword column. Expected: Keyword, Palavra-chave, Term',
          headers: headers 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Column indices - Keyword: ${keywordIdx}, Volume: ${volumeIdx}, Competition: ${competitionIdx}, CPC: ${cpcIdx}`);
    
    // Generate batch ID
    const batchId = crypto.randomUUID();
    
    // Get existing keywords for deduplication
    const { data: existingKeywords } = await supabase
      .from('blog_keywords_bank')
      .select('keyword');
    
    const existingSet = new Set(
      (existingKeywords || []).map(k => k.keyword.toLowerCase().trim())
    );
    
    // Process rows
    const dataRows = rows.slice(1);
    const keywordsToInsert: any[] = [];
    const duplicates: string[] = [];
    const invalid: string[] = [];
    
    for (const row of dataRows) {
      const keyword = row[keywordIdx]?.trim();
      
      if (!keyword || keyword.length < 3) {
        invalid.push(keyword || '(empty)');
        continue;
      }
      
      const normalizedKeyword = keyword.toLowerCase();
      
      if (existingSet.has(normalizedKeyword)) {
        duplicates.push(keyword);
        continue;
      }
      
      // Avoid duplicates within the same import
      existingSet.add(normalizedKeyword);
      
      const volume = volumeIdx !== -1 ? parseVolume(row[volumeIdx]) : 0;
      const competition = competitionIdx !== -1 ? parseCompetition(row[competitionIdx]) : 'medium';
      const cpc = cpcIdx !== -1 ? parseCPC(row[cpcIdx]) : null;
      
      const intent = detectIntent(keyword);
      const cluster = detectCluster(keyword);
      const city = detectCity(keyword);
      const funnelStage = detectFunnelStage(keyword, intent);
      const { difficulty, opportunity } = calculatePriorityScore(keyword, volume, competition, intent);
      
      keywordsToInsert.push({
        keyword: keyword,
        cluster,
        funnel_stage: funnelStage,
        intent,
        city,
        difficulty_score: difficulty,
        opportunity_score: opportunity,
        source: 'google_planner',
        search_volume: volume,
        competition,
        cpc,
        import_batch_id: batchId,
        used: false,
      });
    }
    
    console.log(`Processed: ${keywordsToInsert.length} to insert, ${duplicates.length} duplicates, ${invalid.length} invalid`);
    
    // Insert in batches of 500
    let inserted = 0;
    const batchSize = 500;
    
    for (let i = 0; i < keywordsToInsert.length; i += batchSize) {
      const batch = keywordsToInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from('blog_keywords_bank')
        .insert(batch);
      
      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      
      inserted += batch.length;
    }
    
    // Get cluster summary
    const clusterSummary: Record<string, number> = {};
    for (const kw of keywordsToInsert) {
      clusterSummary[kw.cluster] = (clusterSummary[kw.cluster] || 0) + 1;
    }
    
    // Get top opportunities
    const topOpportunities = keywordsToInsert
      .sort((a, b) => b.opportunity_score - a.opportunity_score)
      .slice(0, 10)
      .map(k => ({
        keyword: k.keyword,
        volume: k.search_volume,
        opportunity: k.opportunity_score,
        competition: k.competition,
        cluster: k.cluster,
      }));
    
    const result = {
      success: true,
      imported: inserted,
      duplicates: duplicates.length,
      invalid: invalid.length,
      total_processed: dataRows.length,
      batch_id: batchId,
      columns_detected: {
        keyword: keywordIdx !== -1,
        volume: volumeIdx !== -1,
        competition: competitionIdx !== -1,
        cpc: cpcIdx !== -1,
      },
      cluster_summary: clusterSummary,
      top_opportunities: topOpportunities,
    };
    
    console.log('Import complete:', result);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing CSV:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
