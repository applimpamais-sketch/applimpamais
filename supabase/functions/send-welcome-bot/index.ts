import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { SITE_DOMAIN, TECH_PORTAL_URL, PARTNER_PORTAL_URL, getPartnerLink } from '../_shared/siteConfig.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WelcomeRequest {
  tipo: 'funcionario' | 'tecnico' | 'parceiro';
  nome: string;
  telefone: string;
  codigo?: string; // código de referência do parceiro
}

// Mapeia tipo para nome do template
const TEMPLATE_MAP: Record<string, string> = {
  'funcionario': 'Boas-vindas Funcionário Bot',
  'tecnico': 'Boas-vindas Técnico Bot',
  'parceiro': 'Boas-vindas Parceiro Bot',
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

    const { tipo = 'funcionario', nome, telefone, codigo }: WelcomeRequest = await req.json();
    
    console.log(`[send-welcome-bot] Enviando boas-vindas (${tipo}) para:`, { nome, telefone });

    // Buscar template correto baseado no tipo
    const templateNome = TEMPLATE_MAP[tipo] || TEMPLATE_MAP['funcionario'];
    
    const { data: template, error: templateError } = await supabase
      .from('templates_mensagens')
      .select('*')
      .eq('nome', templateNome)
      .eq('ativo', true)
      .maybeSingle();

    if (templateError || !template) {
      console.error('Template não encontrado:', templateNome, templateError);
      throw new Error(`Template "${templateNome}" não encontrado`);
    }

    // Substituir variáveis no template
    let mensagemFinal = template.conteudo
      .replace(/{nome_funcionario}/g, nome)
      .replace(/{nome}/g, nome);
    
    // Variáveis específicas por tipo
    if (tipo === 'tecnico') {
      mensagemFinal = mensagemFinal
        .replace(/{link_portal}/g, TECH_PORTAL_URL);
    } else if (tipo === 'parceiro' && codigo) {
      mensagemFinal = mensagemFinal
        .replace(/{link_indicacao}/g, getPartnerLink(codigo))
        .replace(/{link_portal}/g, PARTNER_PORTAL_URL);
    }

    // Enviar via UltraMsg Bot (instância ativa)
    const ultramsgToken = Deno.env.get('ULTRAMSG_BOT_TOKEN');
    const ultramsgInstance = Deno.env.get('ULTRAMSG_BOT_INSTANCE_ID');

    if (!ultramsgToken || !ultramsgInstance) {
      throw new Error('Credenciais do UltraMsg Bot não configuradas');
    }

    const response = await fetch(
      `https://api.ultramsg.com/${ultramsgInstance}/messages/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ultramsgToken,
          to: telefone,
          body: mensagemFinal,
        }),
      }
    );

    const result = await response.json();
    console.log(`[send-welcome-bot] Resposta UltraMsg (${tipo}):`, result);

    // Incrementar contador de uso do template
    await supabase
      .from('templates_mensagens')
      .update({ uso_count: template.uso_count + 1 })
      .eq('id', template.id);

    // Registrar comunicação
    await supabase
      .from('comunicacoes')
      .insert({
        tipo: `whatsapp_boas_vindas_${tipo}`,
        mensagem: mensagemFinal,
        status_entrega: result.sent === 'true' ? 'enviado' : 'erro',
        template_usado: template.nome,
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Mensagem de boas-vindas (${tipo}) enviada com sucesso`,
        ultramsg_response: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[send-welcome-bot] Erro ao enviar boas-vindas:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
