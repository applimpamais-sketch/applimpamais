import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteMemberRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { userId }: DeleteMemberRequest = await req.json();
    
    console.log(`[delete-team-member] Removendo usuário: ${userId}`);

    // Deletar usuário do auth (cascateia para profiles e user_roles)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error(`[delete-team-member] Erro ao deletar usuário:`, deleteError);
      throw deleteError;
    }

    console.log(`[delete-team-member] Usuário removido com sucesso`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Membro removido com sucesso'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("[delete-team-member] Erro:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Erro ao remover membro"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
