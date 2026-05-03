import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/corsConfig.ts";
import { isInternalRequestAuthorized } from "../_shared/internalAuth.ts";

/**
 * Edge function para iniciar fluxo de avaliação pós-venda
 * 
 * Deve ser chamada após um agendamento ser concluído.
 * Envia mensagem pedindo nota (0-10) e configura o contexto da conversa
 * para aguardar a resposta numérica do cliente.
 */

interface IniciarAvaliacaoRequest {
  telefone: string;
  nome_cliente: string;
  agendamento_id?: string;
  tenant_id?: string;
}

interface AvaliacaoConfig {
  google_reviews_url: string;
  facebook_reviews_url: string;
  nota_minima_review: number;
  mensagem_pedido_nota: string;
  mensagem_nota_alta: string;
  mensagem_nota_baixa: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return handleCorsPreflightResponse(req);
  }

  const auth = isInternalRequestAuthorized(req);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ error: auth.reason ?? "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ultramsgToken = Deno.env.get("ULTRAMSG_TOKEN")!;
    const ultramsgInstanceId = Deno.env.get("ULTRAMSG_INSTANCE_ID")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: IniciarAvaliacaoRequest = await req.json();
    const { telefone, nome_cliente, agendamento_id } = body;
    let tenantId = body.tenant_id || null;

    if (!telefone) {
      return new Response(
        JSON.stringify({ error: "Telefone é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tenantId && agendamento_id) {
      const { data: agendamento } = await supabase
        .from("agendamentos")
        .select("tenant_id")
        .eq("id", agendamento_id)
        .maybeSingle();
      tenantId = agendamento?.tenant_id || null;
    }

    if (!tenantId) {
      return new Response(
        JSON.stringify({ error: "tenant_id obrigatório para iniciar avaliação" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📊 Iniciando avaliação pós-venda para ${telefone} (tenant=${tenantId})`);

    // 1. Carregar configuração de avaliações
    const { data: integracaoData } = await supabase
      .from("integracoes")
      .select("configuracao, status")
      .eq("tipo", "avaliacoes")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (!integracaoData || integracaoData.status !== 'ativo') {
      console.log("⚠️ Sistema de avaliações não está ativo");
      return new Response(
        JSON.stringify({ 
          error: "Sistema de avaliações não está ativo",
          status: "inactive" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = integracaoData.configuracao as Record<string, unknown>;
    const avaliacaoConfig: AvaliacaoConfig = {
      google_reviews_url: (config?.google_reviews_url as string) || '',
      facebook_reviews_url: (config?.facebook_reviews_url as string) || '',
      nota_minima_review: (config?.nota_minima_review as number) || 8,
      mensagem_pedido_nota: (config?.mensagem_pedido_nota as string) || 'De 0 a 10, como você avalia nosso serviço?',
      mensagem_nota_alta: (config?.mensagem_nota_alta as string) || 'Ficamos muito felizes! 🎉 Deixe sua avaliação pública aqui: {link}',
      mensagem_nota_baixa: (config?.mensagem_nota_baixa as string) || 'Lamentamos que sua experiência não tenha sido perfeita. O que podemos melhorar?',
    };

    // 2. Buscar ou criar conversa
    let { data: conversa } = await supabase
      .from("whatsapp_conversas")
      .select("*")
      .eq("telefone", telefone)
      .eq("tenant_id", tenantId)
      .eq("finalizado", false)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!conversa) {
      const { data: novaConversa, error: erroConversa } = await supabase
        .from("whatsapp_conversas")
        .insert({
          tenant_id: tenantId,
          telefone: telefone,
          nome_cliente: nome_cliente || "Cliente",
          estado_atual: "avaliacao_pos_venda",
          finalizado: false,
          contexto: {
            aguardando_nota_avaliacao: true,
            agendamento_id: agendamento_id,
            avaliacao_iniciada_em: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (erroConversa) {
        console.error("❌ Erro ao criar conversa:", erroConversa);
        throw erroConversa;
      }

      conversa = novaConversa;
      console.log("✅ Nova conversa criada para avaliação:", conversa.id);
    } else {
      // Atualizar contexto da conversa existente
      await supabase
        .from("whatsapp_conversas")
        .update({
          estado_atual: "avaliacao_pos_venda",
          contexto: {
            ...(conversa.contexto as object || {}),
            aguardando_nota_avaliacao: true,
            agendamento_id: agendamento_id,
            avaliacao_iniciada_em: new Date().toISOString(),
          },
          ultima_mensagem: new Date().toISOString(),
        })
        .eq("id", conversa.id);
      
      console.log("✅ Conversa existente atualizada para avaliação:", conversa.id);
    }

    // 3. Montar mensagem de avaliação
    const primeiroNome = nome_cliente?.split(' ')[0] || 'Cliente';
    const mensagemAvaliacao = `Olá, ${primeiroNome}! 👋\n\n${avaliacaoConfig.mensagem_pedido_nota}\n\n(Responda apenas com um número de 0 a 10)`;

    // 4. Salvar mensagem no banco
    await supabase.from("whatsapp_mensagens").insert({
      tenant_id: tenantId,
      conversa_id: conversa.id,
      tipo: "chat",
      conteudo: mensagemAvaliacao,
      direcao: "saida",
    });

    // 5. Enviar via WhatsApp
    const ultramsgUrl = `https://api.ultramsg.com/${ultramsgInstanceId}/messages/chat`;
    const sendResponse = await fetch(ultramsgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: ultramsgToken,
        to: telefone,
        body: mensagemAvaliacao,
      }),
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error("❌ Erro ao enviar WhatsApp:", sendResponse.status, errorText);
      throw new Error(`Erro Ultramsg: ${sendResponse.status}`);
    }

    console.log("✅ Mensagem de avaliação enviada com sucesso!");

    return new Response(
      JSON.stringify({ 
        status: "success",
        conversa_id: conversa.id,
        mensagem_enviada: true,
        config: {
          threshold: avaliacaoConfig.nota_minima_review,
          tem_link_google: !!avaliacaoConfig.google_reviews_url,
          tem_link_facebook: !!avaliacaoConfig.facebook_reviews_url,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 Erro fatal:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        status: "error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
