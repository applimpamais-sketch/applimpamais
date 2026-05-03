import { createClient } from "npm:@supabase/supabase-js@2.77.0";

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
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token || token.length < 10) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou ausente" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate token against integracoes table
    const { data: integracao, error: integracaoError } = await supabase
      .from("integracoes")
      .select("id, tenant_id, configuracao, status")
      .eq("tipo", "utmify")
      .eq("status", "ativo")
      .limit(10);

    if (integracaoError) {
      console.error("Erro ao buscar integração:", integracaoError);
      return new Response(
        JSON.stringify({ error: "Erro interno" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validIntegration = integracao?.find(
      (i: any) => i.configuracao?.webhook_token === token
    );

    if (!validIntegration) {
      return new Response(
        JSON.stringify({ error: "Token não autorizado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tenantId = validIntegration.tenant_id || (validIntegration.configuracao as any)?.tenant_id || null;

    // Parse body
    let body: any;
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      // Try JSON anyway
      try {
        body = await req.json();
      } catch {
        const text = await req.text();
        body = { raw: text };
      }
    }

    console.log("📦 UTMify payload recebido:", JSON.stringify(body).substring(0, 500));

    // Map UTMify fields (UTMify sends various field formats)
    const orderId = body.order_id || body.orderId || body.transaction_id || body.id || null;
    const status = mapStatus(body.status || body.payment_status || "pendente");
    const valor = parseFloat(body.value || body.amount || body.price || body.valor || "0") || 0;
    const campanha = body.campaign || body.utm_campaign || body.campanha || null;
    const adSet = body.ad_set || body.adset || body.adSet || null;
    const adName = body.ad_name || body.adName || body.ad || null;
    const utmSource = body.utm_source || body.src || null;
    const utmMedium = body.utm_medium || null;
    const utmCampaign = body.utm_campaign || campanha || null;
    const utmContent = body.utm_content || null;
    const utmTerm = body.utm_term || null;
    const plataforma = body.platform || body.plataforma || body.src || "utmify";
    const custoCampanha = parseFloat(body.cost || body.custo || body.ad_cost || "0") || 0;

    // Check for existing event with same order_id to prevent status regression
    if (orderId) {
      const existingQuery = supabase
        .from("utmify_events")
        .select("id, status")
        .eq("order_id", orderId)
        .limit(1);
      const { data: existing } = tenantId
        ? await existingQuery.eq("tenant_id", tenantId).maybeSingle()
        : await existingQuery.maybeSingle();

      if (existing) {
        const statusPriority: Record<string, number> = {
          pendente: 1,
          aguardando: 2,
          pago: 3,
          completo: 3,
          reembolsado: 4,
          chargeback: 5,
        };

        const currentPriority = statusPriority[existing.status] || 0;
        const newPriority = statusPriority[status] || 0;

        if (newPriority <= currentPriority && status !== existing.status) {
          console.log(`⚠️ Status regressivo bloqueado: ${existing.status} → ${status}`);
          // Update other fields but keep the higher status
          const { error: updateError } = await supabase
            .from("utmify_events")
            .update({
              payload_raw: body,
              updated_at: new Date().toISOString(),
              ...(custoCampanha > 0 ? { custo_campanha: custoCampanha } : {}),
            })
            .eq("id", existing.id);

          if (updateError) console.error("Erro update:", updateError);

          return new Response(
            JSON.stringify({ success: true, action: "updated_metadata", id: existing.id }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update existing event
        const { error: updateError } = await supabase
          .from("utmify_events")
          .update({
            status,
            valor: valor > 0 ? valor : undefined,
            custo_campanha: custoCampanha > 0 ? custoCampanha : undefined,
            payload_raw: body,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) console.error("Erro update:", updateError);

        // Update integração último uso
        let integrationUpdateQuery = supabase
          .from("integracoes")
          .update({ ultimo_uso: new Date().toISOString() })
          .eq("id", validIntegration.id);
        if (tenantId) integrationUpdateQuery = integrationUpdateQuery.eq("tenant_id", tenantId);
        await integrationUpdateQuery;

        return new Response(
          JSON.stringify({ success: true, action: "updated", id: existing.id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Insert new event
    const { data: inserted, error: insertError } = await supabase
      .from("utmify_events")
      .insert({
        tenant_id: tenantId,
        order_id: orderId,
        status,
        valor,
        plataforma,
        campanha,
        ad_set: adSet,
        ad_name: adName,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
        custo_campanha: custoCampanha,
        payload_raw: body,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Erro insert:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar evento" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update integração último uso
    let integrationUpdateQuery = supabase
      .from("integracoes")
      .update({ ultimo_uso: new Date().toISOString() })
      .eq("id", validIntegration.id);
    if (tenantId) integrationUpdateQuery = integrationUpdateQuery.eq("tenant_id", tenantId);
    await integrationUpdateQuery;

    // Update campaign summary (upsert)
    if (campanha || utmCampaign) {
      const campaignName = campanha || utmCampaign;
      const today = new Date().toISOString().split("T")[0];

      const isPago = ["pago", "completo"].includes(status);
      const isReembolso = ["reembolsado", "chargeback"].includes(status);

      const { data: existingSummary } = await supabase
        .from("utmify_campanhas_resumo")
        .select("*")
        .eq("campanha", campaignName)
        .eq("periodo", today)
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (existingSummary) {
        const updates: any = { updated_at: new Date().toISOString() };
        if (isPago) {
          updates.total_vendas = (existingSummary.total_vendas || 0) + 1;
          updates.total_valor = (existingSummary.total_valor || 0) + valor;
        }
        if (isReembolso) {
          updates.total_reembolsos = (existingSummary.total_reembolsos || 0) + 1;
          updates.valor_reembolsos = (existingSummary.valor_reembolsos || 0) + valor;
        }
        if (custoCampanha > 0) {
          updates.custo_ads = (existingSummary.custo_ads || 0) + custoCampanha;
        }
        // Recalculate ROAS
        const totalValor = updates.total_valor ?? existingSummary.total_valor ?? 0;
        const custoTotal = updates.custo_ads ?? existingSummary.custo_ads ?? 0;
        updates.roas = custoTotal > 0 ? totalValor / custoTotal : 0;
        updates.cpa = (updates.total_vendas ?? existingSummary.total_vendas ?? 0) > 0
          ? custoTotal / (updates.total_vendas ?? existingSummary.total_vendas ?? 1)
          : 0;

        await supabase
          .from("utmify_campanhas_resumo")
          .update(updates)
          .eq("id", existingSummary.id);
      } else {
        await supabase.from("utmify_campanhas_resumo").insert({
          tenant_id: tenantId,
          campanha: campaignName,
          periodo: today,
          total_vendas: isPago ? 1 : 0,
          total_valor: isPago ? valor : 0,
          total_reembolsos: isReembolso ? 1 : 0,
          valor_reembolsos: isReembolso ? valor : 0,
          custo_ads: custoCampanha,
          roas: custoCampanha > 0 && isPago ? valor / custoCampanha : 0,
          cpa: custoCampanha > 0 && isPago ? custoCampanha : 0,
        });
      }
    }

    console.log(`✅ UTMify evento processado: ${inserted?.id} status=${status}`);

    return new Response(
      JSON.stringify({ success: true, action: "created", id: inserted?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Erro no webhook UTMify:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function mapStatus(raw: string): string {
  const normalized = raw.toLowerCase().trim();
  const map: Record<string, string> = {
    pending: "pendente",
    pendente: "pendente",
    waiting: "aguardando",
    aguardando: "aguardando",
    approved: "pago",
    paid: "pago",
    pago: "pago",
    complete: "completo",
    completed: "completo",
    completo: "completo",
    refunded: "reembolsado",
    reembolsado: "reembolsado",
    refund: "reembolsado",
    chargeback: "chargeback",
    chargedback: "chargeback",
    canceled: "cancelado",
    cancelled: "cancelado",
    cancelado: "cancelado",
  };
  return map[normalized] || "pendente";
}
