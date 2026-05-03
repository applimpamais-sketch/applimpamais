import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { SITE_DOMAIN } from "../_shared/siteConfig.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { cluster, keyword, objective, region_city, region_bairro, keyword_id, servico_item } = await req.json();
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    console.log('[blog-generate-content] Start:', keyword);

    const { data: post, error: insertErr } = await supabase.from('blog_posts_queue').insert({
      cluster, seed_keyword: keyword, chosen_keyword: keyword, servico_item: servico_item || null,
      objective, region_city: region_city || null, region_bairro: region_bairro || null, status: 'generating'
    }).select().single();
    if (insertErr) throw insertErr;

    const loc = [region_bairro, region_city].filter(Boolean).join(', ');
    const platformName = Deno.env.get('PLATFORM_NAME') ?? 'Limpamais';
    const isAluguel = cluster === 'aluguel' || keyword.includes('aluguel');
    const ctaLink = isAluguel ? `${SITE_DOMAIN}/aluguel` : SITE_DOMAIN;

    const prompt = `Você é redator SEO da ${platformName}. Escreva artigo sobre "${keyword}". ${loc ? 'Região: ' + loc + '.' : ''} Cluster: ${cluster}. Funil: ${objective}.

ESTRUTURA OBRIGATÓRIA (blocos Gutenberg):
- NÃO inclua H1 (o WordPress adiciona automaticamente)
- Use <!-- wp:paragraph --><p>...</p><!-- /wp:paragraph --> para parágrafos
- Use <!-- wp:heading {"level":2} --><h2>...</h2><!-- /wp:heading --> para H2
- Use <!-- wp:list --><ul><li>...</li></ul><!-- /wp:list --> para listas
- Para 3 placeholders de imagem use:
<!-- wp:image {"className":"imagem-placeholder"} -->
<figure class="wp-block-image imagem-placeholder"><figcaption>[INSERIR IMAGEM: descrição]</figcaption></figure>
<!-- /wp:image -->

LINKS INTERNOS OBRIGATÓRIOS (muito importante para SEO):
Insira 4-6 links contextuais no texto usando âncoras naturais. Links disponíveis:
- "limpeza de sofá" ou "higienização de sofá" → ${SITE_DOMAIN}
- "limpeza de colchão" ou "higienização de colchão" → ${SITE_DOMAIN}
- "limpeza de estofados" → ${SITE_DOMAIN}
- "impermeabilização" → ${SITE_DOMAIN}
- "limpeza de tapetes" ou "lavagem de tapetes" → ${SITE_DOMAIN}
- "aluguel de extratora" ou "locação de equipamentos" → ${SITE_DOMAIN}/aluguel
- "orçamento" ou "agende agora" ou "Entre em contato" → ${ctaLink}
Formato: <a href="URL">texto âncora</a>. Distribua os links naturalmente ao longo do texto.

Conteúdo: intro, 5 H2s com conteúdo, CTA para ${ctaLink}, 5 FAQs, conclusão. Mínimo 1000 palavras.

Retorne JSON: {"title":"","slug":"","meta_title":"","meta_description":"","excerpt":"","content_html":"","faqs":[{"pergunta":"","resposta":""}],"word_count":0}`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }})
    });

    if (!aiRes.ok) {
      await supabase.from('blog_posts_queue').update({ status: 'failed', error_message: `AI error ${aiRes.status}` }).eq('id', post.id);
      return new Response(JSON.stringify({ error: `AI error ${aiRes.status}` }), { status: aiRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const aiData = await aiRes.json();
    const content = JSON.parse((aiData.choices?.[0]?.message?.content || '{}').replace(/^```json\s*/i, '').replace(/```$/i, '').trim());

    let seoScore = 0;
    // Título otimizado (max 25)
    if (content.title?.length > 0 && content.title?.length <= 60) seoScore += 25;
    // Meta description (max 20)
    if (content.meta_description?.length >= 120 && content.meta_description?.length <= 155) seoScore += 20;
    else if (content.meta_description?.length > 0) seoScore += 10;
    // Contagem de palavras (max 25)
    if (content.word_count >= 1000) seoScore += 25;
    else if (content.word_count >= 800) seoScore += 20;
    // FAQs completas (max 15)
    if (content.faqs?.length >= 5) seoScore += 15;
    else if (content.faqs?.length >= 3) seoScore += 10;
    // Placeholders de imagem (max 15)
    const imgCount = (content.content_html?.match(/wp:image/g) || []).length;
    if (imgCount >= 3) seoScore += 15;
    else if (imgCount >= 1) seoScore += 10;

    const faqSchema = content.faqs?.length ? JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": content.faqs.map((f: any) => ({ "@type": "Question", "name": f.pergunta, "acceptedAnswer": { "@type": "Answer", "text": f.resposta }}))}) : '';

    await supabase.from('blog_posts_queue').update({
      title: content.title, slug: content.slug, meta_title: content.meta_title, meta_description: content.meta_description,
      excerpt: content.excerpt, content_html: content.content_html, faqs_json: content.faqs || [], faq_schema_jsonld: faqSchema,
      word_count: content.word_count || 0, cta_type: isAluguel ? 'aluguel' : 'orcamento',
      cta_link: ctaLink, seo_score: Math.min(seoScore, 100), status: 'generated'
    }).eq('id', post.id);

    if (keyword_id) await supabase.from('blog_keywords_bank').update({ used: true, post_id: post.id }).eq('id', keyword_id);

    return new Response(JSON.stringify({ success: true, post_id: post.id, seo_score: seoScore }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  } catch (e) {
    console.error('[blog-generate-content] Error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});
