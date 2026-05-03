import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { renderTemplateWithFallback, formatarData } from "../_shared/templateRenderer.ts";
import { enviarWhatsApp } from "../_shared/whatsappSender.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔔 Verificando lembretes pendentes...');

    // Buscar lembretes a enviar (próximos 5 minutos)
    const agora = new Date();
    const proximosMinutos = new Date(agora.getTime() + 5 * 60 * 1000);

    const { data: lembretes, error } = await supabase
      .from('whatsapp_lembretes')
      .select(`
        *,
        agendamentos (
          id,
          nome_cliente,
          telefone,
          endereco,
          bairro,
          cidade,
          data_agendamento,
          horario,
          valor_total
        )
      `)
      .eq('enviado', false)
      .gte('agendado_para', agora.toISOString())
      .lte('agendado_para', proximosMinutos.toISOString());

    if (error) {
      console.error('Erro ao buscar lembretes:', error);
      throw error;
    }

    if (!lembretes || lembretes.length === 0) {
      console.log('Nenhum lembrete pendente');
      return new Response(
        JSON.stringify({ success: true, enviados: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📨 ${lembretes.length} lembretes a enviar`);

    let enviados = 0;
    let erros = 0;

    for (const lembrete of lembretes) {
      try {
        const agendamento = lembrete.agendamentos;
        
        if (!agendamento) {
          console.warn(`Agendamento não encontrado para lembrete ${lembrete.id}`);
          continue;
        }

        // Preparar variáveis para o template
        const variaveis = {
          nome: agendamento.nome_cliente,
          data: formatarData(agendamento.data_agendamento),
          horario: agendamento.horario || 'A confirmar',
          endereco: agendamento.endereco,
          bairro: agendamento.bairro,
          cidade: agendamento.cidade,
          valor: `R$ ${parseFloat(agendamento.valor_total).toFixed(2).replace('.', ',')}`
        };

        // Mapear tipo para nome do template
        const templateNome = getTemplateNome(lembrete.tipo);
        const fallbackMensagem = gerarMensagemLembreteFallback(lembrete.tipo, agendamento);

        // Buscar template do banco ou usar fallback
        const mensagem = await renderTemplateWithFallback(
          supabase,
          templateNome,
          variaveis,
          fallbackMensagem
        );

        // Enviar via UltraMsg usando função compartilhada
        const resultado = await enviarWhatsApp(agendamento.telefone, mensagem);

        if (!resultado.success) {
          console.error(`❌ Erro ao enviar para ${agendamento.telefone}:`, resultado.error);
          erros++;
          continue;
        }

        // Marcar como enviado
        await supabase
          .from('whatsapp_lembretes')
          .update({
            enviado: true,
            enviado_em: new Date().toISOString(),
            mensagem
          })
          .eq('id', lembrete.id);

        enviados++;
        console.log(`✅ Lembrete enviado: ${lembrete.tipo} → ${agendamento.nome_cliente}`);

      } catch (error) {
        console.error(`Erro ao processar lembrete ${lembrete.id}:`, error);
        erros++;
      }
    }

    console.log(`📊 Resultado: ${enviados} enviados, ${erros} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        enviados,
        erros,
        total: lembretes.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Mapeia tipo de lembrete para nome do template no banco
 */
function getTemplateNome(tipo: string): string {
  const mapeamento: Record<string, string> = {
    '1_dia_antes': 'Lembrete 1 Dia Antes',
    'dia_do_servico': 'Lembrete Dia do Serviço',
    'pos_venda': 'Agradecimento Pós-Serviço'
  };
  return mapeamento[tipo] || tipo;
}

/**
 * Fallback caso template não exista no banco
 */
function gerarMensagemLembreteFallback(tipo: string, agendamento: any): string {
  const formatarDataLocal = (data: string) => {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const dataFormatada = formatarDataLocal(agendamento.data_agendamento);

  switch (tipo) {
    case '1_dia_antes':
      return `🔔 *Lembrete de Serviço* 🔔

Olá *${agendamento.nome_cliente}*! 

Amanhã temos agendado seu serviço de higienização:

📅 *Data:* ${dataFormatada}
⏰ *Horário:* ${agendamento.horario}
📍 *Local:* ${agendamento.endereco}, ${agendamento.bairro} - ${agendamento.cidade}
💰 *Valor:* R$ ${parseFloat(agendamento.valor_total).toFixed(2)}

✅ Responda *OK* para confirmar sua presença
❌ Responda *CANCELAR* se precisar reagendar

💙 *Equipe RC Limpa+*`;

    case 'dia_do_servico':
      return `✨ *Dia do Serviço!* ✨

Bom dia *${agendamento.nome_cliente}*! 

Hoje é o dia do seu serviço de higienização:

⏰ *Horário previsto:* ${agendamento.horario}
📍 *Local:* ${agendamento.endereco}, ${agendamento.bairro}

🚐 Nosso técnico está a caminho!

Em breve você terá seus estofados limpos e higienizados. ✨

💙 *RC Limpa+ - Higienização Profissional*`;

    case 'pos_venda':
      return `💙 *Pesquisa de Satisfação* 💙

Olá *${agendamento.nome_cliente}*! 

Como foi sua experiência com nosso serviço de higienização? 

⭐️ *De 0 a 10, qual nota você daria?*

Seu feedback é muito importante para nós! 😊

📸 Se possível, envie fotos do resultado!

🎁 E não esqueça: você tem *10% de desconto* na próxima contratação!

💙 *Equipe RC Limpa+*
📞 Entre em contato se precisar de qualquer coisa!`;

    default:
      return `Olá ${agendamento.nome_cliente}, temos uma atualização sobre seu agendamento!`;
  }
}
