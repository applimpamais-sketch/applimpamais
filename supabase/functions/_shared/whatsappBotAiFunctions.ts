// Funções de IA para WhatsApp Bot
import type { DadosAgendamentoExtraidos, DadosFinanceiros } from "./whatsappBotHelpers.ts";
import { mapearCategoria } from "./whatsappBotHelpers.ts";

export async function chamarOpenAI(prompt: string, key: string): Promise<string | null> {
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } }) });
    if (!r.ok) return null;
    const d = await r.json(); return d.choices?.[0]?.message?.content || null;
  } catch { return null; }
}

export function extrairDadosAgendamentoRegex(msg: string): { sucesso: boolean; dados?: DadosAgendamentoExtraidos; erros?: string[] } {
  const ls = msg.split('\n'); const erros: string[] = [];
  const ext = (p: RegExp): string | null => { for (const l of ls) { const m = l.match(p); if (m) return m[1].trim(); } return null; };
  const nome = ext(/nome[:\s]*(.+)/i); const telRaw = ext(/telefone[:\s]*(.+)/i); const end = ext(/endere[çc]o[:\s]*(.+)/i); const bairro = ext(/bairro[:\s]*(.+)/i);
  let cidade = ext(/cidade[:\s]*(.+)/i) || ""; if (/bh|beag[áa]/i.test(cidade)) cidade = "Belo Horizonte";
  const cep = ext(/cep[:\s]*(.+)/i); const dataRaw = ext(/data[:\s]*(.+)/i); const periodo = ext(/per[íi]odo[:\s]*(.+)/i); const totalRaw = ext(/(?:total|valor)[:\s]*(?:R\$?\s*)?([\d,.]+)/i);
  let tel = ""; if (telRaw) { tel = telRaw.replace(/\D/g, ''); if (!tel.startsWith('55')) tel = '55' + tel; }
  let dataAg = ""; if (dataRaw) { const m = dataRaw.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/); if (m) { const dia = m[1].padStart(2, '0'); const mes = m[2].padStart(2, '0'); let ano = m[3] || new Date().getFullYear().toString(); if (ano.length === 2) ano = '20' + ano; dataAg = `${ano}-${mes}-${dia}`; } }
  let perNorm: string | undefined; if (periodo) { if (/manh[ãa]/i.test(periodo)) perNorm = "Manhã"; else if (/tarde/i.test(periodo)) perNorm = "Tarde"; }
  const itens: { name: string; details: string; price: number; quantity: number }[] = [];
  for (const l of ls) { if (/servi[çc]o|limpeza|impermeabiliza|higieniza/i.test(l)) { const m = l.match(/[-•]?\s*(.+?)[-–:]?\s*R?\$?\s*([\d,.]+)/i); if (m) { const p = parseFloat(m[2].replace('.', '').replace(',', '.')); if (p > 0) itens.push({ name: m[1].trim().replace(/[-–:]/g, '').trim(), details: m[1].trim(), price: p, quantity: 1 }); } } }
  let valorTotal = 0; if (totalRaw) valorTotal = parseFloat(totalRaw.replace('.', '').replace(',', '.')); else if (itens.length > 0) valorTotal = itens.reduce((a, i) => a + i.price, 0);
  if (!bairro) bairro = "Não informado"; if (!cidade) cidade = "Belo Horizonte";
  if (!nome) erros.push("Nome"); if (!tel) erros.push("Telefone"); if (!end) erros.push("Endereço"); if (!dataAg) erros.push("Data"); if (itens.length === 0 && valorTotal === 0) erros.push("Serviços/Valor");
  if (erros.length > 0) return { sucesso: false, erros };
  if (itens.length === 0 && valorTotal > 0) itens.push({ name: "Serviço de limpeza", details: "Conforme agendamento", price: valorTotal, quantity: 1 });
  return { sucesso: true, dados: { nome_cliente: nome!, telefone: tel, endereco: end!, bairro: bairro!, cidade, cep: cep || undefined, data_agendamento: dataAg, periodo: perNorm, itens, valor_total: valorTotal } };
}

export async function extrairDadosAgendamento(msg: string, apiKey: string): Promise<{ sucesso: boolean; dados?: DadosAgendamentoExtraidos; erros?: string[] }> {
  const ano = new Date().getFullYear();
  const prompt = `Extraia dados de agendamento. Responda JSON: {"sucesso":true/false,"dados":{"nome_cliente":"","telefone":"5531...","endereco":"","bairro":"","cidade":"","cep":"","data_agendamento":"YYYY-MM-DD","periodo":"Manhã/Tarde","itens":[{"name":"","details":"","price":0,"quantity":1}],"valor_total":0,"is_locacao":false},"camposFaltando":[]}.
REGRAS IMPORTANTES:
- Ano padrão: ${ano}. Cidade BH/Beagá = Belo Horizonte.
- CEP é OPCIONAL. NUNCA inclua "cep" em camposFaltando. Se não informado, deixe vazio.
- Bairro e cidade podem estar embutidos no endereço (ex: "Rua X 123, Centro, BH" → bairro="Centro", cidade="Belo Horizonte").
- Se bairro não puder ser determinado, use "Não informado". Se cidade não puder ser determinada, use "Belo Horizonte".
- NUNCA inclua "bairro" ou "cidade" em camposFaltando.
- is_locacao: se a mensagem mencionar aluguel, locação, extratora, diária, semanal, máquina, final de semana ou FDS, marque true.
MSG:\n${msg}`;
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [{ role: "user", content: prompt }], stream: false }) });
    if (r.ok) { const d = await r.json(); const c = d.choices?.[0]?.message?.content || ""; const jm = c.match(/\{[\s\S]*\}/); if (jm) { const res = JSON.parse(jm[0]); if (!res.sucesso || res.camposFaltando?.length > 0) return { sucesso: false, erros: res.camposFaltando || ["Dados incompletos"] }; return { sucesso: true, dados: res.dados }; } }
  } catch {}
  const oaiKey = Deno.env.get("OPENAI_API_KEY"); if (oaiKey) { const res = await chamarOpenAI(prompt, oaiKey); if (res) { try { const jm = res.match(/\{[\s\S]*\}/); if (jm) { const r = JSON.parse(jm[0]); if (!r.sucesso || r.camposFaltando?.length > 0) return { sucesso: false, erros: r.camposFaltando || ["Dados incompletos"] }; return { sucesso: true, dados: r.dados }; } } catch {} } }
  return extrairDadosAgendamentoRegex(msg);
}

export async function analisarMensagemFinanceira(msg: string, tipo: 'texto' | 'imagem' | 'audio', apiKey: string, imgUrl?: string, trans?: string): Promise<DadosFinanceiros | null> {
  const hoje = new Date().toISOString().split('T')[0]; 
  const cont = trans || msg;
  
  // Prompt explícito sobre a data atual para evitar que a IA invente datas
  const prompt = `IMPORTANTE: A data de HOJE é ${hoje}. 
Se a mensagem mencionar "hoje", "agora", "acabei de", use EXATAMENTE ${hoje}.
Se mencionar "ontem", calcule a data correta subtraindo 1 dia de ${hoje}.
Se não houver indicação de data, use ${hoje} como padrão.

Extraia dados financeiros desta mensagem. Responda APENAS em JSON válido:
{
  "tipo": "despesa" ou "receita",
  "valor": número (obrigatório),
  "descricao": "texto curto",
  "categoria": "texto",
  "data": "${hoje}",
  "forma_pagamento": "texto ou vazio",
  "observacoes": "texto ou vazio",
  "confianca": 0-100
}

Se não for uma transação financeira: {"erro":"Não identificado"}

MSG:\n${cont}`;

  // Função para validar e corrigir data retornada pela IA
  const validarECorrigirData = (dataRetornada: string): string => {
    try {
      const data = new Date(dataRetornada);
      const dataAtual = new Date(hoje);
      
      // Se data inválida ou diferença maior que 1 ano, usar data atual
      if (isNaN(data.getTime())) {
        console.log(`[WARN] Data inválida da IA: ${dataRetornada} - usando ${hoje}`);
        return hoje;
      }
      
      const diffAnos = Math.abs(dataAtual.getFullYear() - data.getFullYear());
      if (diffAnos > 1) {
        console.log(`[WARN] Data da IA muito antiga/futura: ${dataRetornada} (diff ${diffAnos} anos) - usando ${hoje}`);
        return hoje;
      }
      
      return dataRetornada;
    } catch {
      console.log(`[WARN] Erro ao validar data: ${dataRetornada} - usando ${hoje}`);
      return hoje;
    }
  };

  try {
    const msgs: any[] = [{ role: "user", content: imgUrl && tipo === 'imagem' ? [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: imgUrl } }] : prompt }];
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: msgs, stream: false }) });
    if (r.ok) { 
      const d = await r.json(); 
      const c = d.choices?.[0]?.message?.content || ""; 
      const jm = c.match(/\{[\s\S]*\}/); 
      if (jm) { 
        const res = JSON.parse(jm[0]); 
        if (res.erro) return null; 
        
        // VALIDAÇÃO DE DATA - forçar data atual se inválida ou muito antiga
        res.data = validarECorrigirData(res.data);
        res.categoria = mapearCategoria(res.categoria, res.descricao); 
        return res as DadosFinanceiros; 
      } 
    }
  } catch {}
  
  const oaiKey = Deno.env.get("OPENAI_API_KEY"); 
  if (oaiKey && tipo !== 'imagem') { 
    const res = await chamarOpenAI(prompt, oaiKey); 
    if (res) { 
      try { 
        const jm = res.match(/\{[\s\S]*\}/); 
        if (jm) { 
          const r = JSON.parse(jm[0]); 
          if (r.erro) return null; 
          
          // VALIDAÇÃO DE DATA - forçar data atual se inválida ou muito antiga
          r.data = validarECorrigirData(r.data);
          r.categoria = mapearCategoria(r.categoria, r.descricao); 
          return r as DadosFinanceiros; 
        } 
      } catch {} 
    } 
  }
  return null;
}

export async function transcreverAudio(audioUrl: string, _lovableKey: string): Promise<string | null> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    console.error("[transcreverAudio] OPENAI_API_KEY não configurada");
    return null;
  }

  try {
    console.log("[transcreverAudio] Baixando áudio:", audioUrl);
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
      console.error("[transcreverAudio] Falha ao baixar áudio:", audioRes.status);
      return null;
    }

    const audioBlob = await audioRes.blob();
    console.log("[transcreverAudio] Áudio baixado:", audioBlob.size, "bytes, tipo:", audioBlob.type);

    // Determinar extensão baseada no content-type
    let ext = "ogg";
    const ct = audioBlob.type || "";
    if (ct.includes("mp4") || ct.includes("m4a")) ext = "m4a";
    else if (ct.includes("mpeg") || ct.includes("mp3")) ext = "mp3";
    else if (ct.includes("webm")) ext = "webm";
    else if (ct.includes("wav")) ext = "wav";

    const formData = new FormData();
    formData.append("file", new File([audioBlob], `audio.${ext}`, { type: audioBlob.type || "audio/ogg" }));
    formData.append("model", "whisper-1");
    formData.append("language", "pt");
    formData.append("response_format", "text");

    console.log("[transcreverAudio] Enviando para Whisper API...");
    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}` },
      body: formData,
    });

    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      console.error("[transcreverAudio] Whisper erro:", whisperRes.status, errText);
      return null;
    }

    const transcricao = (await whisperRes.text()).trim();
    console.log("[transcreverAudio] Transcrição:", transcricao.substring(0, 100) + (transcricao.length > 100 ? "..." : ""));
    return transcricao || null;
  } catch (err) {
    console.error("[transcreverAudio] Erro:", err);
    return null;
  }
}
