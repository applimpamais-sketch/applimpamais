import { createClient } from "npm:@supabase/supabase-js@2.77.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GenerateCreativeRequest {
  tipo: 'feed' | 'stories' | 'carrossel';
  descricao: string;
  estilo: 'minimalista' | 'vibrante' | 'profissional' | 'moderno' | 'elegante';
  texto_overlay?: string;
  quantidade?: number;
}

const DIMENSOES = {
  feed: { width: 1080, height: 1080, aspect: 'square' },
  stories: { width: 1080, height: 1920, aspect: 'vertical' },
  carrossel: { width: 1080, height: 1080, aspect: 'square' }
};

const ESTILOS_PROMPT = {
  minimalista: 'clean, minimalist design, lots of white space, simple and elegant, modern sans-serif typography',
  vibrante: 'vibrant colors, bold and energetic, high contrast, dynamic composition, eye-catching',
  profissional: 'professional and corporate, trustworthy, clean lines, business-appropriate, polished',
  moderno: 'modern and trendy, contemporary design, current design trends, sleek and stylish',
  elegante: 'elegant and sophisticated, premium feel, refined aesthetics, luxurious, high-end'
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

    const body: GenerateCreativeRequest = await req.json();
    const { tipo, descricao, estilo, texto_overlay, quantidade = 1 } = body;

    if (!tipo || !descricao || !estilo) {
      throw new Error('Campos obrigatórios: tipo, descricao, estilo');
    }

    const dimensoes = DIMENSOES[tipo];
    const estiloPrompt = ESTILOS_PROMPT[estilo];
    const numImages = tipo === 'carrossel' ? Math.min(quantidade, 5) : 1;

    console.log(`[iarc-generate-creative] Gerando ${numImages} imagem(ns) tipo=${tipo} estilo=${estilo}`);

    const imagens: { url: string; formato: string }[] = [];

    for (let i = 0; i < numImages; i++) {
      const promptVariation = tipo === 'carrossel' 
        ? `Slide ${i + 1} of ${numImages} for a carousel ad. ${descricao}` 
        : descricao;

      const fullPrompt = `Create a professional advertisement image for social media. 
Style: ${estiloPrompt}
Aspect ratio: ${dimensoes.aspect} (${dimensoes.width}x${dimensoes.height})
Content: ${promptVariation}
${texto_overlay ? `Include this text overlay prominently: "${texto_overlay}"` : 'No text overlay needed.'}

Make it visually stunning, ready for Facebook/Instagram ads. Ultra high resolution.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [{ role: 'user', content: fullPrompt }],
          modalities: ['image', 'text']
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[iarc-generate-creative] AI error: ${response.status}`, errorText);
        
        if (response.status === 429) {
          throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
        }
        if (response.status === 402) {
          throw new Error('Créditos insuficientes. Adicione créditos ao workspace.');
        }
        throw new Error('Erro ao gerar imagem com IA');
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (imageUrl) {
        imagens.push({
          url: imageUrl,
          formato: `${dimensoes.width}x${dimensoes.height}`
        });
        console.log(`[iarc-generate-creative] Imagem ${i + 1}/${numImages} gerada com sucesso`);
      }
    }

    if (imagens.length === 0) {
      throw new Error('Nenhuma imagem foi gerada');
    }

    // Salvar no histórico (usando anon key para RLS)
    const supabaseAnon = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    await supabaseAnon.from('iarc_criativos').insert({
      tipo,
      prompt: descricao,
      estilo,
      imagens: imagens
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        imagens,
        message: `${imagens.length} criativo(s) gerado(s) com sucesso`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[iarc-generate-creative] Error:', error);
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
