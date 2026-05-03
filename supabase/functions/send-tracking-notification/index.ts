/**
 * Send Tracking Notification
 * Envia notificação WhatsApp personalizada quando técnico inicia trajeto
 * Com mensagem diferenciada para SERVIÇO vs ENTREGA (aluguel)
 */

import { getCorsHeaders, handleCorsPreflightResponse } from '../_shared/corsConfig.ts';
import { enviarWhatsApp } from '../_shared/whatsappSender.ts';
import { SITE_DOMAIN } from '../_shared/siteConfig.ts';

interface TrackingNotificationRequest {
  telefone: string;
  nomeCliente: string;
  tecnicoNome: string;
  trackingUrl: string;
  tipoServico: 'servico' | 'entrega';
  itensDescricao: string;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightResponse(req);
  }

  try {
    const body: TrackingNotificationRequest = await req.json();
    
    const { 
      telefone, 
      nomeCliente, 
      tecnicoNome, 
      trackingUrl, 
      tipoServico, 
      itensDescricao 
    } = body;

    // Validação
    if (!telefone || !nomeCliente || !trackingUrl) {
      console.error('[send-tracking-notification] Dados obrigatórios faltando:', { telefone, nomeCliente, trackingUrl });
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios faltando: telefone, nomeCliente, trackingUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extrair primeiro nome
    const primeiroNomeCliente = nomeCliente.split(' ')[0];
    const primeiroNomeTecnico = (tecnicoNome || 'Técnico').split(' ')[0];

    // Extrair token do trackingUrl e reconstruir com domínio de produção
    const token = trackingUrl.split('/tracking/')[1] || trackingUrl;
    const trackingUrlReal = `${SITE_DOMAIN}/tracking/${token}`;

    // Montar mensagem baseada no tipo de serviço
    // NOTE: Assinatura genérica para suportar multi-tenant (tenant busca branding no frontend)
    let mensagem: string;

    if (tipoServico === 'entrega') {
      // Mensagem para ENTREGA (aluguel de equipamento)
      mensagem = `🚗 *Entrega a caminho!*

Olá ${primeiroNomeCliente}! Nosso técnico ${primeiroNomeTecnico} está a caminho do seu endereço para entrega da máquina:

📦 *${itensDescricao || 'Equipamento'}*

📍 *Acompanhe em tempo real:*
${trackingUrlReal}

⏱️ Em breve estaremos aí!

_Equipe de Atendimento_`;
    } else {
      // Mensagem para SERVIÇO (limpeza)
      mensagem = `🚗 *Técnico a caminho!*

Olá ${primeiroNomeCliente}! Nosso técnico ${primeiroNomeTecnico} está a caminho do seu endereço para realizar o serviço:

🧹 *${itensDescricao || 'Serviço agendado'}*

📍 *Acompanhe em tempo real:*
${trackingUrlReal}

⏱️ Em breve estaremos aí!

_Equipe de Atendimento_`;
    }

    console.log(`[send-tracking-notification] Enviando notificação de ${tipoServico} para ${telefone}`);
    console.log(`[send-tracking-notification] Itens: ${itensDescricao}`);
    console.log(`[send-tracking-notification] Link original: ${trackingUrl}`);
    console.log(`[send-tracking-notification] Link produção: ${trackingUrlReal}`);

    // Enviar WhatsApp
    const result = await enviarWhatsApp(telefone, mensagem);

    if (!result.success) {
      console.error('[send-tracking-notification] Erro ao enviar WhatsApp:', result.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error || 'Erro ao enviar mensagem' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[send-tracking-notification] ✅ Mensagem enviada com sucesso! ID: ${result.messageId}`);

    // Para ENTREGA (locação): enviar segunda mensagem perguntando forma de pagamento
    let secondMessageId: string | undefined;
    
    if (tipoServico === 'entrega') {
      // Delay de 3 segundos para não parecer spam
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mensagemPagamento = `💳 *Forma de Pagamento*

Olá! Para agilizar sua entrega, por favor informe como prefere pagar no ato da entrega:

1️⃣ PIX
2️⃣ Cartão de Crédito
3️⃣ Cartão de Débito
4️⃣ Dinheiro

Responda com o número da opção escolhida.

_Equipe de Atendimento_`;

      console.log(`[send-tracking-notification] Enviando segunda mensagem (forma de pagamento) para ${telefone}`);
      
      const resultPagamento = await enviarWhatsApp(telefone, mensagemPagamento);
      
      if (resultPagamento.success) {
        secondMessageId = resultPagamento.messageId;
        console.log(`[send-tracking-notification] ✅ Segunda mensagem enviada! ID: ${secondMessageId}`);
      } else {
        console.error('[send-tracking-notification] ⚠️ Erro ao enviar segunda mensagem:', resultPagamento.error);
        // Não falha a requisição inteira, apenas loga o erro
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.messageId,
        secondMessageId,
        tipoServico,
        telefone 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[send-tracking-notification] Erro:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
