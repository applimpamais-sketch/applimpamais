import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { isInternalRequestAuthorized } from '../_shared/internalAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-function-secret, x-cron-secret',
};

// ============================================================================
// Base64URL Encoding/Decoding (RFC 4648)
// ============================================================================

function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  // Adicionar padding se necessário
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ============================================================================
// VAPID JWT Generation (RFC 8292) - Implementação manual sem dependências
// ============================================================================

async function generateVAPIDJWT(
  privateKeyBase64: string,
  publicKeyBase64: string,
  audience: string,
  subject: string
): Promise<string> {
  // Decodificar a chave pública (formato uncompressed: 0x04 || X || Y)
  const publicKeyBytes = base64UrlDecode(publicKeyBase64);
  
  console.log(`🔑 Public key length: ${publicKeyBytes.length} bytes`);
  console.log(`🔑 Public key first byte: ${publicKeyBytes[0]}`);
  
  if (publicKeyBytes.length !== 65 || publicKeyBytes[0] !== 0x04) {
    throw new Error(`Invalid public key format. Expected 65 bytes starting with 0x04, got ${publicKeyBytes.length} bytes starting with ${publicKeyBytes[0]}`);
  }
  
  // Extrair X e Y da chave pública (bytes 1-32 e 33-64)
  const xBytes = publicKeyBytes.slice(1, 33);
  const yBytes = publicKeyBytes.slice(33, 65);
  
  console.log(`🔑 X length: ${xBytes.length}, Y length: ${yBytes.length}`);
  
  // Decodificar chave privada
  const privateKeyBytes = base64UrlDecode(privateKeyBase64);
  
  console.log(`🔑 Private key decoded length: ${privateKeyBytes.length} bytes`);
  
  // Criar JWK para importar a chave privada
  const jwkPrivate = {
    kty: 'EC',
    crv: 'P-256',
    d: base64UrlEncode(privateKeyBytes),
    x: base64UrlEncode(xBytes),
    y: base64UrlEncode(yBytes)
  };
  
  console.log(`🔑 JWK x: ${jwkPrivate.x.substring(0, 10)}...`);
  console.log(`🔑 JWK y: ${jwkPrivate.y.substring(0, 10)}...`);
  console.log(`🔑 JWK d: ${jwkPrivate.d.substring(0, 10)}...`);
  
  // Importar chave privada ECDSA P-256 para assinatura
  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwkPrivate,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  
  // Criar header e payload do JWT
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };
  
  const payload = {
    aud: audience,
    exp: now + 43200, // 12 horas
    sub: subject
  };
  
  // Codificar header e payload em base64url
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  // Assinar com ECDSA P-256 SHA-256
  const signatureArrayBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );
  
  // A assinatura do Web Crypto API para ECDSA retorna no formato DER/ASN.1
  // Precisamos converter para o formato concatenado r||s (cada um 32 bytes)
  const signatureBytes = new Uint8Array(signatureArrayBuffer);
  const rawSignature = derToRaw(signatureBytes);
  
  const signatureB64 = base64UrlEncode(rawSignature);
  
  const jwt = `${unsignedToken}.${signatureB64}`;
  
  console.log(`🔑 JWT generated successfully (${jwt.length} chars)`);
  
  return jwt;
}

// Converter assinatura ECDSA de DER para formato raw (r || s)
function derToRaw(der: Uint8Array): Uint8Array {
  // Verificar se é formato DER (começa com 0x30 - SEQUENCE)
  if (der[0] !== 0x30) {
    // Já está em formato raw (64 bytes)
    if (der.length === 64) {
      return der;
    }
    throw new Error(`Invalid signature format: first byte is ${der[0]}, expected 0x30`);
  }
  
  // Parse DER structure: SEQUENCE { INTEGER r, INTEGER s }
  let offset = 2; // Skip SEQUENCE tag and length
  
  // Skip total length if it's using long form
  if (der[1] & 0x80) {
    offset += der[1] & 0x7f;
  }
  
  // Parse r
  if (der[offset] !== 0x02) {
    throw new Error('Expected INTEGER tag for r');
  }
  offset++;
  
  const rLen = der[offset];
  offset++;
  
  let rStart = offset;
  let rSize = rLen;
  
  // Skip leading zero if present (used for positive numbers with high bit set)
  if (der[rStart] === 0x00 && rLen > 32) {
    rStart++;
    rSize--;
  }
  
  const r = der.slice(rStart, rStart + Math.min(rSize, 32));
  offset += rLen;
  
  // Parse s
  if (der[offset] !== 0x02) {
    throw new Error('Expected INTEGER tag for s');
  }
  offset++;
  
  const sLen = der[offset];
  offset++;
  
  let sStart = offset;
  let sSize = sLen;
  
  // Skip leading zero if present
  if (der[sStart] === 0x00 && sLen > 32) {
    sStart++;
    sSize--;
  }
  
  const s = der.slice(sStart, sStart + Math.min(sSize, 32));
  
  // Criar assinatura raw com padding para 32 bytes cada
  const rawSignature = new Uint8Array(64);
  
  // Pad r to 32 bytes (right-aligned)
  rawSignature.set(r, 32 - r.length);
  
  // Pad s to 32 bytes (right-aligned)
  rawSignature.set(s, 64 - s.length);
  
  return rawSignature;
}

// ============================================================================
// Web Push Payload Encryption (RFC 8291 - aes128gcm)
// ============================================================================

async function encryptPayload(
  clientPublicKeyB64: string,  // p256dh do cliente
  authSecretB64: string,        // auth secret do cliente
  payloadString: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const payload = new TextEncoder().encode(payloadString);
  
  // Decodificar chaves do cliente
  const clientPublicKeyBytes = base64UrlDecode(clientPublicKeyB64);
  const authSecret = base64UrlDecode(authSecretB64);
  
  // Gerar salt aleatório (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Gerar par de chaves ECDH efêmeras do servidor
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
  
  // Exportar chave pública do servidor (formato raw = 65 bytes uncompressed)
  const serverPublicKeyRaw = await crypto.subtle.exportKey('raw', serverKeyPair.publicKey);
  const serverPublicKey = new Uint8Array(serverPublicKeyRaw);
  
  // Importar chave pública do cliente
  const clientPublicKey = await crypto.subtle.importKey(
    'raw',
    clientPublicKeyBytes.buffer as ArrayBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
  
  // Derivar shared secret via ECDH
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: clientPublicKey },
      serverKeyPair.privateKey,
      256
    )
  );
  
  // ===== Derivação de chaves conforme RFC 8291 =====
  
  // 1. Importar shared secret como chave HKDF
  const sharedSecretKey = await crypto.subtle.importKey(
    'raw',
    sharedSecret.buffer as ArrayBuffer,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );
  
  // 2. Derivar PRK usando auth secret como salt
  // info = "WebPush: info\0" || client_public_key || server_public_key
  const authInfo = new Uint8Array([
    ...new TextEncoder().encode('WebPush: info\0'),
    ...clientPublicKeyBytes,
    ...serverPublicKey
  ]);
  
  const prkBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: authSecret.buffer as ArrayBuffer,
      info: authInfo.buffer as ArrayBuffer
    },
    sharedSecretKey,
    256
  );
  
  const prkKey = await crypto.subtle.importKey(
    'raw',
    prkBits,
    { name: 'HKDF' } as AlgorithmIdentifier,
    false,
    ['deriveBits']
  );
  
  // 3. Derivar CEK (Content Encryption Key) - 16 bytes
  // info = "Content-Encoding: aes128gcm\0"
  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const cekBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt.buffer as ArrayBuffer,
      info: cekInfo.buffer as ArrayBuffer
    },
    prkKey,
    128
  );
  
  // 4. Derivar Nonce - 12 bytes
  // info = "Content-Encoding: nonce\0"
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0');
  const nonceBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt.buffer as ArrayBuffer,
      info: nonceInfo.buffer as ArrayBuffer
    },
    prkKey,
    96
  );
  
  const nonce = new Uint8Array(nonceBits);
  
  // Importar CEK para AES-GCM
  const cek = await crypto.subtle.importKey(
    'raw',
    cekBits,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Adicionar padding ao payload (RFC 8291 requer delimitador 0x02)
  const paddedPayload = new Uint8Array(payload.length + 1);
  paddedPayload.set(payload);
  paddedPayload[payload.length] = 0x02; // Delimitador de padding
  
  // Criptografar com AES-128-GCM
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: 128 },
      cek,
      paddedPayload
    )
  );
  
  return { ciphertext, salt, serverPublicKey };
}

// ============================================================================
// Construir corpo da requisição Web Push (RFC 8291)
// ============================================================================

function buildWebPushBody(
  ciphertext: Uint8Array,
  salt: Uint8Array,
  serverPublicKey: Uint8Array
): Uint8Array {
  // Estrutura aes128gcm:
  // salt (16 bytes) || rs (4 bytes, big-endian) || idlen (1 byte) || keyid (65 bytes) || ciphertext
  
  const recordSize = 4096; // Tamanho máximo do registro
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, recordSize, false); // Big-endian
  
  const idlen = new Uint8Array([serverPublicKey.length]); // 65 bytes
  
  // Concatenar todos os componentes
  const body = new Uint8Array(
    salt.length + rs.length + idlen.length + serverPublicKey.length + ciphertext.length
  );
  
  let offset = 0;
  body.set(salt, offset); offset += salt.length;
  body.set(rs, offset); offset += rs.length;
  body.set(idlen, offset); offset += idlen.length;
  body.set(serverPublicKey, offset); offset += serverPublicKey.length;
  body.set(ciphertext, offset);
  
  return body;
}

// ============================================================================
// Enviar notificação Web Push
// ============================================================================

async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payloadString: string,
  vapidPrivateKey: string,
  vapidPublicKey: string,
  vapidSubject: string
): Promise<{ success: boolean; statusCode?: number; expired?: boolean; error?: string }> {
  try {
    const { endpoint, p256dh, auth } = subscription;
    
    console.log(`📤 Enviando push para: ${endpoint.substring(0, 60)}...`);
    
    // Extrair audience (origem do endpoint)
    const url = new URL(endpoint);
    const audience = url.origin;
    
    // Gerar JWT VAPID
    const jwt = await generateVAPIDJWT(vapidPrivateKey, vapidPublicKey, audience, vapidSubject);
    
    // Criptografar payload
    const { ciphertext, salt, serverPublicKey } = await encryptPayload(p256dh, auth, payloadString);
    
    // Construir corpo da requisição
    const body = buildWebPushBody(ciphertext, salt, serverPublicKey);
    
    // Enviar requisição para o push service
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Content-Length': body.length.toString(),
        'TTL': '86400',
        'Urgency': 'high'
      },
      body: body.buffer as ArrayBuffer
    });
    
    console.log(`📡 Resposta do push service: ${response.status}`);
    
    // Verificar se subscription expirou
    if (response.status === 404 || response.status === 410) {
      console.log('⚠️ Subscription expirada ou inválida');
      return { success: false, expired: true, statusCode: response.status };
    }
    
    // Sucesso em qualquer código 2xx ou 201
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Push enviado com sucesso!');
      return { success: true, statusCode: response.status };
    }
    
    // Erro
    const errorBody = await response.text();
    console.error(`❌ Erro do push service: ${response.status} - ${errorBody}`);
    return { success: false, statusCode: response.status, error: errorBody };
    
  } catch (error: any) {
    console.error('❌ Erro ao enviar push:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// Identificar tipo de dispositivo
// ============================================================================

function getDispositivo(userAgent: string | null): string {
  if (!userAgent) return 'desktop';
  
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

// ============================================================================
// Handler principal
// ============================================================================

Deno.serve(async (req) => {
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
    // Obter VAPID keys dos secrets
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:suporte@limpamais.com';

    // Validar que secrets VAPID estão configurados
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('❌ VAPID keys não configuradas!');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'VAPID keys não configuradas. Configure VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY nos secrets.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('✅ VAPID keys configuradas corretamente');
    console.log(`📧 VAPID Subject: ${vapidSubject}`);
    console.log(`🔑 Public key length (base64): ${vapidPublicKey.length} chars`);
    console.log(`🔑 Private key length (base64): ${vapidPrivateKey.length} chars`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { agendamento_id, tipo = 'novo_agendamento', agendamento: agendamentoData } = await req.json();

    console.log(`📨 Recebido request - Tipo: ${tipo}`);

    console.log(`📤 Processando push notification - Tipo: ${tipo}, Agendamento: ${agendamento_id}`);

    // Buscar dados do agendamento (ou usar o que foi passado)
    let agendamento = agendamentoData;
    
    if (!agendamento && agendamento_id) {
      const { data, error } = await supabaseClient
        .from('agendamentos')
        .select('*')
        .eq('id', agendamento_id)
        .maybeSingle();

      if (error || !data) {
        throw new Error('Agendamento não encontrado');
      }
      agendamento = data;
    }

    // Buscar admins
    const { data: adminUsers, error: adminError } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (adminError) {
      throw new Error('Erro ao buscar admins: ' + adminError.message);
    }

    const adminUserIds = adminUsers?.map((u: any) => u.user_id) || [];

    if (adminUserIds.length === 0) {
      console.log('⚠️ Nenhum admin encontrado');
      return new Response(
        JSON.stringify({ success: false, message: 'Nenhum admin encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar subscriptions ativas dos admins
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .in('user_id', adminUserIds)
      .eq('ativo', true);

    if (subError) {
      throw new Error('Erro ao buscar subscriptions: ' + subError.message);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ Nenhuma subscription ativa encontrada');
      return new Response(
        JSON.stringify({ success: false, message: 'Nenhuma subscription ativa' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📱 ${subscriptions.length} subscriptions ativas encontradas`);

    // Buscar preferências de notificação dos usuários
    const { data: preferences, error: prefError } = await supabaseClient
      .from('push_notification_preferences')
      .select('*')
      .in('user_id', adminUserIds);

    if (prefError) {
      console.warn('⚠️ Erro ao buscar preferências:', prefError.message);
    }

    // Filtrar subscriptions baseado nas preferências (exceto para tipo 'test')
    let filteredSubscriptions = subscriptions;
    
    if (tipo !== 'test') {
      filteredSubscriptions = subscriptions.filter((sub: any) => {
        const userPref = preferences?.find((p: any) => p.user_id === sub.user_id);
        
        if (!userPref) return true;
        
        const tipoMap: Record<string, string> = {
          'novo_agendamento': 'novo_agendamento',
          'agendamento_confirmado': 'agendamento_confirmado',
          'agendamento_concluido': 'agendamento_concluido',
          'pagamento_recebido': 'pagamento_recebido',
          'carrinho_abandonado': 'carrinho_abandonado',
          'problema_reportado': 'problema_reportado',
          'meta_atingida': 'meta_atingida',
        };
        
        const prefKey = tipoMap[tipo];
        if (prefKey && userPref[prefKey] === false) {
          console.log(`⏭️ Usuário ${sub.user_id} desabilitou notificações de ${tipo}`);
          return false;
        }
        
        if (userPref.horario_inicio && userPref.horario_fim) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinutes = now.getMinutes();
          const currentTime = currentHour * 60 + currentMinutes;
          
          const [startHour, startMin] = userPref.horario_inicio.split(':').map(Number);
          const [endHour, endMin] = userPref.horario_fim.split(':').map(Number);
          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;
          
          if (currentTime >= startTime && currentTime <= endTime) {
            console.log(`🔕 Horário de silêncio ativo para usuário ${sub.user_id}`);
            return false;
          }
        }
        
        if (userPref.permitir_final_semana === false) {
          const dayOfWeek = new Date().getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            console.log(`🔕 Notificações de final de semana desabilitadas para usuário ${sub.user_id}`);
            return false;
          }
        }
        
        return true;
      });
    }

    console.log(`📤 ${filteredSubscriptions.length} subscriptions após filtros`);

    if (filteredSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Todas as notificações foram filtradas pelas preferências dos usuários' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Montar payload da notificação
    let notificationPayload: { title: string; body: string; url: string; tag: string; agendamentoId?: string };

    if (tipo === 'test') {
      notificationPayload = {
        title: '🧪 Teste de Notificação',
        body: 'Se você está vendo isso, as notificações push estão funcionando corretamente!',
        url: '/admin/push-notifications',
        tag: 'test-notification'
      };
    } else if (agendamento) {
      // Detectar tipo de serviço: Locação ou Limpeza
      const itens = agendamento.itens_carrinho || [];
      const isLocacao = Array.isArray(itens) && itens.some((item: any) => {
        const itemName = (item.name || item.nome || '').toLowerCase();
        const itemId = (item.id || '').toLowerCase();
        return itemName.includes('aluguel') || itemName.includes('locação') || itemName.includes('locacao') ||
               itemId.includes('aluguel') || itemId.includes('locacao');
      });
      const tipoServico = isLocacao ? 'Locação' : 'Limpeza';
      
      // Formatar valor em BRL
      const valorFormatado = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(agendamento.valor_total || 0);
      
      console.log(`📦 Itens carrinho: ${JSON.stringify(itens).substring(0, 200)}...`);
      console.log(`🏷️ Tipo serviço detectado: ${tipoServico}`);
      
      // Montar payload baseado no tipo de evento
      if (tipo === 'novo_agendamento') {
        notificationPayload = {
          title: '🟢 Novo agendamento gerado!',
          body: `${tipoServico}: ${valorFormatado}`,
          url: `/admin/agendamentos?id=${agendamento.id}`,
          tag: `novo-${agendamento.id}`,
          agendamentoId: agendamento.id
        };
      } else if (tipo === 'pagamento_recebido') {
        notificationPayload = {
          title: '💰 Agendamento pago!',
          body: `${tipoServico}: ${valorFormatado}`,
          url: `/admin/agendamentos?id=${agendamento.id}`,
          tag: `pago-${agendamento.id}`,
          agendamentoId: agendamento.id
        };
      } else {
        // Outros tipos (legado)
        const nomeCliente = agendamento.nome_cliente || 'Cliente';
        notificationPayload = {
          title: `🎉 Atualização de Agendamento`,
          body: `${nomeCliente} - ${tipoServico}: ${valorFormatado}`,
          url: `/admin/agendamentos?id=${agendamento.id}`,
          tag: `agendamento-${agendamento.id}`,
          agendamentoId: agendamento.id
        };
      }
    } else {
      notificationPayload = {
        title: '📬 Nova Notificação',
        body: 'Você tem uma nova notificação',
        url: '/admin',
        tag: 'generic-notification'
      };
    }
    
    console.log(`📤 Payload montado: ${JSON.stringify(notificationPayload)}`);

    const payloadString = JSON.stringify(notificationPayload);

    // Enviar para todas as subscriptions
    const results = {
      success: 0,
      failed: 0,
      ios: 0,
      android: 0,
      desktop: 0,
      failed_ios: 0,
      failed_android: 0,
      failed_desktop: 0
    };

    const subscriptionsToRemove: string[] = [];

    for (const sub of filteredSubscriptions) {
      const result = await sendWebPushNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payloadString,
        vapidPrivateKey,
        vapidPublicKey,
        vapidSubject
      );
      
      const dispositivo = sub.dispositivo || getDispositivo(sub.user_agent);
      
      if (result.success) {
        results.success++;
        if (dispositivo === 'ios') results.ios++;
        else if (dispositivo === 'android') results.android++;
        else results.desktop++;
      } else {
        results.failed++;
        if (dispositivo === 'ios') results.failed_ios++;
        else if (dispositivo === 'android') results.failed_android++;
        else results.failed_desktop++;
        
        console.log(`❌ Falha ao enviar para ${dispositivo}: ${sub.id} - ${result.error || 'Unknown error'}`);
        
        // Marcar subscriptions expiradas para remoção
        if (result.expired) {
          subscriptionsToRemove.push(sub.id);
        }
      }
    }

    // Desativar subscriptions expiradas
    if (subscriptionsToRemove.length > 0) {
      console.log(`🗑️ Desativando ${subscriptionsToRemove.length} subscriptions expiradas`);
      await supabaseClient
        .from('push_subscriptions')
        .update({ ativo: false })
        .in('id', subscriptionsToRemove);
    }

    // Registrar log de envio
    await supabaseClient.from('push_logs').insert({
      tipo,
      agendamento_id: agendamento?.id || null,
      sucesso: results.success,
      falha: results.failed,
      dispositivos: {
        ios: results.ios,
        android: results.android,
        desktop: results.desktop,
        failed_ios: results.failed_ios,
        failed_android: results.failed_android,
        failed_desktop: results.failed_desktop
      }
    });

    console.log('📊 Resultado final:', results);

    return new Response(
      JSON.stringify({ 
        ...results,
        success: results.success > 0,
        total: filteredSubscriptions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
