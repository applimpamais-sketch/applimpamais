import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, getClientIp, createRateLimitResponse } from '../_shared/rateLimiter.ts';
import { getRequestAuthContext, HttpError } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting: 15 notificações por minuto por IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp, { maxRequests: 15, windowMs: 60000 });
  
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.resetAt);
  }

  try {
    const authContext = await getRequestAuthContext(req);
    const hasPaymentNotifyPermission = authContext.isSuperAdmin || authContext.roles.some((entry) =>
      entry.role === 'admin' || entry.role === 'operador'
    );

    if (!hasPaymentNotifyPermission) {
      throw new HttpError(403, 'Forbidden');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      agendamentoId,
      tecnicoId,
      clienteNome,
      clienteTelefone,
      valorTotal,
      formaPagamento,
      observacoes,
      dataAgendamento,
      horario,
    } = await req.json();

    // Buscar dados do técnico
    const { data: tecnicoProfile, error: tecnicoError } = await supabase
      .from('profiles')
      .select('nome_completo, telefone')
      .eq('id', tecnicoId)
      .single();

    if (tecnicoError) {
      console.error('Erro ao buscar técnico:', tecnicoError);
    }

    // Mapear forma de pagamento para texto amigável
    const formasPagamentoMap: Record<string, string> = {
      dinheiro: '💵 Dinheiro',
      pix: '📱 PIX',
      debito: '💳 Cartão de Débito',
      credito: '💳 Cartão de Crédito',
      boleto: '📄 Boleto',
      transferencia: '🏦 Transferência',
    };

    const formaPagamentoTexto = formasPagamentoMap[formaPagamento] || formaPagamento;

    // Formatar valor
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valorTotal);

    // Formatar data/hora atual
    const agora = new Date();
    const dataHoraConfirmacao = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(agora);

    // Formatar data do agendamento
    const dataAgendamentoFormatada = new Intl.DateTimeFormat('pt-BR').format(
      new Date(dataAgendamento)
    );

    // Montar mensagem
    const mensagem = `💰 *PAGAMENTO RECEBIDO!*

👤 *Técnico:* ${tecnicoProfile?.nome_completo || 'Não informado'}
📱 *Telefone:* ${tecnicoProfile?.telefone || 'Não informado'}

──────────────────────

💼 *Cliente:* ${clienteNome}
📱 *Contato:* ${clienteTelefone}

📅 *Data:* ${dataAgendamentoFormatada}
⏰ *Horário:* ${horario || 'Não informado'}

──────────────────────

💰 *Valor Total:* ${valorFormatado}
💳 *Forma Pagamento:* ${formaPagamentoTexto}
${observacoes ? `📝 *Observações:* ${observacoes}` : ''}

✅ *Pagamento confirmado em:* ${dataHoraConfirmacao}

#AgendamentoID: ${agendamentoId}`;

    // Enviar WhatsApp via UltraMsg
    const instanceId = Deno.env.get('ULTRAMSG_INSTANCE_ID');
    const token = Deno.env.get('ULTRAMSG_TOKEN');
    const numeroEmpresa = '5531994103135'; // Número da empresa

    if (!instanceId || !token) {
      console.error('Credenciais UltraMsg não configuradas');
      return new Response(
        JSON.stringify({ error: 'Credenciais não configuradas' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const whatsappResponse = await fetch(
      `https://api.ultramsg.com/${instanceId}/messages/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          to: numeroEmpresa,
          body: mensagem,
        }),
      }
    );

    const whatsappData = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error('Erro ao enviar WhatsApp:', whatsappData);
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar WhatsApp', details: whatsappData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Registrar comunicação
    await supabase.from('comunicacoes').insert({
      agendamento_id: agendamentoId,
      tipo: 'whatsapp',
      mensagem: mensagem,
      status_entrega: 'enviado',
      template_usado: 'notify_payment_received',
    });

    return new Response(
      JSON.stringify({ success: true, whatsappData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Erro na função:', error);
    const status = error instanceof HttpError ? error.status : 500;
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
    );
  }
});
