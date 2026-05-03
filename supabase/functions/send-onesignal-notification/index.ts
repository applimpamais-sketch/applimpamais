import { SITE_DOMAIN } from "../_shared/siteConfig.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ONESIGNAL_APP_ID = '64a2fd66-20c0-4ca5-ae3a-62e166855924';
const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1/notifications';

interface NotificationPayload {
  tipo: 'novo_agendamento' | 'pagamento_confirmado' | 'pagamento_recebido' | 'agendamento_cancelado' | 'test';
  agendamento?: {
    id?: string;
    nome_cliente: string;
    valor_total: number;
    data_agendamento: string;
    endereco?: string;
    cidade?: string;
    itens_carrinho?: any[];
  };
  user_ids?: string[]; // External user IDs to target specific users
}

// Detectar tipo de serviço baseado nos itens do carrinho
function detectarTipoServico(itensCarrinho: any[] | undefined): string {
  if (!itensCarrinho || !Array.isArray(itensCarrinho)) return 'Limpeza';
  
  const isLocacao = itensCarrinho.some((item: any) => {
    const itemName = (item.name || item.nome || '').toLowerCase();
    const itemId = (item.id || '').toLowerCase();
    return itemName.includes('aluguel') || itemName.includes('locação') || itemName.includes('locacao') ||
           itemId.includes('aluguel') || itemId.includes('locacao');
  });
  
  return isLocacao ? 'Locação' : 'Limpeza';
}

// Formatar valor em BRL
function formatarValor(valor: number | undefined): string {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(valor || 0);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');
    if (!ONESIGNAL_REST_API_KEY) {
      console.error('❌ ONESIGNAL_REST_API_KEY não configurada');
      throw new Error('ONESIGNAL_REST_API_KEY não configurada');
    }

    const payload: NotificationPayload = await req.json();
    console.log('📨 Enviando notificação OneSignal:', payload.tipo);

    // Build notification content based on type
    let headings = '';
    let contents = '';
    let url = '/admin/agendamentos';
    
    // Detectar tipo de serviço e formatar valor
    const tipoServico = detectarTipoServico(payload.agendamento?.itens_carrinho);
    const valorFormatado = formatarValor(payload.agendamento?.valor_total);

    switch (payload.tipo) {
      case 'novo_agendamento':
        headings = '🟢 Novo agendamento gerado!';
        contents = `${tipoServico}: ${valorFormatado}`;
        break;
      
      case 'pagamento_confirmado':
      case 'pagamento_recebido':
        headings = '💰 Agendamento pago!';
        contents = `${tipoServico}: ${valorFormatado}`;
        break;
      
      case 'agendamento_cancelado':
        headings = '❌ Agendamento Cancelado';
        contents = `${payload.agendamento?.nome_cliente} cancelou o agendamento`;
        break;
      
      case 'test':
        headings = '🧪 Teste de Notificação';
        contents = 'As notificações push estão funcionando corretamente!';
        break;
      
      default:
        headings = '📢 RC Limpa Mais';
        contents = 'Nova atualização disponível';
    }
    
    console.log(`🏷️ Tipo serviço: ${tipoServico}, Valor: ${valorFormatado}`);

    // Build OneSignal notification payload
    const notificationPayload: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: headings, pt: headings },
      contents: { en: contents, pt: contents },
      url: `${SITE_DOMAIN}${url}`,
      chrome_web_icon: `${SITE_DOMAIN}/icon-192x192.png`,
      chrome_web_badge: `${SITE_DOMAIN}/icon-192x192.png`,
      // Additional data for handling in the app
      data: {
        tipo: payload.tipo,
        agendamento_id: payload.agendamento?.id,
      },
    };

    // Target specific users or all subscribed users
    if (payload.user_ids && payload.user_ids.length > 0) {
      notificationPayload.include_aliases = {
        external_id: payload.user_ids,
      };
      notificationPayload.target_channel = 'push';
    } else {
      // Send to all subscribed users
      notificationPayload.included_segments = ['Subscribed Users'];
    }

    console.log('📤 Payload OneSignal:', JSON.stringify(notificationPayload, null, 2));

    // Send to OneSignal API
    const response = await fetch(ONESIGNAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notificationPayload),
    });

    const responseData = await response.json();
    console.log('📊 Resposta OneSignal:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('❌ Erro OneSignal:', response.status, responseData);
      throw new Error(`OneSignal API error: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    console.log('✅ Notificação enviada com sucesso! Recipients:', responseData.recipients);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notificação enviada com sucesso',
        recipients: responseData.recipients,
        id: responseData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro ao enviar notificação',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
