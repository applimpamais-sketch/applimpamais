import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { post_id } = await req.json()
    console.log('[publish-wp] Iniciando:', post_id)

    const { data: post, error: postError } = await supabase
      .from('blog_posts_queue')
      .select('*')
      .eq('id', post_id)
      .single()

    if (postError || !post) {
      throw new Error('Post não encontrado')
    }

    const { data: configs } = await supabase.from('blog_config').select('key, value')
    const cfg: Record<string, any> = {}
    configs?.forEach((c: any) => { cfg[c.key] = c.value })

    const wpUrl = cfg.wordpress_url
    const wpUser = cfg.wordpress_username
    const wpPass = Deno.env.get('WP_APP_PASSWORD')

    if (!wpUrl || !wpUser || !wpPass) {
      throw new Error('Config WordPress incompleta')
    }

    await supabase.from('blog_posts_queue').update({ status: 'publishing' }).eq('id', post_id)

    let content = (post.content_html || '').replace(/<h1[^>]*>.*?<\/h1>/gi, '')
    const creds = btoa(`${wpUser}:${wpPass}`)
    const apiUrl = `${wpUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: post.title,
        content,
        excerpt: post.excerpt || post.meta_description,
        slug: post.slug,
        status: cfg.auto_publish ? 'publish' : 'draft',
        meta: { _yoast_wpseo_title: post.meta_title, _yoast_wpseo_metadesc: post.meta_description }
      }),
    })

    if (!res.ok) {
      await supabase.from('blog_posts_queue').update({ status: 'failed', error_message: `WP: ${res.status}` }).eq('id', post_id)
      throw new Error(`WP error: ${res.status}`)
    }

    const wpPost = await res.json()
    console.log('[publish-wp] OK:', wpPost.id)

    await supabase.from('blog_posts_queue').update({
      status: 'published',
      wp_post_id: wpPost.id,
      wp_post_url: wpPost.link,
      published_at: new Date().toISOString(),
      error_message: null
    }).eq('id', post_id)

    if (post.chosen_keyword) {
      await supabase.from('blog_keywords_bank').update({ used: true, post_id }).eq('keyword', post.chosen_keyword)
    }

    return new Response(JSON.stringify({ success: true, wp_post_id: wpPost.id, wp_post_url: wpPost.link }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('[publish-wp] Erro:', error)
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
