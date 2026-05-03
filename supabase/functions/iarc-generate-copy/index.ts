import { createClient } from "npm:@supabase/supabase-js@2.77.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GenerateCopyRequest {
  tipo_copy: 'headlines' | 'subheadlines' | 'bullets' | 'cta' | 'depoimentos' | 'faq' | 'urgencia';
  contexto: {
    servico: string;
    publico_alvo?: string;
    diferencial?: string;
    preco?: string;
    regiao?: string;
  };
  quantidade: number;
}

const PROMPTS_POR_TIPO: Record<string, string> = {
  headlines: `Gere {quantidade} headlines (títulos principais) impactantes e persuasivas para uma landing page.
As headlines devem:
- Comunicar o benefício principal imediatamente
- Gerar curiosidade ou urgência
- Ser diretas e fáceis de entender
- Ter entre 5-12 palavras cada`,

  subheadlines: `Gere {quantidade} subheadlines (subtítulos) que complementem uma headline principal.
Os subtítulos devem:
- Explicar melhor a proposta de valor
- Adicionar credibilidade ou prova social
- Ser mais descritivos que o título principal
- Ter entre 10-20 palavras cada`,

  bullets: `Gere {quantidade} bullets (pontos de benefício) persuasivos para uma seção de vantagens.
Os bullets devem:
- Começar com um benefício tangível
- Usar linguagem orientada ao cliente (você/seu)
- Ser específicos e mensuráveis quando possível
- Ter entre 5-15 palavras cada`,

  cta: `Gere {quantidade} textos de CTA (call-to-action) para botões de conversão.
Os CTAs devem:
- Usar verbos de ação no imperativo
- Criar senso de benefício imediato
- Ser curtos (2-5 palavras)
- Evitar palavras genéricas como "clique aqui"`,

  depoimentos: `Gere {quantidade} templates de depoimentos fictícios mas realistas.
Os depoimentos devem:
- Mencionar um problema específico resolvido
- Incluir resultados tangíveis
- Parecer naturais e autênticos
- Ter entre 30-60 palavras cada
- Incluir um nome fictício e cidade`,

  faq: `Gere {quantidade} pares de pergunta e resposta para uma seção de FAQ.
As perguntas devem:
- Refletir dúvidas reais de potenciais clientes
- Abordar objeções comuns de compra
- As respostas devem ser concisas e tranquilizadoras
Formato: Q: [pergunta] | A: [resposta]`,

  urgencia: `Gere {quantidade} frases de urgência/escassez para aumentar conversões.
As frases devem:
- Criar senso de urgência genuíno
- Usar gatilhos de escassez (tempo, quantidade, exclusividade)
- Ser honestas e não manipulativas
- Ter entre 5-15 palavras cada`
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autorizado');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const body: GenerateCopyRequest = await req.json();
    const { tipo_copy, contexto, quantidade } = body;

    if (!tipo_copy || !contexto?.servico) {
      throw new Error('Campos obrigatórios: tipo_copy, contexto.servico');
    }

    const promptBase = PROMPTS_POR_TIPO[tipo_copy];
    if (!promptBase) {
      throw new Error(`Tipo de copy inválido: ${tipo_copy}`);
    }

    const prompt = `${promptBase.replace('{quantidade}', String(quantidade))}

CONTEXTO DO NEGÓCIO:
- Serviço/Produto: ${contexto.servico}
${contexto.publico_alvo ? `- Público-alvo: ${contexto.publico_alvo}` : ''}
${contexto.diferencial ? `- Diferenciais: ${contexto.diferencial}` : ''}
${contexto.preco ? `- Preço: ${contexto.preco}` : ''}
${contexto.regiao ? `- Região de atuação: ${contexto.regiao}` : ''}

IMPORTANTE: Responda APENAS com os textos, um por linha, numerados. Não inclua explicações.
Escreva em português brasileiro, tom profissional mas acessível.`;

    console.log(`[iarc-generate-copy] Gerando ${quantidade} ${tipo_copy}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um copywriter profissional especializado em marketing digital e landing pages de alta conversão. Suas copys são diretas, persuasivas e focadas em resultados.' 
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[iarc-generate-copy] AI error: ${response.status}`, errorText);
      
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
      }
      if (response.status === 402) {
        throw new Error('Créditos insuficientes. Adicione créditos ao workspace.');
      }
      throw new Error('Erro ao gerar textos com IA');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse response into array of copys
    const lines = content.split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string) => {
        // Remove numeração (1. 2. etc) ou bullets
        return line.replace(/^[\d]+[\.\)]\s*/, '').replace(/^[-•]\s*/, '').trim();
      })
      .filter((line: string) => line.length > 5);

    const copys = lines.slice(0, quantidade).map((texto: string) => ({
      texto,
      tipo: tipo_copy
    }));

    if (copys.length === 0) {
      throw new Error('Nenhum texto foi gerado');
    }

    // Salvar no histórico
    const supabaseAnon = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    await supabaseAnon.from('iarc_copys_geradas').insert({
      tipo_copy,
      contexto,
      copys
    });

    console.log(`[iarc-generate-copy] ${copys.length} textos gerados com sucesso`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        copys,
        message: `${copys.length} texto(s) gerado(s) com sucesso`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[iarc-generate-copy] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
