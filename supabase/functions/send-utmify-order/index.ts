import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agendamento_id, status, api_token } = await req.json();

    if (!agendamento_id || !api_token) {
      return new Response(
        JSON.stringify({ error: "Missing agendamento_id or api_token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch agendamento
    const { data: ag, error: agError } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("id", agendamento_id)
      .single();

    if (agError || !ag) {
      console.error("Agendamento not found:", agError);
      return new Response(
        JSON.stringify({ error: "Agendamento not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map status
    const statusMap: Record<string, string> = {
      pendente: "waiting_payment",
      confirmado: "waiting_payment",
      pago: "paid",
      concluido: "paid",
      cancelado: "refunded",
      reembolsado: "refunded",
    };

    const utmifyStatus = statusMap[status || ag.status] || "waiting_payment";

    // Parse itens_carrinho
    const itens = Array.isArray(ag.itens_carrinho) ? ag.itens_carrinho : [];
    const products = itens.map((item: any, idx: number) => ({
      id: item.id || `product-${idx + 1}`,
      name: item.name || item.nome || "Serviço",
      planId: item.id || `plan-${idx + 1}`,
      planName: item.name || item.nome || "Serviço de Limpeza",
      quantity: item.quantity || item.quantidade || 1,
      priceInCents: Math.round((item.price || item.preco || 0) * 100),
    }));

    if (products.length === 0) {
      products.push({
        id: "servico-limpeza",
        name: "Serviço de Limpeza",
        planId: "plano-padrao",
        planName: "Serviço de Limpeza",
        quantity: 1,
        priceInCents: Math.round((ag.valor_total || 0) * 100),
      });
    }

    // Extract UTM params from origem field
    const origemParts = ag.origem ? ag.origem.split("|") : [];
    const trackingParameters = {
      src: ag.origem || null,
      sck: ag.canal_origem || null,
      utm_source: (origemParts.length >= 2 ? origemParts[1] : ag.canal_origem) || null,
      utm_medium: ag.canal_origem || null,
      utm_campaign: (origemParts.length >= 3 ? origemParts[2] : null) || null,
      utm_content: null as string | null,
      utm_term: null as string | null,
    };

    // Map payment method - UTMify accepts: credit_card, boleto, pix, paypal, free_price, unknown
    const paymentMethodMap: Record<string, string> = {
      pix: "pix",
      cartao: "credit_card",
      "cartão": "credit_card",
      "cartao_credito": "credit_card",
      "cartao_debito": "credit_card",
      dinheiro: "unknown",
      boleto: "boleto",
    };

    // Build UTMify payload
    const payload = {
      orderId: ag.order_code || ag.id,
      platform: "RCLimpaMais",
      paymentMethod: paymentMethodMap[ag.forma_pagamento || ""] || "unknown",
      status: utmifyStatus,
      createdAt: ag.created_at,
      approvedDate: ag.pago_em || ag.concluido_em || null,
      refundedAt: status === "reembolsado" ? new Date().toISOString() : null,
      customer: {
        name: ag.nome_cliente,
        email: "",
        phone: ag.telefone,
        document: "",
        country: "BR",
      },
      products,
      trackingParameters,
      commission: {
        totalPriceInCents: Math.round((ag.valor_total || 0) * 100),
        gatewayFeeInCents: 0,
        userCommissionInCents: Math.round((ag.valor_total || 0) * 100),
      },
    };

    console.log("[UTMify] Sending order:", JSON.stringify(payload));

    // Send to UTMify API
    const utmifyResponse = await fetch(
      "https://api.utmify.com.br/api-credentials/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-token": api_token,
        },
        body: JSON.stringify(payload),
      }
    );

    const responseBody = await utmifyResponse.text();
    const sucesso = utmifyResponse.ok;

    console.log(`[UTMify] Response ${utmifyResponse.status}: ${responseBody}`);

    // Log the send
    await supabase.from("utmify_envios").insert({
      agendamento_id: ag.id,
      status_enviado: utmifyStatus,
      utmify_response: { status: utmifyResponse.status, body: responseBody },
      sucesso,
      erro_mensagem: sucesso ? null : responseBody,
      tenant_id: ag.tenant_id,
    });

    return new Response(
      JSON.stringify({ success: sucesso, status: utmifyResponse.status, body: responseBody }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[UTMify] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
