import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { days = 60 } = await req.json();
    
    const today = new Date();
    const slots = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      slots.push({
        data: dateStr,
        vagas_disponiveis: Math.floor(Math.random() * 11), // 0 a 10 vagas
        vagas_totais: 10
      });
    }
    
    // Inserir dados (ignora se já existirem)
    const { error } = await supabase
      .from('calendario_disponibilidade')
      .upsert(slots, { onConflict: 'data', ignoreDuplicates: false });
    
    if (error) {
      console.error('Erro ao inicializar calendário:', error);
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: `Calendário inicializado com ${days} dias` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
