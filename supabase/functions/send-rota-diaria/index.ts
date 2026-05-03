import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { renderTemplateWithFallback, formatarData, formatarDataCompleta } from "../_shared/templateRenderer.ts";
import { enviarWhatsApp } from "../_shared/whatsappSender.ts";
import { TECH_PORTAL_URL } from "../_shared/siteConfig.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function: send-rota-diaria
 * Envia resumo diário da rota de serviços para cada técnico às 07:00
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📋 [send-rota-diaria] Iniciando envio de rotas diárias...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar data de hoje
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];

    console.log(`📅 Buscando agendamentos para ${hojeStr}...`);

    // Buscar todos os agendamentos de hoje que têm técnico atribuído
    const { data: agendamentos, error: fetchError } = await supabase
      .from('agendamentos')
      .select(`
        *,
        profiles:tecnico_id (
          id,
          nome_completo,
          telefone
        )
      `)
      .eq('data_agendamento', hojeStr)
      .not('tecnico_id', 'is', null)
      .in('status', ['confirmado', 'agendado', 'atribuido'])
      .order('horario', { ascending: true });

    if (fetchError) {
      console.error('❌ Erro ao buscar agendamentos:', fetchError);
      throw fetchError;
    }

    if (!agendamentos || agendamentos.length === 0) {
      console.log('✅ Nenhum agendamento com técnico para hoje');
      return new Response(
        JSON.stringify({ success: true, enviados: 0, message: 'Sem rotas para hoje' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 ${agendamentos.length} agendamentos encontrados`);

    // Agrupar agendamentos por técnico
    const porTecnico: Record<string, { tecnico: any; agendamentos: any[] }> = {};

    for (const ag of agendamentos) {
      const tecnicoId = ag.tecnico_id;
      if (!porTecnico[tecnicoId]) {
        porTecnico[tecnicoId] = {
          tecnico: ag.profiles,
          agendamentos: []
        };
      }
      porTecnico[tecnicoId].agendamentos.push(ag);
    }

    console.log(`👷 ${Object.keys(porTecnico).length} técnicos com serviços hoje`);

    let enviados = 0;
    let erros = 0;

    for (const [tecnicoId, dados] of Object.entries(porTecnico)) {
      try {
        const { tecnico, agendamentos: servicos } = dados;

        if (!tecnico || !tecnico.telefone) {
          console.warn(`⚠️ Técnico ${tecnicoId} sem telefone`);
          erros++;
          continue;
        }

        // Montar lista de serviços
        let listaServicos = '';
        let valorTotalDia = 0;

        servicos.forEach((ag, index) => {
          const itens = Array.isArray(ag.itens_carrinho) ? ag.itens_carrinho : [];
          const servico = itens.map((i: any) => i.name || i.item).join(', ') || 'Higienização';
          
          listaServicos += `\n*${index + 1}. ${ag.horario || 'A confirmar'}* - ${ag.nome_cliente}`;
          listaServicos += `\n   📍 ${ag.endereco}, ${ag.bairro}`;
          listaServicos += `\n   📱 ${ag.telefone}`;
          listaServicos += `\n   🧽 ${servico}`;
          listaServicos += `\n   💰 R$ ${parseFloat(ag.valor_total).toFixed(2).replace('.', ',')}`;
          listaServicos += '\n';

          valorTotalDia += parseFloat(ag.valor_total);
        });

        const variaveis = {
          nome_tecnico: tecnico.nome_completo || 'Técnico',
          data_rota: formatarDataCompleta(hoje),
          quantidade_servicos: servicos.length.toString(),
          total_servicos: servicos.length.toString(),
          lista_servicos: listaServicos.trim(),
          valor_total_dia: `R$ ${valorTotalDia.toFixed(2).replace('.', ',')}`,
          link_portal: TECH_PORTAL_URL
        };

        const fallbackMensagem = `📋 *Rota do Dia - ${formatarData(hoje)}*

Bom dia *${variaveis.nome_tecnico}*! ☀️

Você tem *${variaveis.quantidade_servicos} serviço(s)* agendado(s) para hoje:

${variaveis.lista_servicos}

━━━━━━━━━━━━━━━━━━━━
💰 *Total do dia:* ${variaveis.valor_total_dia}
━━━━━━━━━━━━━━━━━━━━

⚠️ Confirme cada serviço após conclusão no app!

Bom trabalho! 💪

💙 *RC Limpa+*`;

        const mensagem = await renderTemplateWithFallback(
          supabase,
          'Rota Diária Técnico',
          variaveis,
          fallbackMensagem
        );

        // Enviar WhatsApp
        const resultado = await enviarWhatsApp(tecnico.telefone, mensagem);

        if (!resultado.success) {
          console.error(`❌ Erro ao enviar rota para ${tecnico.nome_completo}:`, resultado.error);
          erros++;
          continue;
        }

        // Registrar na fila como enviado
        await supabase
          .from('fila_notificacoes_tecnico')
          .insert({
            tecnico_id: tecnicoId,
            tipo: 'rota_diaria',
            status: 'enviado',
            enviado_em: new Date().toISOString()
          });

        enviados++;
        console.log(`✅ Rota enviada para ${tecnico.nome_completo}: ${servicos.length} serviços`);

      } catch (error) {
        console.error(`❌ Erro ao processar técnico ${tecnicoId}:`, error);
        erros++;
      }
    }

    console.log(`📊 Resultado final: ${enviados} enviados, ${erros} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        data: hojeStr,
        tecnicos: Object.keys(porTecnico).length,
        enviados,
        erros
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
