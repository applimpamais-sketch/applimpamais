import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { codigo } = await req.json();

    if (!codigo) {
      console.error('[TrackClick] Código não fornecido');
      return new Response(
        JSON.stringify({ error: 'Código do link é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const codigoUpper = codigo.toUpperCase();
    let foundType = 'nenhum';

    // Verificar se o link específico existe
    const { data: link } = await supabaseClient
      .from('parceiro_links')
      .select('id, parceiro_id, cupom_vinculado')
      .eq('codigo', codigoUpper)
      .eq('status', 'ativo')
      .maybeSingle();

    if (link) {
      foundType = 'link';
      console.log(`[TrackClick] Link específico encontrado: ${codigoUpper}, parceiro_id: ${link.parceiro_id}`);
    } else {
      // Se não encontrou link específico, verificar se é código principal do parceiro
      const { data: parceiro } = await supabaseClient
        .from('parceiros')
        .select('id, codigo_referencia')
        .eq('codigo_referencia', codigoUpper)
        .eq('status', 'ativo')
        .maybeSingle();

      if (parceiro) {
        foundType = 'parceiro';
        console.log(`[TrackClick] Código principal do parceiro encontrado: ${codigoUpper}, parceiro_id: ${parceiro.id}`);
      } else {
        // Tentar extrair código do parceiro do link (ex: MARIA10-SOFA -> MARIA10)
        const codigoParts = codigoUpper.split('-');
        if (codigoParts.length > 1) {
          const { data: parceiroByPrefix } = await supabaseClient
            .from('parceiros')
            .select('id')
            .eq('codigo_referencia', codigoParts[0])
            .eq('status', 'ativo')
            .maybeSingle();

          if (parceiroByPrefix) {
            foundType = 'parceiro_prefix';
            console.log(`[TrackClick] Parceiro encontrado por prefixo: ${codigoParts[0]}, parceiro_id: ${parceiroByPrefix.id}`);
          } else {
            console.warn(`[TrackClick] Nenhum parceiro encontrado para código: ${codigoUpper}`);
            return new Response(
              JSON.stringify({ success: false, message: 'Parceiro não encontrado' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          console.warn(`[TrackClick] Código inválido ou parceiro inativo: ${codigoUpper}`);
          return new Response(
            JSON.stringify({ success: false, message: 'Parceiro não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Incrementar cliques usando SQL direto (função trata links e códigos principais)
    await supabaseClient.rpc('increment_link_cliques', { link_codigo: codigoUpper });

    console.log(`[TrackClick] Clique registrado - código: ${codigoUpper}, tipo: ${foundType}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        codigo: codigoUpper,
        tipo: foundType
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[TrackClick] Erro:', error);
    
    // Mesmo com erro, retornar sucesso para não bloquear o redirect
    return new Response(
      JSON.stringify({ success: true, warning: 'Erro ao registrar clique' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
