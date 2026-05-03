import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { renderTemplateWithFallback } from "../_shared/templateRenderer.ts";
import { enviarWhatsApp } from "../_shared/whatsappSender.ts";
import { isInternalRequestAuthorized } from "../_shared/internalAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-function-secret, x-cron-secret',
};

const PLATFORM_NAME = Deno.env.get('PLATFORM_NAME') ?? 'Limpamais';

/**
 * Edge Function: process-avaliacao-queue
 * Processa a fila de avaliações pós-venda e envia pesquisa de satisfação
 * Executado via CRON a cada 5 minutos
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = isInternalRequestAuthorized(req);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ success: false, error: auth.reason ?? 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('⭐ [process-avaliacao-queue] Iniciando processamento...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar avaliações pendentes (criadas há pelo menos 2 horas - tempo para serviço secar)
    const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data: avaliacoes, error: fetchError } = await supabase
      .from('fila_avaliacoes')
      .select(`
        *,
        agendamentos:agendamento_id (
          id,
          tenant_id,
          nome_cliente,
          telefone,
          data_agendamento,
          valor_total,
          itens_carrinho,
          is_locacao
        )
      `)
      .eq('status', 'pendente')
      .lt('created_at', duasHorasAtras)
      .order('created_at', { ascending: true })
      .limit(30);

    if (fetchError) {
      console.error('❌ Erro ao buscar avaliações:', fetchError);
      throw fetchError;
    }

    if (!avaliacoes || avaliacoes.length === 0) {
      console.log('✅ Nenhuma avaliação pendente');
      return new Response(
        JSON.stringify({ success: true, processados: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📨 ${avaliacoes.length} avaliações a processar`);

    let enviados = 0;
    let erros = 0;

    for (const avaliacao of avaliacoes) {
      try {
        const agendamento = avaliacao.agendamentos;
        const tenantId = avaliacao.tenant_id || agendamento?.tenant_id || null;

        if (!agendamento) {
          console.warn(`⚠️ Agendamento não encontrado para avaliação ${avaliacao.id}`);
          await marcarErro(supabase, avaliacao.id);
          erros++;
          continue;
        }

        if (!avaliacao.telefone) {
          console.warn(`⚠️ Telefone não encontrado para avaliação ${avaliacao.id}`);
          await marcarErro(supabase, avaliacao.id);
          erros++;
          continue;
        }

        if (!tenantId) {
          console.warn(`⚠️ tenant_id ausente para avaliação ${avaliacao.id}`);
          await marcarErro(supabase, avaliacao.id);
          erros++;
          continue;
        }

        // Preparar variáveis
        const itens = Array.isArray(agendamento.itens_carrinho) ? agendamento.itens_carrinho : [];
        const servicos = itens.map((i: any) => i.name || i.nome || i.item).join(', ') || 'higienização';
        const isLocacao = agendamento.is_locacao === true;

        const variaveis = {
          nome: avaliacao.nome_cliente || agendamento.nome_cliente,
          servico: servicos,
          data: new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR'),
          valor: `R$ ${parseFloat(agendamento.valor_total).toFixed(2).replace('.', ',')}`
        };

        // Mensagem diferente para locação vs higienização
        const fallbackHigienizacao = `💙 *Pesquisa de Satisfação* 💙

Olá *${variaveis.nome}*!

Como foi sua experiência com nosso serviço de ${variaveis.servico}?

⭐️ *De 0 a 10, qual nota você daria?*

Responda com um número de 0 a 10.

Seu feedback é muito importante para nós! 😊

🎁 E não esqueça: você tem *10% de desconto* na próxima contratação usando o cupom *VOLTA10*!

💙 *Equipe ${PLATFORM_NAME}*`;

        const fallbackLocacao = `💙 *Pesquisa de Satisfação* 💙

Olá *${variaveis.nome}*!

Como foi sua experiência com a *locação da nossa máquina extratora*? 🧽

⭐️ *De 0 a 10, qual nota você daria?*

Considerando:
✅ Funcionamento da máquina
✅ Atendimento e entrega
✅ Resultado da limpeza que você fez

Responda com um número de 0 a 10.

Seu feedback é muito importante para nós! 😊

🎁 E não esqueça: você tem *10% de desconto* na próxima locação ou higienização com o cupom *VOLTA10*!

💙 *Equipe ${PLATFORM_NAME}*`;

        const fallbackMensagem = isLocacao ? fallbackLocacao : fallbackHigienizacao;
        const templateName = isLocacao ? 'avaliacao-pos-locacao' : 'avaliacao-pos-venda';

        const mensagem = await renderTemplateWithFallback(
          supabase,
          templateName,
          variaveis,
          fallbackMensagem
        );

        // Enviar WhatsApp
        const resultado = await enviarWhatsApp(avaliacao.telefone, mensagem);

        if (!resultado.success) {
          console.error(`❌ Erro ao enviar avaliação para ${avaliacao.telefone}:`, resultado.error);
          erros++;
          continue;
        }

        // Marcar como enviado
        await supabase
          .from('fila_avaliacoes')
          .update({
            status: 'enviado',
            enviado_em: new Date().toISOString()
          })
          .eq('id', avaliacao.id);

        // Atualizar contexto da conversa para modo avaliação
        const telefoneNormalizado = avaliacao.telefone.replace(/\D/g, '');
        const { data: conversaExistente } = await supabase
          .from('whatsapp_conversas')
          .select('id, contexto')
          .eq('tenant_id', tenantId)
          .eq('telefone', telefoneNormalizado)
          .order('criado_em', { ascending: false })
          .limit(1)
          .maybeSingle();

        const contextoAtualizado = {
          ...((conversaExistente?.contexto as Record<string, unknown>) || {}),
          agendamento_id: agendamento.id,
          avaliacao_id: avaliacao.id,
          aguardando_nota: true,
        };

        if (conversaExistente?.id) {
          await supabase
            .from('whatsapp_conversas')
            .update({
              estado_atual: 'avaliacao_pendente',
              contexto: contextoAtualizado,
              finalizado: false,
              ultima_mensagem: new Date().toISOString(),
            })
            .eq('id', conversaExistente.id)
            .eq('tenant_id', tenantId);
        } else {
          await supabase
            .from('whatsapp_conversas')
            .insert({
              tenant_id: tenantId,
              telefone: telefoneNormalizado,
              estado_atual: 'avaliacao_pendente',
              contexto: contextoAtualizado,
              finalizado: false,
              ultima_mensagem: new Date().toISOString(),
            });
        }

        enviados++;
        console.log(`✅ Avaliação enviada: ${avaliacao.nome_cliente}`);

      } catch (error) {
        console.error(`❌ Erro ao processar avaliação ${avaliacao.id}:`, error);
        await marcarErro(supabase, avaliacao.id);
        erros++;
      }
    }

    console.log(`📊 Resultado: ${enviados} enviados, ${erros} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        enviados,
        erros,
        total: avaliacoes.length
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

async function marcarErro(supabase: any, avaliacaoId: string) {
  await supabase
    .from('fila_avaliacoes')
    .update({ status: 'erro' })
    .eq('id', avaliacaoId);
}
