import { createClient } from "npm:@supabase/supabase-js@2.77.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RC_LIMPA_MAIS_TENANT_ID = '2046cf1c-af8c-4e5e-b992-092ec922c35c';
const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

type SyncMode = 'discover' | 'inspect' | 'sync';

type RequestOptions = {
  mode: SyncMode;
  calendarIds: string[];
  dryRun: boolean;
  includeCancelled: boolean;
  timeMin: string;
  timeMax: string;
  maxResults: number;
};

type CalendarInspection = {
  calendarId: string;
  ok: boolean;
  status?: number;
  reason?: string;
  summary?: string;
  description?: string;
  accessRole?: string;
  primary?: boolean;
  eventCount?: number;
  sampleEvents?: Array<{
    id: string;
    summary: string;
    status: string;
    start: string | null;
  }>;
};

function base64urlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlEncodeStr(str: string): string {
  return base64urlEncode(new TextEncoder().encode(str));
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '')
    .replace(/-----END RSA PRIVATE KEY-----/g, '')
    .replace(/\n/g, '')
    .replace(/\r/g, '')
    .replace(/\s/g, '');

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function generateGoogleJWT(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: GOOGLE_CALENDAR_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = base64urlEncodeStr(JSON.stringify(header));
  const payloadB64 = base64urlEncodeStr(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const privateKey = await importPrivateKey(serviceAccount.private_key);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signingInput),
  );

  const signatureB64 = base64urlEncode(new Uint8Array(signature));
  return `${signingInput}.${signatureB64}`;
}

async function getAccessToken(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const jwt = await generateGoogleJWT(serviceAccount);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// ── Title Parser ──────────────────────────────────────────────
type ParsedTitle = {
  nome: string;
  periodo: string | null;
  tipoServico: 'locacao' | 'limpeza' | null;
  kit: string | null;
  statusWords: string[];
  horario: string | null;
};

function parseTitle(summary: string): ParsedTitle {
  let text = (summary || '').trim();
  const statusWords: string[] = [];
  let tipoServico: 'locacao' | 'limpeza' | null = null;
  let kit: string | null = null;
  let periodo: string | null = null;
  let horario: string | null = null;

  // Detect kit → always locação (before stripping other words)
  const kitMatch = text.match(/\b(Basic|Confort)\b/i);
  if (kitMatch) {
    kit = kitMatch[1].charAt(0).toUpperCase() + kitMatch[1].slice(1).toLowerCase();
    tipoServico = 'locacao';
    text = text.replace(/\b(Basic|Confort)\b/i, '').trim();
  }

  // Detect "parte manhã/tarde" → sets period only, NOT type
  const periodoMatch = text.match(/parte\s+(manh[ãa]|tarde|noite)/i);
  if (periodoMatch) {
    periodo = periodoMatch[1].toLowerCase().replace('manha', 'manhã');
    text = text.replace(/parte\s+(manh[ãa]|tarde|noite)/i, '').trim();
  }

  // Extract status/noise words — comprehensive list
  const noiseWords = [
    'não foi feita', 'não foi feito', 'sem falta',
    'pago pix', 'pago cartão', 'pago cartao', 'pago dinheiro',
    'a pagar', 'pago', 'buscado', 'confirmar', 'confirmado',
    'entregue', 'entrega', 'reparo',
    'pix', 'cartão', 'cartao', 'dinheiro',
  ];
  for (const phrase of noiseWords) {
    const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (re.test(text)) {
      // Track meaningful status words
      if (/pago/i.test(phrase)) statusWords.push('pago');
      if (/buscado/i.test(phrase)) statusWords.push('buscado');
      if (/confirmado/i.test(phrase)) statusWords.push('confirmado');
      if (/entregue/i.test(phrase)) statusWords.push('entregue');
      text = text.replace(re, '').trim();
    }
  }

  // Detect explicit time (e.g. 14h, 08:00, 14h30, "8 horas", "antes de 16 horas", "a partir de 15 horas")
  const timePatterns = [
    /(?:antes\s+de|a\s+partir\s+de|até|depois\s+de)?\s*(\d{1,2})\s*horas?/i,
    /\b(\d{1,2})[h:](\d{0,2})\b/i,
  ];
  for (const tp of timePatterns) {
    const timeMatch = text.match(tp);
    if (timeMatch) {
      const h = (timeMatch[1] || '00').padStart(2, '0');
      const m = (timeMatch[2] || '00').padStart(2, '0');
      horario = `${h}:${m}`;
      text = text.replace(tp, '').trim();
      break;
    }
  }

  // Clean up extra spaces/dashes/plus signs
  const nome = text
    .replace(/[+\-–]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .trim() || 'Sem nome';

  return { nome, periodo, tipoServico, kit, statusWords, horario };
}

// ── Phone regex ──────────────────────────────────────────────
const PHONE_RE = /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[\s\-]?\d{4}/;

function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  // Remove country code 55 if present (13 or 12 digits)
  if (digits.length >= 12 && digits.startsWith('55')) {
    digits = digits.substring(2);
  }
  // Must be 10 or 11 digits for BR format (DDD + 8 or 9 digits)
  if (digits.length === 10 || digits.length === 11) {
    return digits;
  }
  // 9 digits without DDD — prefix with "31" as default DDD
  if (digits.length === 9) {
    return '31' + digits;
  }
  // 8 digits without DDD — prefix with "31" as default DDD
  if (digits.length === 8) {
    return '31' + digits;
  }
  return digits;
}

function isPhoneLine(line: string): string | null {
  const digits = line.replace(/\D/g, '');
  // Accept 8-13 digit phone numbers
  if (digits.length >= 8 && digits.length <= 13) {
    const match = line.match(PHONE_RE);
    if (match) return normalizePhone(match[0]);
  }
  // Fallback: if line is mostly digits (8+), treat as phone
  if (digits.length >= 8 && digits.length <= 13 && digits.length / line.replace(/[\s\-\(\)\+]/g, '').length > 0.7) {
    return normalizePhone(line);
  }
  return null;
}

// ── Description Parser ───────────────────────────────────────
type ParsedDescription = {
  valor: number;
  telefone: string;
  itens: string[];
  observacoes: string[];
  endereco: string;
  bairro?: string;
  cidade?: string;
};

function parseDescription(description: string | undefined): ParsedDescription {
  if (!description) {
    return { endereco: 'Não informado', valor: 0, itens: [], telefone: '', observacoes: [] };
  }

  const cleanDesc = description
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

  const lines = cleanDesc.split('\n').map((l) => l.trim()).filter(Boolean);
  let valor = 0;
  let telefone = '';
  const itens: string[] = [];
  const observacoes: string[] = [];
  let endereco = 'Não informado';
  let bairro: string | undefined;
  let cidade: string | undefined;

  for (const line of lines) {
    // 1. Check for price ($) — MUST detect $ as BRL
    const priceMatch = line.match(/\$\s*(\d+[.,]?\d*)/);
    if (priceMatch) {
      const priceStr = priceMatch[1].replace(',', '.');
      valor = parseFloat(priceStr) || 0;

      // Extract item text from the same line (before or after the $)
      // Pattern A: "Sofá, 3 poltronas $350,00" → item before $
      // Pattern B: "$280 sofá e 4 cadeiras" → item after $
      // Pattern C: "$440,00 limpeza e impermeabilização sofá" → item after $
      const beforePrice = line.substring(0, line.indexOf('$')).replace(/[-–/:\\|]\s*$/, '').trim();
      const afterPrice = line.substring(line.indexOf('$')).replace(/\$\s*\d+[.,]?\d*\s*/, '').replace(/^[-–/:\\|]\s*/, '').trim();

      const itemText = beforePrice.length > 2 ? beforePrice : afterPrice.length > 2 ? afterPrice : '';
      if (itemText && !/^(valor|total|pre[çc]o|pagamento)/i.test(itemText)) {
        itens.push(itemText);
      }
      continue;
    }

    // 2. Check for phone number
    const phoneResult = isPhoneLine(line);
    if (phoneResult && !telefone) {
      telefone = phoneResult;
      // Check if there's extra text on the same line as the phone
      const remaining = line.replace(PHONE_RE, '').replace(/[/\\|,\-–]\s*/g, '').trim();
      if (remaining.length > 2) {
        observacoes.push(remaining);
      }
      continue;
    }

    // 3. Check for address-like lines
    if (/\b(rua|r\.|av\.|avenida|alameda|travessa|estrada|rod\.|praça|nº|n°|número|condomínio|cond\.)\b/i.test(line)) {
      endereco = line;
      const bairroMatch = line.match(/[-–]\s*([^,\-–]+?)(?:\s*[-–]\s*([^,\-–]+))?$/);
      if (bairroMatch) {
        bairro = bairroMatch[1].trim();
        if (bairroMatch[2]) cidade = bairroMatch[2].trim();
      }
      continue;
    }

    // 4. Labeled lines
    const bairroLine = line.match(/^bairro:\s*(.+)/i);
    if (bairroLine) { bairro = bairroLine[1].trim(); continue; }
    const cidadeLine = line.match(/^cidade:\s*(.+)/i);
    if (cidadeLine) { cidade = cidadeLine[1].trim(); continue; }

    // 5. Everything else → observações (AP 103, notes, etc.)
    if (line.length > 1 && !line.startsWith('http')) {
      observacoes.push(line);
    }
  }

  return { endereco, valor, itens, telefone, observacoes, bairro, cidade };
}

// ── Service type inference from description ──────────────────
function inferTipoFromDescription(itens: string[], observacoes: string[]): 'locacao' | 'limpeza' | null {
  const allText = [...itens, ...observacoes].join(' ').toLowerCase();
  // Limpeza keywords
  if (/sof[aá]|poltrona|colch[ãa]o|cadeira|estofado|tapete|puf|almofada|limpeza|impermeabiliza[çc][ãa]o/i.test(allText)) {
    return 'limpeza';
  }
  // Locação keywords
  if (/\bkit\b|loca[çc][ãa]o|entrega|devolu[çc][ãa]o/i.test(allText)) {
    return 'locacao';
  }
  return null;
}

// ── Event → Agendamento ─────────────────────────────────────
function eventToAgendamento(event: any): any | null {
  const summary = event.summary || 'Sem título';
  const title = parseTitle(summary);
  const desc = parseDescription(event.description);

  // Determine service type: title > description inference
  const tipoServico = title.tipoServico || inferTipoFromDescription(desc.itens, desc.observacoes) || 'indefinido';

  // Determine status: "pago" anywhere in title → concluido
  const status = title.statusWords.includes('pago') ? 'concluido' : 'confirmado';

  // Date & time
  let dataAgendamento: string;
  let horario: string | null = title.horario;

  if (event.start?.dateTime) {
    const dt = new Date(event.start.dateTime);
    dataAgendamento = dt.toISOString().split('T')[0];
    if (!horario) {
      horario = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    }
  } else if (event.start?.date) {
    dataAgendamento = event.start.date;
    if (!horario) {
      if (title.periodo === 'manhã') horario = '08:00';
      else if (title.periodo === 'tarde') horario = '14:00';
    }
  } else {
    return null;
  }

  const endereco = event.location || desc.endereco;

  // Build cart items
  const cartItems: any[] = [];
  if (title.kit) {
    cartItems.push({
      nome: `Kit ${title.kit}`,
      quantidade: 1,
      preco: desc.valor,
      tipo_servico: 'locacao',
    });
  }
  if (desc.itens.length > 0) {
    for (const item of desc.itens) {
      cartItems.push({
        nome: item,
        quantidade: 1,
        preco: cartItems.length === 0 ? desc.valor : 0,
        tipo_servico: tipoServico,
      });
    }
  }
  if (cartItems.length === 0) {
    cartItems.push({
      nome: tipoServico === 'locacao' ? 'Locação' : tipoServico === 'limpeza' ? 'Limpeza' : summary,
      quantidade: 1,
      preco: desc.valor,
      tipo_servico: tipoServico,
    });
  }

  // Observações
  const obsLines: string[] = [...desc.observacoes];
  if (title.periodo) obsLines.push(`Período: ${title.periodo}`);
  if (tipoServico === 'indefinido') obsLines.push('Tipo de serviço não identificado automaticamente');
  const obsText = obsLines.length > 0 ? obsLines.join(' | ') : null;

  return {
    google_event_id: event.id,
    nome_cliente: title.nome,
    telefone: desc.telefone || '0000000000',
    endereco,
    bairro: desc.bairro || null,
    cidade: desc.cidade || null,
    data_agendamento: dataAgendamento,
    horario,
    valor_total: desc.valor,
    itens_carrinho: cartItems,
    status,
    is_locacao: tipoServico === 'locacao',
    origem: 'google_calendar',
    tenant_id: RC_LIMPA_MAIS_TENANT_ID,
  };
}

function normalizeCalendarIds(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((id) => id.trim()).filter(Boolean);
}

function getEventStartValue(event: any): string | null {
  return event?.start?.dateTime || event?.start?.date || null;
}

function dedupeCalendarIds(calendarIds: string[]): string[] {
  return Array.from(new Set(calendarIds.filter(Boolean)));
}

async function discoverCalendars(accessToken: string): Promise<any[]> {
  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`CalendarList API error [${response.status}]: ${error}`);
  }

  const data = await response.json();
  return data.items || [];
}

async function fetchCalendarMetadata(accessToken: string, calendarId: string): Promise<any> {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Calendar metadata error [${response.status}] for ${calendarId}: ${error}`);
  }

  return await response.json();
}

async function fetchCalendarEvents(accessToken: string, calendarId: string, options: Pick<RequestOptions, 'timeMin' | 'timeMax' | 'maxResults'>): Promise<any[]> {
  const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` + new URLSearchParams({
    timeMin: options.timeMin,
    timeMax: options.timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(options.maxResults),
  });

  const response = await fetch(calendarUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    const message = response.status === 403 || response.status === 404
      ? `Calendar ${calendarId} is not directly accessible to the Service Account. Share the source Renteclean calendar directly with the Service Account email and grant permission to view all event details. Google Calendar API does not inherit access through another user's shared view. Raw error [${response.status}]: ${error}`
      : `Calendar ${calendarId} error [${response.status}]: ${error}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data.items || [];
}

async function inspectCalendars(
  accessToken: string,
  calendarIds: string[],
  options: Pick<RequestOptions, 'timeMin' | 'timeMax' | 'maxResults'>,
): Promise<CalendarInspection[]> {
  return await Promise.all(calendarIds.map(async (calendarId) => {
    try {
      const [metadata, events] = await Promise.all([
        fetchCalendarMetadata(accessToken, calendarId),
        fetchCalendarEvents(accessToken, calendarId, options),
      ]);

      return {
        calendarId,
        ok: true,
        summary: metadata.summary,
        description: metadata.description || '',
        accessRole: metadata.accessRole,
        primary: metadata.primary || false,
        eventCount: events.length,
        sampleEvents: events.slice(0, 5).map((event: any) => ({
          id: event.id,
          summary: event.summary || 'Sem título',
          status: event.status || 'confirmed',
          start: getEventStartValue(event),
        })),
      };
    } catch (error: any) {
      const statusMatch = String(error?.message || '').match(/\[(\d{3})\]/);
      return {
        calendarId,
        ok: false,
        status: statusMatch ? Number(statusMatch[1]) : undefined,
        reason: error?.message || 'Unknown error',
      };
    }
  }));
}

async function buildRequestOptions(req: Request): Promise<RequestOptions> {
  const url = new URL(req.url);
  let body: Record<string, unknown> = {};

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  const now = new Date();
  const defaultTimeMin = new Date(now);
  defaultTimeMin.setDate(defaultTimeMin.getDate() - 30);
  const defaultTimeMax = new Date(now);
  defaultTimeMax.setDate(defaultTimeMax.getDate() + 60);

  const modeCandidate =
    (typeof body.mode === 'string' ? body.mode : null) ||
    url.searchParams.get('mode') ||
    (url.searchParams.get('discover') === 'true' ? 'discover' : null) ||
    'sync';

  const mode: SyncMode = modeCandidate === 'discover' || modeCandidate === 'inspect' ? modeCandidate : 'sync';
  const bodyCalendarIds = Array.isArray(body.calendarIds) ? body.calendarIds.map(String) : [];
  const bodyCalendarId = typeof body.calendarId === 'string' ? [body.calendarId] : [];

  return {
    mode,
    calendarIds: dedupeCalendarIds([
      ...normalizeCalendarIds(url.searchParams.get('calendarIds')),
      ...normalizeCalendarIds(url.searchParams.get('calendarId')),
      ...bodyCalendarIds,
      ...bodyCalendarId,
    ]),
    dryRun: url.searchParams.get('dryRun') === 'true' || body.dryRun === true,
    includeCancelled: url.searchParams.get('includeCancelled') === 'true' || body.includeCancelled === true,
    timeMin: (typeof body.timeMin === 'string' ? body.timeMin : null) || url.searchParams.get('timeMin') || defaultTimeMin.toISOString(),
    timeMax: (typeof body.timeMax === 'string' ? body.timeMax : null) || url.searchParams.get('timeMax') || defaultTimeMax.toISOString(),
    maxResults: Number((typeof body.maxResults === 'number' ? body.maxResults : null) || url.searchParams.get('maxResults') || 250),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const options = await buildRequestOptions(req);

    console.log('🔑 Getting Google access token...');
    const accessToken = await getAccessToken(serviceAccount);

    if (options.mode === 'discover') {
      const calendars = await discoverCalendars(accessToken);
      const calendarInfo = calendars.map((cal: any) => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description || '',
        accessRole: cal.accessRole,
        primary: cal.primary || false,
        backgroundColor: cal.backgroundColor,
      }));

      return new Response(JSON.stringify({
        success: true,
        mode: 'discover',
        service_account_email: serviceAccount.client_email,
        calendars: calendarInfo,
        message: calendarInfo.length > 0
          ? `Found ${calendarInfo.length} accessible calendars. Use the source calendar ID from this list.`
          : `No calendars are directly accessible to the Service Account. Share the Renteclean source calendar directly with ${serviceAccount.client_email}.`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const configuredCalendarIds = normalizeCalendarIds(Deno.env.get('GOOGLE_CALENDAR_ID'));
    const targetCalendarIds = options.calendarIds.length > 0 ? options.calendarIds : configuredCalendarIds;

    if (targetCalendarIds.length === 0) {
      throw new Error('GOOGLE_CALENDAR_ID not configured');
    }

    if (options.mode === 'inspect') {
      const inspections = await inspectCalendars(accessToken, targetCalendarIds, options);
      const accessibleCount = inspections.filter((item) => item.ok).length;

      return new Response(JSON.stringify({
        success: true,
        mode: 'inspect',
        service_account_email: serviceAccount.client_email,
        configured_calendar_ids: configuredCalendarIds,
        requested_calendar_ids: targetCalendarIds,
        accessible_count: accessibleCount,
        inspections,
        message: accessibleCount > 0
          ? `Inspection complete. ${accessibleCount} calendar(s) are directly readable.`
          : `Inspection complete. None of the requested calendars are directly readable by the Service Account.`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let allEvents: any[] = [];
    const calendarDiagnostics: CalendarInspection[] = [];

    for (const calendarId of targetCalendarIds) {
      try {
        const [metadata, events] = await Promise.all([
          fetchCalendarMetadata(accessToken, calendarId),
          fetchCalendarEvents(accessToken, calendarId, options),
        ]);

        calendarDiagnostics.push({
          calendarId,
          ok: true,
          summary: metadata.summary,
          description: metadata.description || '',
          accessRole: metadata.accessRole,
          primary: metadata.primary || false,
          eventCount: events.length,
          sampleEvents: events.slice(0, 3).map((event: any) => ({
            id: event.id,
            summary: event.summary || 'Sem título',
            status: event.status || 'confirmed',
            start: getEventStartValue(event),
          })),
        });

        allEvents = allEvents.concat(events);
      } catch (error: any) {
        calendarDiagnostics.push({
          calendarId,
          ok: false,
          reason: error?.message || 'Unknown error',
        });
      }
    }

    allEvents = Array.from(new Map(allEvents.map((event) => [event.id, event])).values());
    if (!options.includeCancelled) {
      allEvents = allEvents.filter((event) => event.status !== 'cancelled');
    }

    if (options.dryRun) {
      return new Response(JSON.stringify({
        success: true,
        mode: 'sync',
        dry_run: true,
        service_account_email: serviceAccount.client_email,
        configured_calendar_ids: configuredCalendarIds,
        requested_calendar_ids: targetCalendarIds,
        calendar_diagnostics: calendarDiagnostics,
        total_events: allEvents.length,
        preview: allEvents.slice(0, 20).map((event) => ({
          id: event.id,
          summary: event.summary || 'Sem título',
          status: event.status || 'confirmed',
          start: getEventStartValue(event),
          parsed: eventToAgendamento(event),
        })),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (allEvents.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        mode: 'sync',
        calendars_queried: targetCalendarIds,
        configured_calendar_ids: configuredCalendarIds,
        calendar_diagnostics: calendarDiagnostics,
        total_events: 0,
        imported: 0,
        updated: 0,
        skipped: 0,
        message: 'Nenhum evento legível foi encontrado; compartilhe a agenda fonte Renteclean diretamente com a Service Account.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const event of allEvents) {
      try {
        const agendamento = eventToAgendamento(event);
        if (!agendamento) {
          skipped++;
          continue;
        }

        const { data: existing } = await supabase
          .from('agendamentos')
          .select('id')
          .eq('google_event_id', event.id)
          .maybeSingle();

        if (existing) {
          const { error: updateError } = await supabase
            .from('agendamentos')
            .update({
              nome_cliente: agendamento.nome_cliente,
              data_agendamento: agendamento.data_agendamento,
              horario: agendamento.horario,
              endereco: agendamento.endereco,
              bairro: agendamento.bairro,
              cidade: agendamento.cidade,
              valor_total: agendamento.valor_total,
              itens_carrinho: agendamento.itens_carrinho,
              telefone: agendamento.telefone,
              status: agendamento.status,
              is_locacao: agendamento.is_locacao,
              tenant_id: RC_LIMPA_MAIS_TENANT_ID,
            })
            .eq('id', existing.id);

          if (updateError) {
            errors.push(`Update ${event.id}: ${updateError.message}`);
          } else {
            updated++;
          }
        } else {
          const { error: insertError } = await supabase
            .from('agendamentos')
            .insert(agendamento);

          if (insertError) {
            errors.push(`Insert ${event.id}: ${insertError.message}`);
          } else {
            imported++;
          }
        }
      } catch (error: any) {
        errors.push(`Event ${event.id}: ${error?.message || 'Unknown error'}`);
      }
    }

    const result = {
      success: true,
      mode: 'sync',
      calendars_queried: targetCalendarIds,
      configured_calendar_ids: configuredCalendarIds,
      calendar_diagnostics: calendarDiagnostics,
      total_events: allEvents.length,
      imported,
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      synced_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ Sync error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
