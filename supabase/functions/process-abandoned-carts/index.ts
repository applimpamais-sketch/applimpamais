import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { renderTemplateWithFallback } from "../_shared/templateRenderer.ts";
import { enviarWhatsApp } from "../_shared/whatsappSender.ts";
import { SITE_DOMAIN } from "../_shared/siteConfig.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CarrinhoAbandonado {
  id: string;
  session_id: string;
  nome_cliente: string | null;
  telefone: string | null;
  email: string | null;
  etapa_abandonada: string;
  itens_carrinho: any;
  valor_total: number;
  cupom_codigo: string | null;
  cupom_desconto_percentual: number | null;
  valor_desconto: number;
  endereco: string | null;
  data_agendamento: string | null;
  percentual_preenchimento: number;
  created_at: string;
  tentativas_contato: number;
  tipo_ultima_mensagem: string | null;
}

const PLATFORM_NAME = Deno.env.get('PLATFORM_NAME') ?? 'Limpamais';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 [CRON] Iniciando processamento de carrinhos abandonados');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('⚠️ MODO TESTE: Verificação de horário comercial desativada');

    const agora = Date.now();
    const doisMinutosAtras = new Date(agora - 2 * 60 * 1000).toISOString();
    const trintaMinutosAtras = new Date(agora - 30 * 60 * 1000).toISOString();
    const vinteQuatroHorasAtras = new Date(agora - 24 * 60 * 60 * 1000).toISOString();

    // Buscar carrinhos para 1ª tentativa (2 min, sem contato)
    const { data: primeiraTentativa, error: err1 } = await supabase
      .from('carrinhos_abandonados')
      .select('*')
      .eq('status', 'abandonado')
      .eq('tentativas_contato', 0)
      .not('telefone', 'is', null)
      .lt('created_at', doisMinutosAtras)
      .order('created_at', { ascending: true })
      .limit(30);

    // Buscar carrinhos para 2ª tentativa (30 min, 1 contato)
    const { data: segundaTentativa, error: err2 } = await supabase
      .from('carrinhos_abandonados')
      .select('*')
      .in('status', ['abandonado', 'contatado'])
      .eq('tentativas_contato', 1)
      .eq('tipo_ultima_mensagem', 'padrao')
      .not('telefone', 'is', null)
      .lt('ultima_tentativa_contato', trintaMinutosAtras)
      .order('created_at', { ascending: true })
      .limit(20);

    // Buscar carrinhos para 3ª tentativa (24h, 2 contatos)
    const { data: terceiraTentativa, error: err3 } = await supabase
      .from('carrinhos_abandonados')
      .select('*')
      .in('status', ['abandonado', 'contatado'])
      .eq('tentativas_contato', 2)
      .eq('tipo_ultima_mensagem', 'com_cupom')
      .not('telefone', 'is', null)
      .lt('ultima_tentativa_contato', vinteQuatroHorasAtras)
      .order('created_at', { ascending: true })
      .limit(10);

    if (err1 || err2 || err3) {
      console.error('❌ Erro ao buscar carrinhos:', { err1, err2, err3 });
      throw new Error('Erro ao buscar carrinhos abandonados');
    }

    const carrinhosPrimeira = (primeiraTentativa || []) as CarrinhoAbandonado[];
    const carrinhosSegunda = (segundaTentativa || []) as CarrinhoAbandonado[];
    const carrinhosTerceira = (terceiraTentativa || []) as CarrinhoAbandonado[];

    const totalCarrinhos = carrinhosPrimeira.length + carrinhosSegunda.length + carrinhosTerceira.length;

    if (totalCarrinhos === 0) {
      console.log('✅ Nenhum carrinho elegível encontrado');
      return new Response(
        JSON.stringify({ message: 'Nenhum carrinho elegível', processados: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Carrinhos encontrados: 1ª: ${carrinhosPrimeira.length}, 2ª: ${carrinhosSegunda.length}, 3ª: ${carrinhosTerceira.length}`);

    const resultados = {
      enviados: [] as string[],
      erros: [] as string[],
      detalhes: [] as any[]
    };

    // Helper: pula carrinhos quando cliente JÁ tem agendamento ativo
    // Match por telefone (sufixo 8 dígitos), janela de 30 dias.
    // Status ativos bloqueiam recuperação; apenas 'cancelado' libera reengajamento.
    const STATUS_ATIVOS = ['agendado', 'confirmado', 'em_andamento', 'concluido', 'pago'];
    const jaConverteu = async (carrinho: CarrinhoAbandonado): Promise<boolean> => {
      if (!carrinho.telefone) return false;
      const digits = carrinho.telefone.replace(/\D/g, '');
      if (digits.length < 8) return false;
      const sufixo = digits.slice(-8);

      const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: ag, error } = await supabase
        .from('agendamentos')
        .select('id, status, created_at, telefone')
        .ilike('telefone', `%${sufixo}%`)
        .in('status', STATUS_ATIVOS)
        .gte('created_at', trintaDiasAtras)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error(`⚠️  Erro ao checar conversão de ${carrinho.id}:`, error.message);
        return false;
      }

      if (ag && ag.length > 0) {
        const match = ag[0];
        console.log(`⏭️  Pulando carrinho ${carrinho.id} — cliente já tem agendamento ATIVO (ag ${match.id}, status ${match.status})`);
        await supabase
          .from('carrinhos_abandonados')
          .update({
            status: 'recuperado',
            notas_internas: `Cliente já converteu — agendamento ${match.id} (status: ${match.status}, match: telefone)`
          })
          .eq('id', carrinho.id);
        return true;
      }
      return false;
    };

    // Processar 1ª tentativa
    for (const carrinho of carrinhosPrimeira) {
      if (await jaConverteu(carrinho)) continue;
      await processarCarrinho(supabase, carrinho, 'padrao', 1, resultados);
    }

    // Processar 2ª tentativa (com cupom)
    for (const carrinho of carrinhosSegunda) {
      if (await jaConverteu(carrinho)) continue;
      await processarCarrinho(supabase, carrinho, 'com_cupom', 2, resultados);
    }

    // Processar 3ª tentativa (oferta final)
    for (const carrinho of carrinhosTerceira) {
      if (await jaConverteu(carrinho)) continue;
      await processarCarrinho(supabase, carrinho, 'oferta_final', 3, resultados);
    }

    console.log(`✅ Processamento concluído:`);
    console.log(`   • Enviados: ${resultados.enviados.length}`);
    console.log(`   • Erros: ${resultados.erros.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        total_processados: totalCarrinhos,
        enviados: resultados.enviados.length,
        erros: resultados.erros.length,
        detalhes: resultados.detalhes
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message, timestamp: new Date().toISOString() }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processarCarrinho(
  supabase: any,
  carrinho: CarrinhoAbandonado,
  tipoMensagem: 'padrao' | 'com_cupom' | 'oferta_final',
  tentativa: number,
  resultados: { enviados: string[]; erros: string[]; detalhes: any[] }
) {
  try {
    console.log(`📤 Processando carrinho ${carrinho.id} - ${tipoMensagem} (tentativa ${tentativa})`);

    const mensagem = await gerarMensagemRecuperacao(supabase, carrinho, tipoMensagem);

    const resultado = await enviarWhatsApp(carrinho.telefone!, mensagem);

    if (!resultado.success) {
      console.error(`❌ Erro WhatsApp ${carrinho.id}:`, resultado.error);
      resultados.erros.push(carrinho.id);
      return;
    }

    await supabase
      .from('carrinhos_abandonados')
      .update({
        tentativas_contato: tentativa,
        ultima_tentativa_contato: new Date().toISOString(),
        tipo_ultima_mensagem: tipoMensagem,
        status: 'contatado'
      })
      .eq('id', carrinho.id);

    console.log(`✅ Enviado: ${carrinho.id} (${tipoMensagem})`);
    resultados.enviados.push(carrinho.id);
    resultados.detalhes.push({
      id: carrinho.id,
      nome: carrinho.nome_cliente || 'Cliente',
      tentativa,
      tipo: tipoMensagem
    });

  } catch (error) {
    console.error(`❌ Erro processar ${carrinho.id}:`, error);
    resultados.erros.push(carrinho.id);
  }
}

function getIconeServico(tipo: string): string {
  const tipoLower = tipo.toLowerCase();
  if (tipoLower.includes('limpeza') && tipoLower.includes('impermeabilização')) return '🧹';
  if (tipoLower.includes('limpeza')) return '🧹';
  if (tipoLower.includes('impermeabilização')) return '🛡️';
  if (tipoLower.includes('aluguel') || tipoLower.includes('diária')) return '🏠';
  return '📦';
}

async function gerarMensagemRecuperacao(
  supabase: any,
  carrinho: CarrinhoAbandonado,
  tipoMensagem: 'padrao' | 'com_cupom' | 'oferta_final'
): Promise<string> {
  const nome = carrinho.nome_cliente || 'Cliente';
  const itens = Array.isArray(carrinho.itens_carrinho) ? carrinho.itens_carrinho : [];
  const valorTotal = carrinho.valor_total - (carrinho.valor_desconto || 0);

  // Formatar lista de itens
  let listaItens = '';
  const itensPorTipo = itens.reduce((acc: any, item: any) => {
    const tipo = item.details || 'Serviço';
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(item);
    return acc;
  }, {});

  Object.entries(itensPorTipo).forEach(([tipo, items]: [string, any]) => {
    listaItens += `\n${getIconeServico(tipo)} *${tipo}*\n`;
    items.forEach((item: any) => {
      listaItens += `• ${item.name || item.item || 'Item'} (${item.quantity || 1}x) - R$ ${(item.price || 0).toFixed(2).replace('.', ',')}\n`;
    });
  });

  const variaveis = {
    nome,
    itens: listaItens.trim(),
    valor: `R$ ${valorTotal.toFixed(2).replace('.', ',')}`,
    valor_original: `R$ ${carrinho.valor_total.toFixed(2).replace('.', ',')}`,
    cupom: 'VOLTE10',
    desconto: '10',
    valor_final: `R$ ${(valorTotal * 0.9).toFixed(2).replace('.', ',')}`,
    validade: '24 horas'
  };

  // Escolher template baseado no tipo
  const templateNomes: Record<string, string> = {
    'padrao': 'recuperacao-carrinho-padrao',
    'com_cupom': 'recuperacao-carrinho-cupom',
    'oferta_final': 'recuperacao-carrinho-final'
  };

  const templateNome = templateNomes[tipoMensagem];

  // Fallbacks para cada tipo
  const fallbacks: Record<string, string> = {
    'padrao': `Olá ${nome}! 👋

Vi que você estava escolhendo serviços de limpeza mas não finalizou. Posso te ajudar? 😊

🛒 *Seu carrinho:*${listaItens}

💰 *Valor total: ${variaveis.valor}*
💳 Pode ser pago no PIX ou em 12x no cartão

📱 Continue por aqui: ${SITE_DOMAIN}

Ou me chame que te ajudo! 💬`,

    'com_cupom': `Olá ${nome}! 👋

Notamos que você ainda não finalizou seu pedido. Que tal um incentivo? 😊

🎫 Use o cupom *VOLTE10* e ganhe *10% OFF!*

🛒 *Itens no carrinho:*${listaItens}

💰 De ~${variaveis.valor_original}~ por apenas *${variaveis.valor_final}*

⏰ Cupom válido por 24h!

📱 Finalize agora: ${SITE_DOMAIN}

💙 Equipe ${PLATFORM_NAME}`,

    'oferta_final': `${nome}, última chance! 🚨

Seu carrinho ainda está aqui, mas por pouco tempo...

🛒 *Seus serviços:*${listaItens}

💰 *Valor: ${variaveis.valor}*

Esta é nossa última tentativa de contato. Se não responder, vamos liberar sua vaga para outro cliente.

📱 Finalize agora: ${SITE_DOMAIN}

Estamos aqui para ajudar! 💙`
  };

  return await renderTemplateWithFallback(
    supabase,
    templateNome,
    variaveis,
    fallbacks[tipoMensagem]
  );
}
