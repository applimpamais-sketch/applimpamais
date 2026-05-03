import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { renderTemplateWithFallback, formatarData, formatarValor } from "../_shared/templateRenderer.ts";
import { enviarWhatsApp } from "../_shared/whatsappSender.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function: send-tecnico-notification
 * Processa a fila de notificações para técnicos e envia via WhatsApp
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 [send-tecnico-notification] Iniciando processamento...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar notificações pendentes
    const { data: notificacoes, error: fetchError } = await supabase
      .from('fila_notificacoes_tecnico')
      .select(`
        *,
        profiles:tecnico_id (
          id,
          nome_completo,
          telefone
        ),
        agendamentos:agendamento_id (
          id,
          nome_cliente,
          telefone,
          endereco,
          bairro,
          cidade,
          data_agendamento,
          horario,
          valor_total,
          itens_carrinho
        )
      `)
      .eq('status', 'pendente')
      .order('created_at', { ascending: true })
      .limit(20);

    if (fetchError) {
      console.error('❌ Erro ao buscar notificações:', fetchError);
      throw fetchError;
    }

    if (!notificacoes || notificacoes.length === 0) {
      console.log('✅ Nenhuma notificação pendente');
      return new Response(
        JSON.stringify({ success: true, processados: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📨 ${notificacoes.length} notificações a processar`);

    let enviados = 0;
    let erros = 0;

    for (const notificacao of notificacoes) {
      try {
        const tecnico = notificacao.profiles;
        const agendamento = notificacao.agendamentos;

        if (!tecnico || !tecnico.telefone) {
          console.warn(`⚠️ Técnico sem telefone para notificação ${notificacao.id}`);
          await marcarErro(supabase, notificacao.id, 'Técnico sem telefone cadastrado');
          erros++;
          continue;
        }

        if (!agendamento) {
          console.warn(`⚠️ Agendamento não encontrado para notificação ${notificacao.id}`);
          await marcarErro(supabase, notificacao.id, 'Agendamento não encontrado');
          erros++;
          continue;
        }

        // Preparar variáveis para o template
        const itens = Array.isArray(agendamento.itens_carrinho) ? agendamento.itens_carrinho : [];
        const listaServicos = itens.map((i: any) => `• ${i.name || i.item}`).join('\n');

        const variaveis = {
          nome_tecnico: tecnico.nome_completo || 'Técnico',
          nome_cliente: agendamento.nome_cliente,
          telefone_cliente: agendamento.telefone,
          endereco: agendamento.endereco,
          bairro: agendamento.bairro,
          cidade: agendamento.cidade,
          endereco_completo: `${agendamento.endereco}, ${agendamento.bairro} - ${agendamento.cidade}`,
          data: formatarData(agendamento.data_agendamento),
          data_agendamento: formatarData(agendamento.data_agendamento),
          horario: agendamento.horario || 'A confirmar',
          valor: formatarValor(agendamento.valor_total),
          valor_total: formatarValor(agendamento.valor_total),
          servicos: listaServicos || 'Higienização',
          observacoes: ''
        };

        // Escolher template baseado no tipo
        const templateNome = getTemplateNome(notificacao.tipo);
        const fallbackMensagem = gerarMensagemFallback(notificacao.tipo, variaveis);

        const mensagem = await renderTemplateWithFallback(
          supabase,
          templateNome,
          variaveis,
          fallbackMensagem
        );

        // Enviar WhatsApp
        const resultado = await enviarWhatsApp(tecnico.telefone, mensagem);

        if (!resultado.success) {
          console.error(`❌ Erro ao enviar para técnico ${tecnico.nome_completo}:`, resultado.error);
          await marcarErro(supabase, notificacao.id, resultado.error || 'Erro ao enviar');
          erros++;
          continue;
        }

        // Marcar como enviado
        await supabase
          .from('fila_notificacoes_tecnico')
          .update({
            status: 'enviado',
            enviado_em: new Date().toISOString()
          })
          .eq('id', notificacao.id);

        enviados++;
        console.log(`✅ Notificação enviada: ${notificacao.tipo} → ${tecnico.nome_completo}`);

      } catch (error) {
        console.error(`❌ Erro ao processar notificação ${notificacao.id}:`, error);
        await marcarErro(supabase, notificacao.id, error instanceof Error ? error.message : 'Erro desconhecido');
        erros++;
      }
    }

    console.log(`📊 Resultado: ${enviados} enviados, ${erros} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        enviados,
        erros,
        total: notificacoes.length
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

async function marcarErro(supabase: any, notificacaoId: string, erro: string) {
  await supabase
    .from('fila_notificacoes_tecnico')
    .update({
      status: 'erro',
      erro_mensagem: erro
    })
    .eq('id', notificacaoId);
}

function getTemplateNome(tipo: string): string {
  const mapeamento: Record<string, string> = {
    'novo_servico': 'Novo Serviço Atribuído',
    'reatribuicao': 'Serviço Reatribuído',
    'rota_diaria': 'Rota Diária Técnico'
  };
  return mapeamento[tipo] || tipo;
}

function gerarMensagemFallback(tipo: string, vars: Record<string, string>): string {
  switch (tipo) {
    case 'novo_servico':
      return `🆕 *Novo Serviço Atribuído!*

Olá *${vars.nome_tecnico}*!

Você foi atribuído a um novo serviço:

👩 *Cliente:* ${vars.nome_cliente}
📱 *Telefone:* ${vars.telefone_cliente}

📅 *Data:* ${vars.data}
⏰ *Horário:* ${vars.horario}

📍 *Endereço:*
${vars.endereco}
${vars.bairro} - ${vars.cidade}

🧽 *Serviços:*
${vars.servicos}

💰 *Valor:* ${vars.valor}

✅ Confirme recebimento respondendo OK

💙 *RC Limpa+*`;

    case 'reatribuicao':
      return `🔄 *Serviço Reatribuído*

Olá *${vars.nome_tecnico}*!

Um serviço foi reatribuído para você:

👩 *Cliente:* ${vars.nome_cliente}
📅 *Data:* ${vars.data}
⏰ *Horário:* ${vars.horario}
📍 *Local:* ${vars.endereco}, ${vars.bairro}

💰 *Valor:* ${vars.valor}

✅ Confirme recebimento respondendo OK

💙 *RC Limpa+*`;

    case 'rota_diaria':
      return `📋 *Rota do Dia - ${vars.data}*

Bom dia *${vars.nome_tecnico}*!

Aqui está sua rota de hoje:

${vars.servicos}

Bom trabalho! 💪

💙 *RC Limpa+*`;

    default:
      return `Olá ${vars.nome_tecnico}, você tem uma nova notificação!`;
  }
}
