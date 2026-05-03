import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { HttpError, requireTenantAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const requestedTenantId =
      typeof body?.tenant_id === "string" ? body.tenant_id : null;
    const daysRaw = Number(body?.days ?? 60);
    const days = Number.isFinite(daysRaw)
      ? Math.min(Math.max(Math.floor(daysRaw), 1), 365)
      : 60;

    const { adminClient, effectiveTenantId } = await requireTenantAdmin(req, requestedTenantId);

    const today = new Date();
    const slots: Array<{ tenant_id: string; data: string; vagas_disponiveis: number; vagas_totais: number }> = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      slots.push({
        tenant_id: effectiveTenantId,
        data: dateStr,
        vagas_disponiveis: 10,
        vagas_totais: 10,
      });
    }

    const { error } = await adminClient
      .from("calendario_disponibilidade")
      .upsert(slots, { onConflict: "tenant_id,data", ignoreDuplicates: false });

    if (error) {
      throw new HttpError(500, error.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Calendario inicializado com ${days} dias`,
        tenant_id: effectiveTenantId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
