import { createClient } from "npm:@supabase/supabase-js@2.77.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Theme IDs
type LPThemeId = 'midnight_pro' | 'warm_sunset' | 'nature_clean' | 'royal_purple' | 'ocean_deep' | 'feminine_purple';

// Legacy theme mapping
const legacyThemeMap: Record<string, LPThemeId> = {
  'midnight': 'midnight_pro',
  'sunset': 'warm_sunset',
  'nature': 'nature_clean',
  'royal': 'royal_purple',
  'ocean': 'ocean_deep',
  'feminine': 'feminine_purple',
};

interface GenerateLandingRequest {
  servico: {
    id: string;
    subcategoria: string;
    categoria: string;
    preco_limpeza: number | null;
  };
  precos: {
    estrategia: 'sem_preco' | 'com_preco' | 'promocional';
    precoOriginal?: number;
    precoFinal?: number;
    descontoPercent?: number;
  };
  destino_cta: 'whatsapp' | 'checkout' | 'formulario';
  elementos: {
    timer: boolean;
    depoimentos: boolean;
    garantia: boolean;
    antesDepois: boolean;
    urgencia: boolean;
    prova_social: boolean;
  };
  template_real: 'lp-12d' | 'lp-teodoro';
  theme: string; // Accepts both old and new format
  nome: string;
  headline?: string;
  subheadline?: string;
}

const PLATFORM_NAME = Deno.env.get('PLATFORM_NAME') ?? 'Limpamais';

function generateSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
}

// Resolve theme ID from legacy or new format
function resolveThemeId(themeId?: string): LPThemeId {
  if (!themeId) return 'midnight_pro';
  if (themeId in legacyThemeMap) return legacyThemeMap[themeId];
  if (['midnight_pro', 'warm_sunset', 'nature_clean', 'royal_purple', 'ocean_deep', 'feminine_purple'].includes(themeId)) {
    return themeId as LPThemeId;
  }
  return 'midnight_pro';
}

// Build prompt for LP-12D template (slot-based)
function buildLP12DPrompt(servico: any, precos: any, elementos: any, destino_cta: string, headline?: string, subheadline?: string): string {
  let prompt = `Você é um copywriter expert em landing pages de ALTA CONVERSÃO.
Gere copy ESTRUTURADA para uma landing page no formato JSON de SLOTS.

SERVIÇO: ${servico.subcategoria} (${servico.categoria})
TEMPLATE: lp-12d (Desafio 12D - estilo empoderador/transformacional)
OBJETIVO: ${destino_cta === 'whatsapp' ? 'Levar para WhatsApp' : destino_cta === 'checkout' ? 'Venda direta' : 'Capturar lead'}

`;

  // Pricing context
  if (precos.estrategia === 'promocional' && precos.precoOriginal && precos.precoFinal) {
    prompt += `PREÇO: Promoção de R$ ${precos.precoOriginal} por R$ ${precos.precoFinal}\n`;
  } else if (precos.estrategia === 'com_preco' && precos.precoFinal) {
    prompt += `PREÇO: R$ ${precos.precoFinal}\n`;
  } else {
    prompt += `PREÇO: Não exibir, focar nos benefícios\n`;
  }

  // Elements
  prompt += `\nELEMENTOS: `;
  if (elementos.timer) prompt += `timer, `;
  if (elementos.depoimentos) prompt += `depoimentos, `;
  if (elementos.garantia) prompt += `garantia, `;
  if (elementos.urgencia) prompt += `urgência, `;
  prompt += '\n';

  if (headline) prompt += `HEADLINE SUGERIDA: ${headline}\n`;
  if (subheadline) prompt += `SUBHEADLINE SUGERIDA: ${subheadline}\n`;

  prompt += `
INSTRUÇÕES:
- Use linguagem direta e emocional
- Foque em TRANSFORMAÇÃO, não em features
- Adapte a copy ao serviço específico (${servico.subcategoria})
- Use a metáfora do jardim/crescimento se apropriado

Retorne EXATAMENTE este JSON (sem markdown, sem explicações):
{
  "hero": {
    "badge": "texto curto urgência (max 30 chars)",
    "title": "headline impactante (max 80 chars)",
    "subtitle": "subheadline persuasiva (max 150 chars)",
    "cta": {
      "primaryLabel": "texto botão CTA (max 25 chars)"
    }
  },
  "story": {
    "title": "título empático sobre o problema (max 60 chars)",
    "paragraphs": [
      "parágrafo 1 descrevendo a dor do cliente",
      "parágrafo 2 agravando o problema",
      "parágrafo 3 apresentando esperança"
    ],
    "highlight": "frase de transição para solução"
  },
  "garden": {
    "title": "título da seção benefícios",
    "subtitle": "${servico.subcategoria}",
    "bulletsLeft": ["benefício 1", "benefício 2", "benefício 3"],
    "bulletsRight": ["benefício 4", "benefício 5", "benefício 6"]
  },
  "marquee": {
    "text": "${servico.subcategoria}"
  },
  "testimonials": {
    "title": "O que nossos clientes dizem",
    "items": [
      {"name": "Nome 1", "text": "Depoimento 1", "role": "Perfil 1"},
      {"name": "Nome 2", "text": "Depoimento 2", "role": "Perfil 2"},
      {"name": "Nome 3", "text": "Depoimento 3", "role": "Perfil 3"}
    ]
  },
  "targetAudience": {
    "title": "Este serviço é para você?",
    "forYou": {
      "title": "${servico.subcategoria} é para você se:",
      "items": ["perfil ideal 1", "perfil ideal 2", "perfil ideal 3", "perfil ideal 4"]
    },
    "notForYou": {
      "title": "${servico.subcategoria} NÃO é para você se:",
      "items": ["perfil não ideal 1", "perfil não ideal 2", "perfil não ideal 3"]
    }
  },
  "pricing": {
    "title": "Investimento",
    "subtitle": "Transforme seu ambiente",
    "priceText": "${precos.precoFinal ? 'R$ ' + precos.precoFinal : 'Consulte'}",
    ${precos.estrategia === 'promocional' ? `"originalPrice": "R$ ${precos.precoOriginal}",` : ''}
    "ctaLabel": "${destino_cta === 'whatsapp' ? 'Agendar pelo WhatsApp' : 'Agendar Agora'}",
    "guarantee": {
      "title": "Garantia Total",
      "text": "Satisfação garantida ou seu dinheiro de volta",
      "days": "7 dias"
    }
  },
  "bio": {
    "name": "${PLATFORM_NAME}",
    "role": "Especialista em Higienização",
    "paragraphs": [
      "Parágrafo sobre a empresa/especialista",
      "Parágrafo sobre experiência e valores"
    ],
    "credentials": ["Credencial 1", "Credencial 2", "Credencial 3", "Credencial 4"]
  },
  "faq": {
    "title": "Perguntas Frequentes",
    "items": [
      {"q": "Pergunta 1?", "a": "Resposta 1"},
      {"q": "Pergunta 2?", "a": "Resposta 2"},
      {"q": "Pergunta 3?", "a": "Resposta 3"},
      {"q": "Pergunta 4?", "a": "Resposta 4"},
      {"q": "Pergunta 5?", "a": "Resposta 5"},
      {"q": "Pergunta 6?", "a": "Resposta 6"}
    ]
  },
  "footer": {
    "smallPrint": "Todos os direitos reservados.",
    "copyright": "© ${new Date().getFullYear()} ${PLATFORM_NAME}"
  },
  "meta": {
    "title": "título SEO (max 60 chars)",
    "description": "descrição SEO (max 155 chars)"
  }
}`;

  return prompt;
}

// Build prompt for LP-TEODORO template
function buildLPTeodoroPrompt(servico: any, precos: any, elementos: any, destino_cta: string, headline?: string, subheadline?: string): string {
  let prompt = `Você é um copywriter expert em landing pages de ALTA CONVERSÃO.
Gere copy ESTRUTURADA para uma landing page no formato JSON de SLOTS.

SERVIÇO: ${servico.subcategoria} (${servico.categoria})
TEMPLATE: lp-teodoro (Profissional, técnico mas acessível)
OBJETIVO: ${destino_cta === 'whatsapp' ? 'Levar para WhatsApp' : destino_cta === 'checkout' ? 'Venda direta' : 'Capturar lead'}

`;

  if (precos.estrategia === 'promocional' && precos.precoOriginal && precos.precoFinal) {
    prompt += `PREÇO: Promoção de R$ ${precos.precoOriginal} por R$ ${precos.precoFinal}\n`;
  } else if (precos.estrategia === 'com_preco' && precos.precoFinal) {
    prompt += `PREÇO: R$ ${precos.precoFinal}\n`;
  }

  if (headline) prompt += `HEADLINE SUGERIDA: ${headline}\n`;
  if (subheadline) prompt += `SUBHEADLINE SUGERIDA: ${subheadline}\n`;

  prompt += `
Retorne EXATAMENTE este JSON (sem markdown):
{
  "hero": {
    "badge": "texto urgência",
    "title": "headline impactante",
    "subtitle": "subheadline persuasiva",
    "cta": { "primaryLabel": "texto CTA" }
  },
  "aboutProblem": {
    "title": "título empático",
    "paragraphs": ["parágrafo 1", "parágrafo 2"],
    "highlight": "frase destaque"
  },
  "profiles": {
    "items": [
      {"title": "Perfil 1", "description": "descrição"},
      {"title": "Perfil 2", "description": "descrição"},
      {"title": "Perfil 3", "description": "descrição"},
      {"title": "Perfil 4", "description": "descrição"}
    ]
  },
  "painPoints": {
    "items": [
      {"title": "Dor 1", "problem": "descrição problema", "solution": "nossa solução"},
      {"title": "Dor 2", "problem": "descrição problema", "solution": "nossa solução"},
      {"title": "Dor 3", "problem": "descrição problema", "solution": "nossa solução"},
      {"title": "Dor 4", "problem": "descrição problema", "solution": "nossa solução"}
    ]
  },
  "benefits": {
    "items": [
      {"title": "Benefício 1", "description": "descrição"},
      {"title": "Benefício 2", "description": "descrição"},
      {"title": "Benefício 3", "description": "descrição"},
      {"title": "Benefício 4", "description": "descrição"},
      {"title": "Benefício 5", "description": "descrição"},
      {"title": "Benefício 6", "description": "descrição"}
    ]
  },
  "specialist": {
    "title": "Conheça a ${PLATFORM_NAME}",
    "subtitle": "Referência em Higienização",
    "paragraphs": ["Sobre a empresa parágrafo 1", "Parágrafo 2"],
    "credentials": ["Credencial 1", "Credencial 2", "Credencial 3"]
  },
  "pricing": {
    "title": "Investimento",
    "priceText": "${precos.precoFinal ? 'R$ ' + precos.precoFinal : 'Consulte'}",
    ${precos.estrategia === 'promocional' ? `"originalPrice": "R$ ${precos.precoOriginal}",` : ''}
    "ctaLabel": "${destino_cta === 'whatsapp' ? 'Agendar pelo WhatsApp' : 'Agendar Agora'}",
    "guarantee": {
      "title": "Garantia Total",
      "text": "Satisfação garantida ou seu dinheiro de volta",
      "days": "7 dias"
    }
  },
  "testimonials": {
    "title": "O que nossos clientes dizem",
    "enabled": ${elementos.depoimentos}
  },
  "faq": {
    "items": [
      {"q": "Pergunta 1?", "a": "Resposta 1"},
      {"q": "Pergunta 2?", "a": "Resposta 2"},
      {"q": "Pergunta 3?", "a": "Resposta 3"},
      {"q": "Pergunta 4?", "a": "Resposta 4"},
      {"q": "Pergunta 5?", "a": "Resposta 5"},
      {"q": "Pergunta 6?", "a": "Resposta 6"}
    ]
  },
  "finalCta": {
    "headline": "Pronto para transformar seu ambiente?",
    "ctaLabel": "${destino_cta === 'whatsapp' ? 'Agendar pelo WhatsApp' : 'Agendar Agora'}",
    "subtext": "Pagamento 100% seguro"
  },
  "meta": {
    "title": "Limpeza de ${servico.subcategoria} em BH",
    "description": "Serviço profissional de ${servico.subcategoria}. Resultados garantidos."
  },
  "extras": {
    "urgencyText": "Últimas vagas esta semana!",
    "socialProofText": "+5.000 clientes satisfeitos"
  }
}`;

  return prompt;
}

// Default copy for LP-12D (fallback)
function getDefaultLP12DCopy(servico: any, precos: any, destino_cta: string): any {
  return {
    hero: {
      badge: 'Últimas Vagas Esta Semana!',
      title: `Limpeza de ${servico.subcategoria} Profissional`,
      subtitle: 'Resultados que você pode ver e sentir. Higienização profunda que transforma seu ambiente.',
      cta: {
        primaryLabel: destino_cta === 'whatsapp' ? 'Agendar pelo WhatsApp' : 'Quero Saber Mais',
      },
    },
    story: {
      title: 'A Sujeira Não Precisa Ser Sua Companheira',
      paragraphs: [
        `Você já olhou para o seu ${servico.subcategoria.toLowerCase()} e percebeu manchas que não saem de jeito nenhum? Aquele cheiro que parece ter se instalado definitivamente?`,
        'Você não está sozinho. Muitas famílias enfrentam o mesmo problema: estofados que acumulam sujeira, ácaros e bactérias invisíveis ao olho nu.',
        'E por mais que você tente limpar, o resultado nunca é o mesmo de uma higienização profissional.',
      ],
      highlight: 'A boa notícia é que existe uma solução definitiva.',
    },
    garden: {
      title: 'O que você vai receber',
      subtitle: servico.subcategoria,
      bulletsLeft: [
        'Higienização Profunda',
        'Remoção de Manchas',
        'Eliminação de Odores',
      ],
      bulletsRight: [
        'Secagem Rápida (2-4h)',
        'Produtos Biodegradáveis',
        'Garantia Total de Satisfação',
      ],
    },
    marquee: {
      text: servico.subcategoria,
    },
    testimonials: {
      title: 'O que nossos clientes dizem',
      items: [
        { name: 'Maria S.', text: 'Resultado incrível! Meu sofá parece novo.', role: 'Mãe de família' },
        { name: 'João P.', text: 'Profissionais excelentes, super recomendo!', role: 'Empresário' },
        { name: 'Ana L.', text: 'Atendimento impecável do início ao fim.', role: 'Arquiteta' },
      ],
    },
    targetAudience: {
      title: 'Este serviço é para você?',
      forYou: {
        title: `${servico.subcategoria} é para você se:`,
        items: [
          'Busca ambiente saudável para sua família',
          'Tem crianças ou pets em casa',
          'Valoriza qualidade e profissionalismo',
          'Quer resultados duradouros',
        ],
      },
      notForYou: {
        title: `${servico.subcategoria} NÃO é para você se:`,
        items: [
          'Busca apenas o menor preço',
          'Não se importa com qualidade',
          'Prefere soluções caseiras',
        ],
      },
    },
    pricing: {
      title: 'Investimento',
      subtitle: 'Transforme seu ambiente',
      priceText: precos.precoFinal ? `R$ ${precos.precoFinal}` : 'Consulte',
      originalPrice: precos.estrategia === 'promocional' ? `R$ ${precos.precoOriginal}` : undefined,
      ctaLabel: destino_cta === 'whatsapp' ? 'Agendar pelo WhatsApp' : 'Agendar Agora',
      guarantee: {
        title: 'Garantia Total de Satisfação',
        text: 'Se você não ficar 100% satisfeito, devolvemos seu dinheiro.',
        days: '7 dias',
      },
    },
    bio: {
      name: PLATFORM_NAME,
      role: 'Referência em Higienização em BH',
      paragraphs: [
        `Desde 2018, a ${PLATFORM_NAME} tem transformado ambientes em toda Belo Horizonte e região metropolitana.`,
        'Com uma equipe treinada e equipamentos de última geração, garantimos uma higienização profunda que você pode ver e sentir.',
      ],
      credentials: [
        '+5.000 clientes atendidos',
        'Equipe certificada e treinada',
        'Produtos biodegradáveis',
        'Garantia de satisfação',
      ],
    },
    faq: {
      title: 'Perguntas Frequentes',
      items: [
        { q: 'Quanto tempo leva a limpeza?', a: 'Em média 40 minutos a 1 hora, dependendo do tamanho.' },
        { q: 'Qual o tempo de secagem?', a: 'De 2 a 4 horas, dependendo da ventilação.' },
        { q: 'Os produtos são seguros?', a: 'Sim! Usamos produtos biodegradáveis, seguros para crianças e pets.' },
        { q: 'Vocês atendem em qual região?', a: 'BH e toda região metropolitana.' },
        { q: 'Como funciona a garantia?', a: '7 dias de garantia total. Refazemos ou devolvemos o dinheiro.' },
        { q: 'Posso agendar para sábado?', a: 'Sim! Atendemos de segunda a sábado.' },
      ],
    },
    footer: {
      smallPrint: 'Todos os direitos reservados.',
      copyright: `© ${new Date().getFullYear()} ${PLATFORM_NAME}`,
    },
    meta: {
      title: `Limpeza de ${servico.subcategoria} em BH | Agende Agora`,
      description: `Serviço profissional de limpeza de ${servico.subcategoria} em BH. Resultados garantidos ou seu dinheiro de volta.`,
    },
  };
}

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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!lovableApiKey && !openaiApiKey) {
      throw new Error('Nenhuma API key configurada (LOVABLE ou OPENAI)');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Get tenant_id from user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const body: GenerateLandingRequest = await req.json();
    const { servico, precos, destino_cta, elementos, template_real, theme, nome, headline, subheadline } = body;

    if (!servico || !nome) {
      throw new Error('Campos obrigatórios: servico, nome');
    }

    // Resolve theme to new format
    const resolvedTheme = resolveThemeId(theme);
    
    console.log(`[iarc-generate-landing] Gerando LP para "${servico.subcategoria}" template=${template_real} theme=${resolvedTheme}`);

    // Build template-specific prompt
    const copyPrompt = template_real === 'lp-12d'
      ? buildLP12DPrompt(servico, precos, elementos, destino_cta, headline, subheadline)
      : buildLPTeodoroPrompt(servico, precos, elementos, destino_cta, headline, subheadline);

    // Call AI with fallback strategy
    let aiData;
    let modelUsed = 'unknown';

    // 1. Try Lovable AI first
    if (lovableApiKey) {
      try {
        const lovableResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{ role: 'user', content: copyPrompt }],
            temperature: 0.7,
          })
        });

        if (lovableResponse.ok) {
          aiData = await lovableResponse.json();
          modelUsed = 'Lovable AI (Gemini 2.5 Flash)';
          console.log('[iarc-generate-landing] Usando Lovable AI (Gemini)');
        } else {
          const errorText = await lovableResponse.text();
          console.log(`[iarc-generate-landing] Lovable AI indisponível (${lovableResponse.status}): ${errorText}`);
          
          // 2. Fallback to OpenAI if 402/429
          if ((lovableResponse.status === 402 || lovableResponse.status === 429) && openaiApiKey) {
            console.log('[iarc-generate-landing] Tentando fallback com OpenAI...');
            
            const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: copyPrompt }],
                temperature: 0.7,
              })
            });

            if (openaiResponse.ok) {
              aiData = await openaiResponse.json();
              modelUsed = 'OpenAI (gpt-4o-mini)';
              console.log('[iarc-generate-landing] Usando OpenAI como fallback');
            }
          }
        }
      } catch (err) {
        console.error('[iarc-generate-landing] AI request error:', err);
      }
    } else if (openaiApiKey) {
      // No Lovable key, try OpenAI directly
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: copyPrompt }],
            temperature: 0.7,
          })
        });

        if (openaiResponse.ok) {
          aiData = await openaiResponse.json();
          modelUsed = 'OpenAI (gpt-4o-mini)';
        }
      } catch (err) {
        console.error('[iarc-generate-landing] OpenAI error:', err);
      }
    }

    // Parse AI response or use defaults
    let copyGerada;
    
    if (aiData) {
      const rawContent = aiData.choices?.[0]?.message?.content || '';
      
      try {
        // Extract JSON from response (may have markdown code blocks)
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          copyGerada = JSON.parse(jsonMatch[0]);
          console.log(`[iarc-generate-landing] Copy gerada com sucesso usando ${modelUsed}`);
        } else {
          throw new Error('JSON não encontrado na resposta');
        }
      } catch (parseError) {
        console.error('[iarc-generate-landing] Erro ao parsear JSON:', parseError);
        aiData = null;
      }
    }
    
    // Fallback to defaults if AI failed
    if (!copyGerada) {
      console.log('[iarc-generate-landing] Usando copy padrão (fallback)');
      copyGerada = getDefaultLP12DCopy(servico, precos, destino_cta);
      modelUsed = 'fallback (copy padrão)';
    }

    // Generate slug
    const slug = generateSlug(nome) + '-' + Date.now().toString(36);

    // Build config with resolved theme
    const config = {
      servico,
      precos,
      destino_cta,
      elementos,
      template: template_real,
      theme: resolvedTheme, // Use resolved theme ID
    };

    // Save to database
    const supabaseAnon = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: lpData, error: insertError } = await supabaseAnon
      .from('iarc_landing_pages')
      .insert({
        nome,
        slug,
        template_tipo: template_real,
        config,
        copy_gerada: copyGerada,
        status: 'rascunho',
        tenant_id: profile?.tenant_id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[iarc-generate-landing] Insert error:', insertError);
      throw new Error('Erro ao salvar landing page');
    }

    console.log(`[iarc-generate-landing] LP criada: ${lpData.id} slug=${slug} model=${modelUsed}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        landing_page: {
          id: lpData.id,
          slug: lpData.slug,
          nome: lpData.nome,
          copy_gerada: copyGerada,
        },
        model_used: modelUsed,
        message: 'Landing page criada com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[iarc-generate-landing] Error:', error);
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
