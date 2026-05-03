 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const { codigo } = await req.json();
     
     if (!codigo || typeof codigo !== 'string') {
       console.warn('[track-canal-click] Código inválido recebido');
       return new Response(
         JSON.stringify({ success: false, error: 'Código do canal é obrigatório' }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
       );
     }
 
     const supabaseUrl = Deno.env.get('SUPABASE_URL');
     const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 
     if (!supabaseUrl || !serviceRoleKey) {
       console.error('[track-canal-click] Variáveis de ambiente ausentes');
       return new Response(
         JSON.stringify({ success: false, error: 'Configuração do servidor ausente' }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
       );
     }
 
     const supabase = createClient(supabaseUrl, serviceRoleKey);
     
     // Normalizar código
     const codigoNormalized = codigo.toLowerCase().trim();
     
     // Incrementar cliques usando a função do banco
     const { error } = await supabase.rpc('increment_canal_cliques', {
       canal_codigo: codigoNormalized
     });
 
     if (error) {
       console.error('[track-canal-click] Erro ao incrementar cliques:', error);
       return new Response(
         JSON.stringify({ success: false, error: 'Erro ao registrar clique' }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
       );
     }
 
     console.log(`[track-canal-click] Clique registrado: ${codigoNormalized}`);
     
     return new Response(
       JSON.stringify({ success: true, codigo: codigoNormalized }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
     );
 
   } catch (error) {
     console.error('[track-canal-click] Erro inesperado:', error);
     return new Response(
       JSON.stringify({ success: false, error: 'Erro interno' }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
     );
   }
 });