import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { checkRateLimit, getClientIp, createRateLimitResponse } from "../_shared/rateLimiter.ts";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/corsConfig.ts";
import { renderTemplateWithFallback, formatarValor } from "../_shared/templateRenderer.ts";
import { enviarWhatsApp, EMPRESA_NOME } from "../_shared/whatsappSender.ts";

interface WhatsAppRequest {
  clienteNome: string;
  clienteTelefone: string;
  servicos: string;
  data: string;
  periodo: string | null;
  valorTotal: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  observacoes: string;
  agendamento_id?: string; // ID do agendamento para confirmação interativa
}

function normalizePhoneForConversation(phone: string): string {
  if (phone.includes('@')) {
    return phone;
  }
  const onlyDigits = phone.replace(/\D/g, '');
  return `${onlyDigits}@c.us`;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflightResponse(req);
  }

  try {
    // 🔒 SECURITY: Rate limiting - 5 requisições por minuto por IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 5, windowMs: 60000 });
    
    if (!rateLimit.allowed) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${clientIp}`);
      return createRateLimitResponse(rateLimit.resetAt);
    }

    // Criar cliente Supabase para buscar templates
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data: WhatsAppRequest = await req.json();
    console.log('📱 Enviando mensagens WhatsApp via UltraMsg:', { 
      cliente: data.clienteNome,
      agendamento_id: data.agendamento_id,
      clientIp,
      remainingRequests: rateLimit.remaining 
    });

    // Preparar variáveis para templates
    const variaveis = {
      nome: data.clienteNome,
      data: data.data,
      horario: data.periodo || 'A confirmar',
      endereco: data.endereco,
      bairro: data.bairro,
      cidade: data.cidade,
      valor: data.valorTotal,
      servicos: data.servicos,
      cep: data.cep,
      observacoes: data.observacoes || 'Nenhuma'
    };

    // Resolver tenant do agendamento e telefone do funcionário responsável
    let tenantId: string | null = null;
    let telefoneResponsavel: string | null = null;

    if (data.agendamento_id) {
      const { data: agendamento, error: agendamentoError } = await supabase
        .from('agendamentos')
        .select('tenant_id')
        .eq('id', data.agendamento_id)
        .maybeSingle();

      if (agendamentoError) {
        console.error('[send-whatsapp] Erro ao buscar tenant do agendamento:', agendamentoError);
      } else {
        tenantId = agendamento?.tenant_id || null;
      }

      if (tenantId) {
        const { data: funcionarioPrincipal, error: funcionarioError } = await supabase
          .from('funcionarios_bot')
          .select('telefone_whatsapp')
          .eq('tenant_id', tenantId)
          .eq('ativo', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (funcionarioError) {
          console.error('[send-whatsapp] Erro ao buscar funcionario_bot ativo:', funcionarioError);
        } else {
          telefoneResponsavel = funcionarioPrincipal?.telefone_whatsapp || null;
        }
      }
    }

    if (!telefoneResponsavel) {
      telefoneResponsavel = Deno.env.get('WHATSAPP_NOTIFICATIONS_PHONE') ?? null;
    }

    if (!telefoneResponsavel) {
      return new Response(
        JSON.stringify({ error: 'Nenhum telefone de notificação configurado para este tenant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fallback hardcoded caso template não exista
    const fallbackCliente = `Olá ${data.clienteNome}! 😊

Seu agendamento do serviço: *${data.servicos}* foi realizado com sucesso para o dia *${data.data}*${data.periodo ? ` no período da *${data.periodo}*` : ''}.

💰 Valor total: *${data.valorTotal}*
💳 Pagamento após o serviço: aceitamos *PIX, cartão de crédito ou débito.*

Agora só falta combinarmos o melhor horário para a realização do serviço.
Nos próximos minutos nossa equipe entrará em contato para confirmar o horário certinho! ⏰

Agradecemos a preferência 💙
Equipe ${EMPRESA_NOME}`;

    // Mensagem INTERATIVA para funcionário com SIM/NÃO
    const fallbackEmpresa = `📢 *NOVO AGENDAMENTO RECEBIDO!*

👩 *Cliente:* ${data.clienteNome}
📱 *Telefone:* ${data.clienteTelefone}

──────────────────────

🧽 *Serviço:* ${data.servicos}
📅 *Data:* ${data.data}${data.periodo ? `\n⏰ *Período:* ${data.periodo}` : ''}
💰 *Valor total:* ${data.valorTotal}

──────────────────────

🏠 *Endereço:* ${data.endereco}
📍 *Bairro:* ${data.bairro}
🏙️ *Cidade:* ${data.cidade}
📬 *CEP:* ${data.cep}
💬 *Observações:* ${data.observacoes || 'Nenhuma'}

━━━━━━━━━━━━━━━━━━━━━━
❓ *CONFIRMAR ESTE AGENDAMENTO?*

Responda *SIM* para confirmar e lançar
Responda *NÃO* para lançar manualmente`;

    // Buscar e renderizar templates do banco
    const mensagemCliente = await renderTemplateWithFallback(
      supabase,
      'confirmacao-agendamento-cliente',
      variaveis,
      fallbackCliente
    );

    // Para funcionário, usar o template interativo
    const mensagemEmpresa = await renderTemplateWithFallback(
      supabase,
      'confirmacao-agendamento-funcionario',
      {
        ...variaveis,
        telefone: data.clienteTelefone
      },
      fallbackEmpresa
    );

    console.log('📤 Mensagem cliente preparada, enviando...');

    // Enviar mensagem para o CLIENTE
    const resultCliente = await enviarWhatsApp(data.clienteTelefone, mensagemCliente);

    // Enviar mensagem para a EMPRESA (funcionário)
    const resultEmpresa = await enviarWhatsApp(telefoneResponsavel, mensagemEmpresa);

    // Se temos agendamento_id, criar registro de confirmação pendente
    if (data.agendamento_id && resultEmpresa.success) {
      console.log('📋 Criando registro de confirmação pendente para agendamento:', data.agendamento_id);
      
      // Formatar telefone da empresa para match no webhook
      const telefoneEmpresa = normalizePhoneForConversation(telefoneResponsavel);
      
      const { error: insertError } = await supabase
        .from('agendamentos_pendentes_confirmacao')
        .insert({
          agendamento_id: data.agendamento_id,
          funcionario_telefone: telefoneEmpresa,
          status: 'aguardando'
        });
      
      if (insertError) {
        console.error('❌ Erro ao criar registro de confirmação pendente:', insertError);
      } else {
        console.log('✅ Registro de confirmação pendente criado com sucesso');
      }
    }

    console.log('✅ Mensagens enviadas:', { 
      cliente: resultCliente.success, 
      empresa: resultEmpresa.success 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagens enviadas com sucesso',
        cliente: resultCliente,
        empresa: resultEmpresa,
        confirmacao_pendente: !!data.agendamento_id
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        } 
      }
    );
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
