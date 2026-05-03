/**
 * WhatsApp Sender - Centraliza envio de mensagens via UltraMsg
 * Usado por todas as edge functions que enviam WhatsApp
 */

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface UltraMsgResponse {
  sent?: boolean;
  id?: string;
  message?: string;
  error?: string;
}

/**
 * Formata telefone para padrão internacional Brasil
 */
export function formatarTelefone(telefone: string): string {
  // Remove caracteres não numéricos
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  // Se não tem código do país, adiciona 55 (Brasil)
  return telefoneLimpo.startsWith('55') 
    ? telefoneLimpo 
    : `55${telefoneLimpo}`;
}

/**
 * Envia mensagem WhatsApp via UltraMsg
 */
export async function enviarWhatsApp(
  telefone: string,
  mensagem: string,
  instanceId?: string,
  token?: string
): Promise<SendResult> {
  try {
    const ultramsgInstanceId = instanceId || Deno.env.get('ULTRAMSG_INSTANCE_ID');
    const ultramsgToken = token || Deno.env.get('ULTRAMSG_TOKEN');

    if (!ultramsgInstanceId || !ultramsgToken) {
      console.error('[whatsappSender] Credenciais UltraMsg não configuradas');
      return {
        success: false,
        error: 'Credenciais UltraMsg não configuradas'
      };
    }

    const telefoneFormatado = formatarTelefone(telefone);
    const ultraMsgUrl = `https://api.ultramsg.com/${ultramsgInstanceId}/messages/chat`;

    console.log(`[whatsappSender] Enviando para ${telefoneFormatado}...`);

    const response = await fetch(ultraMsgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: ultramsgToken,
        to: telefoneFormatado,
        body: mensagem
      })
    });

    const result: UltraMsgResponse = await response.json();

    if (!response.ok || result.error) {
      console.error(`[whatsappSender] Erro UltraMsg:`, result);
      return {
        success: false,
        error: result.error || result.message || 'Erro ao enviar mensagem'
      };
    }

    console.log(`[whatsappSender] ✅ Mensagem enviada: ${result.id}`);
    return {
      success: true,
      messageId: result.id
    };
  } catch (error) {
    console.error('[whatsappSender] Erro ao enviar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Envia múltiplas mensagens em lote (com delay entre cada)
 */
export async function enviarWhatsAppLote(
  mensagens: Array<{ telefone: string; mensagem: string }>,
  delayMs = 1000
): Promise<Array<{ telefone: string; result: SendResult }>> {
  const resultados: Array<{ telefone: string; result: SendResult }> = [];

  for (const msg of mensagens) {
    const result = await enviarWhatsApp(msg.telefone, msg.mensagem);
    resultados.push({ telefone: msg.telefone, result });

    // Aguardar entre envios para não sobrecarregar a API
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return resultados;
}

/**
 * Telefone da empresa para notificações internas
 */
export const EMPRESA_TELEFONE = '5531994103135';
export const EMPRESA_NOME = Deno.env.get('PLATFORM_NAME') ?? 'Limpamais';
