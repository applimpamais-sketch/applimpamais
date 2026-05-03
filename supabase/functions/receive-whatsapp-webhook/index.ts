import { createClient } from "npm:@supabase/supabase-js@2.77.0";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/corsConfig.ts";
import {
  type DadosFinanceiros,
  detectarNota,
  detectarComandoAgendar,
  conversaAguardandoNota,
  conversaAguardandoFeedback,
  formatarMensagemAjudaTecnico,
  formatarMensagemAjudaParceiro,
  formatarMensagemAjuda,
  formatarAgendaTecnico,
  formatarProximoServico,
  formatarSaldoParceiro,
  formatarLinkParceiro,
  formatarConversoesParceiro,
  formatarQRCodeParceiro,
  formatarRespostaSucesso,
  formatarRespostaErro,
  formatarConfirmacaoFinanceira,
  // Fase 1 - Novos formatadores
  formatarAgendamentosHoje,
  formatarAgendamentosPendentes,
  formatarResumoFinanceiro,
  formatarAgendaSemana,
  formatarRotaDia,
  formatarSolicitacaoSaque,
  formatarRankingParceiro,
  // Fase 2 - Novos formatadores
  formatarResultadoBusca,
  formatarStatusAgendamento,
  formatarAgendamentosSemanaFuncionario,
  formatarPagamentosRecentes,
  formatarDespesasHojeFuncionario,
  formatarHistoricoTecnico,
  formatarLinkMapa,
  formatarHistoricoSaques,
  formatarMateriaisParceiro,
} from "../_shared/whatsappBotHelpers.ts";
import {
  verificarFuncionarioBot,
  verificarTecnicoBot,
  verificarParceiroBot,
  buscarAgendaTecnico,
  buscarProximoServico,
  concluirServico,
  buscarConversoesParceiro,
  carregarConfigAvaliacoes,
  buscarLancamentoPendente,
  confirmarLancamento,
  cancelarLancamento,
  criarAgendamentoViaFuncionario,
  // Fase 1 - Novas funções DB
  buscarAgendamentosHoje,
  buscarAgendamentosPendentes,
  buscarResumoFinanceiro,
  buscarAgendaSemana,
  buscarRotaDia,
  solicitarSaque,
  buscarRankingParceiros,
  // Fase 2 - Novas funções DB
  buscarAgendamentoPorTermo,
  buscarStatusAgendamento,
  buscarAgendamentosSemanaFuncionario,
  buscarPagamentosRecentes,
  buscarDespesasHojeFuncionario,
  buscarHistoricoTecnico,
  buscarAgendamentoParaMapa,
  buscarHistoricoSaques,
} from "../_shared/whatsappBotDbFunctions.ts";
import {
  extrairDadosAgendamento,
  analisarMensagemFinanceira,
  transcreverAudio,
} from "../_shared/whatsappBotAiFunctions.ts";
import {
  buscarSessaoAtiva,
  buscarSessaoConfirmacao,
  criarSessao,
  cancelarSessao,
  extrairCamposParciais,
  mergeDadosParciais,
  atualizarSessao,
  formatarProgresso,
  formatarResumoSessao,
  sessaoParaDadosAgendamento,
} from "../_shared/whatsappBotSessaoAgendamento.ts";
import { SITE_DOMAIN } from "../_shared/siteConfig.ts";

const PLATFORM_NAME = Deno.env.get("PLATFORM_NAME") ?? "Limpamais";

interface Msg { id: string; type: string; body?: string; from: string; fromName: string; image?: { url: string; caption?: string }; audio?: { url: string }; }

const sendMsg = async (url: string, token: string, to: string, body: string) => {
  await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, to, body }) });
};

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  if (req.method === "OPTIONS") return handleCorsPreflightResponse(req);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const systemPrompt = Deno.env.get("WHATSAPP_BOT_SYSTEM_PROMPT")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const ultramsgToken = Deno.env.get("ULTRAMSG_TOKEN")!;
    const ultramsgInstanceId = Deno.env.get("ULTRAMSG_INSTANCE_ID")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const payload = await req.json();
    console.log("📥 Webhook:", JSON.stringify(payload, null, 2));

    const msgType = payload.data?.type || "chat";
    const mediaUrl = payload.data?.media || "";
    const msg: Msg = {
      id: payload.data?.id || payload.id, type: msgType, body: payload.data?.body || "",
      from: payload.data?.from || payload.from || "", fromName: payload.data?.fromName || payload.name || "Cliente",
      image: (msgType === "image" && mediaUrl) ? { url: mediaUrl, caption: payload.data?.caption } : undefined,
      audio: ((msgType === "ptt" || msgType === "audio") && mediaUrl) ? { url: mediaUrl } : undefined,
    };

    if (msg.from.includes("553194678382")) return new Response(JSON.stringify({ status: "ignored" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: processed } = await supabase.from("whatsapp_mensagens_processadas").select("id").eq("message_id", msg.id).single();
    if (processed) return new Response(JSON.stringify({ status: "already_processed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    await supabase.from("whatsapp_mensagens_processadas").insert({ message_id: msg.id, processado_em: new Date().toISOString() });

    const ultramsgUrl = `https://api.ultramsg.com/${ultramsgInstanceId}/messages/chat`;
    const texto = (msg.body || "").trim();
    const lower = texto.toLowerCase();

    // FUNCIONÁRIO
    const func = await verificarFuncionarioBot(supabase, msg.from);
    if (func) {
      console.log(`👔 Funcionário: ${func.nome}`);
      
      // @ajuda
      if (lower === "@ajuda") { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarMensagemAjuda()); return new Response(JSON.stringify({ status: "success", tipo: "func_ajuda" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      
      // @hoje - Agenda do dia
      if (lower === "@hoje") { 
        const lista = await buscarAgendamentosHoje(supabase); 
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarAgendamentosHoje(lista)); 
        return new Response(JSON.stringify({ status: "success", tipo: "func_hoje", total: lista.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); 
      }
      
      // @pendentes - Serviços pendentes de confirmação
      if (lower === "@pendentes") { 
        const lista = await buscarAgendamentosPendentes(supabase); 
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarAgendamentosPendentes(lista)); 
        return new Response(JSON.stringify({ status: "success", tipo: "func_pendentes", total: lista.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); 
      }
      
      // @resumo - Dashboard rápido
      if (lower === "@resumo") { 
        const resumo = await buscarResumoFinanceiro(supabase); 
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarResumoFinanceiro(resumo)); 
        return new Response(JSON.stringify({ status: "success", tipo: "func_resumo" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); 
      }
      
      // @buscar [termo] - Buscar cliente/agendamento
      if (lower.startsWith("@buscar")) {
        const termo = texto.substring(7).trim();
        if (!termo) { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "⚠️ *Uso:* @buscar [nome/tel/código]\n\nExemplo: @buscar Maria\nExemplo: @buscar 31999887766"); return new Response(JSON.stringify({ status: "error", tipo: "func_buscar_sem_termo" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
        const lista = await buscarAgendamentoPorTermo(supabase, termo);
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarResultadoBusca(lista, termo));
        return new Response(JSON.stringify({ status: "success", tipo: "func_buscar", total: lista.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // @status [código/nome] - Detalhes de agendamento
      if (lower.startsWith("@status")) {
        const codigo = texto.substring(7).trim();
        if (!codigo) { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "⚠️ *Uso:* @status [código/nome]\n\nExemplo: @status BOT-ABC123\nExemplo: @status Maria"); return new Response(JSON.stringify({ status: "error", tipo: "func_status_sem_cod" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
        const ag = await buscarStatusAgendamento(supabase, codigo);
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarStatusAgendamento(ag));
        return new Response(JSON.stringify({ status: ag ? "success" : "not_found", tipo: "func_status" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // @semana - Próximos 7 dias (visão funcionário)
      if (lower === "@semana") {
        const lista = await buscarAgendamentosSemanaFuncionario(supabase);
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarAgendamentosSemanaFuncionario(lista));
        return new Response(JSON.stringify({ status: "success", tipo: "func_semana", total: lista.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // @pagos - Pagamentos recebidos hoje
      if (lower === "@pagos") {
        const dados = await buscarPagamentosRecentes(supabase);
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarPagamentosRecentes(dados));
        return new Response(JSON.stringify({ status: "success", tipo: "func_pagos", total: dados.lista.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // @despesas ou @gastos - Despesas de hoje
      if (lower === "@despesas" || lower === "@gastos") {
        const dados = await buscarDespesasHojeFuncionario(supabase);
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarDespesasHojeFuncionario(dados));
        return new Response(JSON.stringify({ status: "success", tipo: "func_despesas", total: dados.lista.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // @cancelar - Cancelar sessão de agendamento ativa
      if (lower === "@cancelar") {
        const sessao = await buscarSessaoAtiva(supabase, msg.from) || await buscarSessaoConfirmacao(supabase, msg.from);
        if (sessao) {
          await cancelarSessao(supabase, sessao.id);
          await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "❌ Sessão de agendamento cancelada.");
          return new Response(JSON.stringify({ status: "success", tipo: "func_sessao_cancelar" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        // Sem sessão ativa, segue para lógica de cancelar financeiro abaixo
      }

      // @pronto - Forçar tentativa de finalizar sessão
      if (lower === "@pronto") {
        const sessao = await buscarSessaoAtiva(supabase, msg.from);
        if (sessao && sessao.campos_faltando.length > 0) {
          await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `⚠️ *Dados incompletos*\n\n${formatarProgresso(sessao.dados_parciais, sessao.campos_preenchidos, sessao.campos_faltando)}`);
          return new Response(JSON.stringify({ status: "success", tipo: "func_sessao_incompleta" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      // Verificar sessão de agendamento aguardando confirmação (SIM/NÃO)
      const sessaoConfirm = await buscarSessaoConfirmacao(supabase, msg.from);
      if (sessaoConfirm) {
        if (lower === "sim") {
          // Confirmar agendamento da sessão
          const dadosAg = sessaoParaDadosAgendamento(sessaoConfirm.dados_parciais);
          const r = await criarAgendamentoViaFuncionario(supabase, dadosAg, func.id);
          await cancelarSessao(supabase, sessaoConfirm.id); // marca como finalizado
          await supabase.from("agendamento_sessoes").update({ status: "finalizado" }).eq("id", sessaoConfirm.id);
          const resp = r.sucesso && r.orderCode ? formatarRespostaSucesso(dadosAg, r.orderCode, func.nome) : `❌ *ERRO*\n\n${r.erro || 'Erro desconhecido'}`;
          await sendMsg(ultramsgUrl, ultramsgToken, msg.from, resp);
          return new Response(JSON.stringify({ status: r.sucesso ? "success" : "error", tipo: "func_sessao_confirmar" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (lower === "não" || lower === "nao" || lower === "cancelar") {
          await cancelarSessao(supabase, sessaoConfirm.id);
          await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "❌ Agendamento cancelado.");
          return new Response(JSON.stringify({ status: "success", tipo: "func_sessao_negar" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        // Qualquer outra mensagem durante confirmação = corrigir dados
        const novosCampos = await extrairCamposParciais(texto, lovableApiKey);
        if (Object.keys(novosCampos).length > 0) {
          const { dados, preenchidos, faltando } = mergeDadosParciais(sessaoConfirm.dados_parciais, novosCampos);
          await atualizarSessao(supabase, sessaoConfirm.id, dados, preenchidos, faltando);
          if (faltando.length === 0) {
            await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `✏️ *Dados atualizados!*\n\n${formatarResumoSessao(dados)}`);
          } else {
            await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `✏️ *Atualizado!*\n\n${formatarProgresso(dados, preenchidos, faltando)}`);
          }
          return new Response(JSON.stringify({ status: "success", tipo: "func_sessao_corrigir" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      // Verificar sessão de agendamento ativa (coletando dados)
      const sessaoAtiva = await buscarSessaoAtiva(supabase, msg.from);
      if (sessaoAtiva && !detectarComandoAgendar(texto)) {
        // Acumular dados da mensagem
        const novosCampos = await extrairCamposParciais(texto, lovableApiKey);
        if (Object.keys(novosCampos).length > 0) {
          const { dados, preenchidos, faltando } = mergeDadosParciais(sessaoAtiva.dados_parciais, novosCampos);
          await atualizarSessao(supabase, sessaoAtiva.id, dados, preenchidos, faltando);
          
          if (faltando.length === 0) {
            // Todos os dados coletados! Mostrar resumo
            await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarResumoSessao(dados));
          } else {
            await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarProgresso(dados, preenchidos, faltando));
          }
          return new Response(JSON.stringify({ status: "success", tipo: "func_sessao_acumular" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        // Se não extraiu nada, informar
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `🤔 Não identifiquei dados nessa mensagem.\n\n${formatarProgresso(sessaoAtiva.dados_parciais, sessaoAtiva.campos_preenchidos, sessaoAtiva.campos_faltando)}\n\nDigite *@cancelar* para cancelar.`);
        return new Response(JSON.stringify({ status: "success", tipo: "func_sessao_nada" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // @agendar - Criar sessão progressiva OU agendamento direto se todos dados presentes
      if (detectarComandoAgendar(texto)) {
        const dadosAposComando = texto.replace(/^@\s*agendar\s*/i, '').trim();
        
        if (dadosAposComando.length > 20) {
          // Tem bastante texto: tentar extrair tudo de uma vez (comportamento legacy)
          const ext = await extrairDadosAgendamento(texto, lovableApiKey);
          if (ext.sucesso && ext.dados) {
            const r = await criarAgendamentoViaFuncionario(supabase, ext.dados, func.id);
            const resp = r.sucesso && r.orderCode ? formatarRespostaSucesso(ext.dados, r.orderCode, func.nome) : `❌ *ERRO*\n\n${r.erro || 'Erro desconhecido'}`;
            await sendMsg(ultramsgUrl, ultramsgToken, msg.from, resp);
            return new Response(JSON.stringify({ status: ext.sucesso ? "success" : "error", tipo: "func_agendar_direto" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          // Não conseguiu extrair tudo: criar sessão com dados parciais
          const { data: funcTenant } = await supabase.from("funcionarios_bot").select("tenant_id").eq("id", func.id).single();
          const sessao = await criarSessao(supabase, msg.from, func.id, funcTenant?.tenant_id || null);
          const parciais = await extrairCamposParciais(dadosAposComando, lovableApiKey);
          const { dados, preenchidos, faltando } = mergeDadosParciais({}, parciais);
          await atualizarSessao(supabase, sessao.id, dados, preenchidos, faltando);
          
          if (faltando.length === 0) {
            await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarResumoSessao(dados));
          } else {
            await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `📝 *Sessão de agendamento aberta!*\n\n${formatarProgresso(dados, preenchidos, faltando)}\n\nEncaminhe as mensagens do cliente ou digite os dados.`);
          }
          return new Response(JSON.stringify({ status: "success", tipo: "func_sessao_parcial" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        
        // @agendar sozinho ou com poucos dados: abrir sessão vazia
        const { data: funcTenant } = await supabase.from("funcionarios_bot").select("tenant_id").eq("id", func.id).single();
        const sessao = await criarSessao(supabase, msg.from, func.id, funcTenant?.tenant_id || null);
        
        if (dadosAposComando) {
          const parciais = await extrairCamposParciais(dadosAposComando, lovableApiKey);
          const { dados, preenchidos, faltando } = mergeDadosParciais({}, parciais);
          await atualizarSessao(supabase, sessao.id, dados, preenchidos, faltando);
          await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `📝 *Sessão aberta!*\n\n${formatarProgresso(dados, preenchidos, faltando)}\n\nEncaminhe mais dados do cliente.`);
        } else {
          await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `📝 *Sessão de agendamento aberta!*\n\nEncaminhe as mensagens do cliente ou digite os dados.\n\n⏳ *Campos necessários:* nome, telefone, endereço, serviço, data\n\n💡 Use *@cancelar* para cancelar ou *@pronto* para verificar.`);
        }
        return new Response(JSON.stringify({ status: "success", tipo: "func_sessao_nova" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // SIM - Confirmar (agendamento pendente ou financeiro)
      if (lower === "sim") {
        const { data: ap } = await supabase.from("agendamentos_pendentes_confirmacao").select("*, agendamentos(*)").eq("funcionario_telefone", msg.from).eq("status", "aguardando").order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (ap) { const ag = ap.agendamentos; await supabase.from("agendamentos").update({ status: "confirmado", updated_at: new Date().toISOString() }).eq("id", ap.agendamento_id); await supabase.from("agendamentos_pendentes_confirmacao").update({ status: "confirmado", respondido_em: new Date().toISOString() }).eq("id", ap.id); await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `✅ *CONFIRMADO!*\n📋 ${ag?.order_code}\n👤 ${ag?.nome_cliente}\n📅 ${ag?.data_agendamento}`); return new Response(JSON.stringify({ status: "success", tipo: "func_agend_ok" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
        const lp = await buscarLancamentoPendente(supabase, msg.from);
        if (!lp) { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "⚠️ Nada pendente para confirmar."); return new Response(JSON.stringify({ status: "success", tipo: "func_sem_pendente" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
        lp.funcionario_nome = func.nome; lp.funcionario_bot_id = lp.funcionario_bot_id || func.id;
        const res = await confirmarLancamento(supabase, lp); const an = lp.analise_ia as DadosFinanceiros;
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, res.sucesso ? `✅ *${an.tipo.toUpperCase()} REGISTRADA!*\n💰 R$ ${an.valor.toFixed(2).replace('.', ',')}` : `❌ Erro: ${res.erro}`);
        return new Response(JSON.stringify({ status: res.sucesso ? "success" : "error", tipo: "func_confirm" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (lower === "cancelar" || lower === "não" || lower === "nao") {
        const { data: ap } = await supabase.from("agendamentos_pendentes_confirmacao").select("*, agendamentos(*)").eq("funcionario_telefone", msg.from).eq("status", "aguardando").order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (ap) { await supabase.from("agendamentos_pendentes_confirmacao").update({ status: "manual", respondido_em: new Date().toISOString() }).eq("id", ap.id); await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `📝 Agendamento permanece PENDENTE para lançamento manual.`); return new Response(JSON.stringify({ status: "success", tipo: "func_agend_manual" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
        const lp = await buscarLancamentoPendente(supabase, msg.from);
        if (!lp) { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "⚠️ Nada pendente."); return new Response(JSON.stringify({ status: "success" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
        await cancelarLancamento(supabase, lp.id); await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "✅ Lançamento cancelado.");
        return new Response(JSON.stringify({ status: "success", tipo: "func_cancel" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (lower === "editar") {
        const lp = await buscarLancamentoPendente(supabase, msg.from);
        if (!lp) { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "⚠️ Nada para editar."); return new Response(JSON.stringify({ status: "success" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
        await cancelarLancamento(supabase, lp.id); await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "✏️ Lançamento descartado. Envie a versão correta.");
        return new Response(JSON.stringify({ status: "success", tipo: "func_edit" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      let tipoMsg: 'texto' | 'imagem' | 'audio' = 'texto'; let conteudo = texto; let arquivoUrl: string | undefined; let transcricao: string | undefined;
      if (msg.image?.url) { tipoMsg = 'imagem'; arquivoUrl = msg.image.url; conteudo = msg.image.caption || "Nota fiscal"; }
      else if (msg.audio?.url) { tipoMsg = 'audio'; arquivoUrl = msg.audio.url; transcricao = await transcreverAudio(arquivoUrl, lovableApiKey); if (!transcricao) { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "🎤 Não consegui transcrever. Envie por texto ou foto."); return new Response(JSON.stringify({ status: "success", tipo: "func_audio_fail" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); } conteudo = transcricao; }
      if (!conteudo && tipoMsg === 'texto') { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `Olá ${func.nome}! Use *@agendar* ou *@ajuda*. Ou envie despesas/receitas por texto, foto ou áudio.`); return new Response(JSON.stringify({ status: "success", tipo: "func_sem_cmd" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      const df = await analisarMensagemFinanceira(conteudo, tipoMsg, lovableApiKey, arquivoUrl, transcricao);
      if (!df) { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `Olá ${func.nome}! Não identifiquei despesa/receita. Use *@ajuda* para comandos.`); return new Response(JSON.stringify({ status: "success", tipo: "func_nao_fin" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      await supabase.from("whatsapp_financeiro_log").insert({ telefone_remetente: msg.from, tipo_mensagem: tipoMsg, conteudo_original: conteudo, arquivo_url: arquivoUrl || null, transcricao_ia: transcricao || null, analise_ia: df, processamento_status: "aguardando_confirmacao", tipo_lancamento: df.tipo, funcionario_bot_id: func.id });
      await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarConfirmacaoFinanceira(df, tipoMsg));
      return new Response(JSON.stringify({ status: "success", tipo: "func_fin", dados: df }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // TÉCNICO
    const tec = await verificarTecnicoBot(supabase, msg.from);
    if (tec) {
      console.log(`🔧 Técnico: ${tec.nome}`);
      
      // @ajuda
      if (lower === "@ajuda") { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarMensagemAjudaTecnico()); return new Response(JSON.stringify({ status: "success", tipo: "tec_ajuda" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      
      // @agenda - Hoje
      if (lower === "@agenda") { const s = await buscarAgendaTecnico(supabase, tec.id); await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarAgendaTecnico(s)); return new Response(JSON.stringify({ status: "success", tipo: "tec_agenda", total: s.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      
      // @semana - Próximos 7 dias
      if (lower === "@semana") { 
        const lista = await buscarAgendaSemana(supabase, tec.id); 
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarAgendaSemana(lista)); 
        return new Response(JSON.stringify({ status: "success", tipo: "tec_semana", total: lista.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); 
      }
      
      // @rota - Endereços do dia com links Google Maps
      if (lower === "@rota") { 
        const lista = await buscarRotaDia(supabase, tec.id); 
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarRotaDia(lista)); 
        return new Response(JSON.stringify({ status: "success", tipo: "tec_rota", total: lista.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); 
      }
      
      // @proximo
      if (lower === "@proximo" || lower === "@próximo") { const p = await buscarProximoServico(supabase, tec.id); await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarProximoServico(p)); return new Response(JSON.stringify({ status: "success", tipo: "tec_proximo" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      
      // @concluir
      if (lower.startsWith("@concluir")) { const cod = texto.split(/\s+/)[1] || ""; if (!cod) { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "⚠️ Informe o código: @concluir ABC123"); return new Response(JSON.stringify({ status: "error", tipo: "tec_sem_cod" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); } const r = await concluirServico(supabase, tec.id, cod); await sendMsg(ultramsgUrl, ultramsgToken, msg.from, r.mensagem); return new Response(JSON.stringify({ status: r.sucesso ? "success" : "error", tipo: "tec_concluir" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      
      // @historico - Últimos serviços concluídos
      if (lower === "@historico" || lower === "@histórico") {
        const lista = await buscarHistoricoTecnico(supabase, tec.id);
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarHistoricoTecnico(lista));
        return new Response(JSON.stringify({ status: "success", tipo: "tec_historico", total: lista.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // @mapa [código] - Link Google Maps
      if (lower.startsWith("@mapa")) {
        const codigo = texto.substring(5).trim();
        if (!codigo) { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "⚠️ *Uso:* @mapa [código]\n\nExemplo: @mapa BOT-ABC123"); return new Response(JSON.stringify({ status: "error", tipo: "tec_mapa_sem_cod" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
        const ag = await buscarAgendamentoParaMapa(supabase, tec.id, codigo);
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarLinkMapa(ag));
        return new Response(JSON.stringify({ status: ag ? "success" : "not_found", tipo: "tec_mapa" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // @iniciar [código] - Iniciar trajeto com rastreamento
      if (lower.startsWith("@iniciar")) {
        const codigo = texto.substring(8).trim().toUpperCase();
        if (!codigo) { 
          await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "⚠️ *Uso:* @iniciar [código]\n\nExemplo: @iniciar BOT-ABC123\n\n📍 Isso notifica o cliente com link de rastreamento em tempo real."); 
          return new Response(JSON.stringify({ status: "error", tipo: "tec_iniciar_sem_cod" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); 
        }
        
        // Buscar agendamento
        const { data: ag } = await supabase
          .from("agendamentos")
          .select("id, nome_cliente, telefone, endereco, bairro, cidade, latitude, longitude")
          .eq("tecnico_id", tec.id)
          .or(`order_code.ilike.%${codigo}%,id.eq.${codigo.length === 36 ? codigo : '00000000-0000-0000-0000-000000000000'}`)
          .in("status", ["confirmado", "pendente"])
          .maybeSingle();
        
        if (!ag) {
          await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `❌ Agendamento *${codigo}* não encontrado ou não está confirmado/pendente.`);
          return new Response(JSON.stringify({ status: "not_found", tipo: "tec_iniciar_nao_encontrado" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        
        // Criar sessão de tracking
        const { data: session, error: sessErr } = await supabase
          .from("tracking_sessions")
          .insert({
            agendamento_id: ag.id,
            tecnico_id: tec.id,
            tecnico_nome: tec.nome,
            destino_latitude: ag.latitude,
            destino_longitude: ag.longitude,
            status: "em_rota"
          })
          .select("token_publico")
          .single();
        
        if (sessErr) {
          console.error("Erro ao criar sessão:", sessErr);
          await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "❌ Erro ao iniciar rastreamento. Tente novamente.");
          return new Response(JSON.stringify({ status: "error", tipo: "tec_iniciar_erro" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        
        // Atualizar status do agendamento
        await supabase.from("agendamentos").update({ status: "em_rota" }).eq("id", ag.id);
        
        // Enviar link ao cliente
        const trackingUrl = `${SITE_DOMAIN}/tracking/${session.token_publico}`;
        const primeiroNome = ag.nome_cliente.split(" ")[0];
        const tecPrimeiroNome = tec.nome.split(" ")[0];
        
        await sendMsg(ultramsgUrl, ultramsgToken, ag.telefone, `🚗 *Técnico a caminho!*\n\nOlá ${primeiroNome}! Nosso técnico ${tecPrimeiroNome} está a caminho do seu endereço.\n\n📍 *Acompanhe em tempo real:*\n${trackingUrl}\n\n⏱️ Em breve estaremos aí!\n\n_${PLATFORM_NAME}_`);
        
        // Confirmar para o técnico
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `✅ *Trajeto iniciado!*\n\n👤 Cliente: ${ag.nome_cliente}\n📍 ${ag.endereco}${ag.bairro ? `, ${ag.bairro}` : ''}\n\n📱 Cliente notificado com link de rastreamento.\n\n🗺️ *Abrir no Maps:*\nhttps://www.google.com/maps/dir/?api=1&destination=${ag.latitude && ag.longitude ? `${ag.latitude},${ag.longitude}` : encodeURIComponent(`${ag.endereco}, ${ag.bairro || ''}, ${ag.cidade || ''}`)}\n\n_Use @cheguei quando chegar no local._`);
        
        return new Response(JSON.stringify({ status: "success", tipo: "tec_iniciar", agendamento_id: ag.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // @cheguei - Marcar chegada
      if (lower === "@cheguei") {
        // Buscar sessão ativa
        const { data: sessao } = await supabase
          .from("tracking_sessions")
          .select("id, agendamento_id")
          .eq("tecnico_id", tec.id)
          .eq("status", "em_rota")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!sessao) {
          await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "⚠️ Nenhum trajeto ativo. Use *@iniciar [código]* primeiro.");
          return new Response(JSON.stringify({ status: "not_found", tipo: "tec_cheguei_sem_trajeto" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        
        // Atualizar sessão e agendamento
        await supabase.from("tracking_sessions").update({ status: "chegou", chegou_em: new Date().toISOString() }).eq("id", sessao.id);
        await supabase.from("agendamentos").update({ status: "em_andamento" }).eq("id", sessao.agendamento_id);
        
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, "✅ *Chegada registrada!*\n\nBom trabalho! 💪\n\n_Use @concluir [código] quando terminar o serviço._");
        return new Response(JSON.stringify({ status: "success", tipo: "tec_cheguei" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `Olá ${tec.nome}! 🔧\n\nComandos: *@agenda*, *@semana*, *@rota*, *@proximo*, *@iniciar [código]*, *@cheguei*, *@concluir [código]*, *@mapa [código]*, *@historico* ou *@ajuda*`);
      return new Response(JSON.stringify({ status: "success", tipo: "tec_sem_cmd" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // PARCEIRO
    const parc = await verificarParceiroBot(supabase, msg.from);
    if (parc) {
      console.log(`🤝 Parceiro: ${parc.nome}`);
      
      // @ajuda
      if (lower === "@ajuda") { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarMensagemAjudaParceiro()); return new Response(JSON.stringify({ status: "success", tipo: "parc_ajuda" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      
      // @saldo
      if (lower === "@saldo") { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarSaldoParceiro(parc)); return new Response(JSON.stringify({ status: "success", tipo: "parc_saldo" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      
      // @link
      if (lower === "@link") { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarLinkParceiro(parc)); return new Response(JSON.stringify({ status: "success", tipo: "parc_link" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      
      // @conversoes
      if (lower === "@conversoes" || lower === "@conversões") { const c = await buscarConversoesParceiro(supabase, parc.id); await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarConversoesParceiro(c, parc)); return new Response(JSON.stringify({ status: "success", tipo: "parc_conv", total: c.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      
      // @qrcode
      if (lower === "@qrcode" || lower === "@qr") { await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarQRCodeParceiro(parc)); return new Response(JSON.stringify({ status: "success", tipo: "parc_qr" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
      
      // @sacar [valor] - Solicitar saque
      if (lower.startsWith("@sacar")) {
        const partes = texto.split(/\s+/);
        const valorStr = partes[1] || "";
        const valor = parseFloat(valorStr.replace(',', '.').replace(/[^\d.]/g, ''));
        
        if (!valorStr || isNaN(valor) || valor <= 0) {
          await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `⚠️ *Uso:* @sacar [valor]\n\nExemplo: @sacar 100\n\n💰 Seu saldo: R$ ${parc.saldo_disponivel.toFixed(2).replace('.', ',')}\n📋 Mínimo: R$ 50,00`);
          return new Response(JSON.stringify({ status: "error", tipo: "parc_sacar_sem_valor" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        
        const resultado = await solicitarSaque(supabase, parc.id, valor);
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarSolicitacaoSaque(resultado.sucesso, resultado.erro, valor));
        return new Response(JSON.stringify({ status: resultado.sucesso ? "success" : "error", tipo: "parc_sacar", valor }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // @ranking - Posição no ranking
      if (lower === "@ranking") {
        const ranking = await buscarRankingParceiros(supabase, parc.id);
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarRankingParceiro(ranking));
        return new Response(JSON.stringify({ status: "success", tipo: "parc_ranking", posicao: ranking.posicao }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // @historico - Histórico de saques
      if (lower === "@historico" || lower === "@histórico") {
        const lista = await buscarHistoricoSaques(supabase, parc.id);
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarHistoricoSaques(lista, parc.saldo_disponivel));
        return new Response(JSON.stringify({ status: "success", tipo: "parc_historico", total: lista.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // @materiais - Material promocional
      if (lower === "@materiais") {
        await sendMsg(ultramsgUrl, ultramsgToken, msg.from, formatarMateriaisParceiro({ codigo: parc.codigo, nome: parc.nome }));
        return new Response(JSON.stringify({ status: "success", tipo: "parc_materiais" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      await sendMsg(ultramsgUrl, ultramsgToken, msg.from, `Olá ${parc.nome}! 🤝\n\nComandos: *@saldo*, *@link*, *@conversoes*, *@sacar [valor]*, *@ranking*, *@historico*, *@qrcode*, *@materiais* ou *@ajuda*\n\n💰 Saldo: R$ ${parc.saldo_disponivel.toFixed(2).replace('.', ',')}`);
      return new Response(JSON.stringify({ status: "success", tipo: "parc_sem_cmd" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // BOT COMERCIAL DESLIGADO PARA CLIENTES
    // Números não reconhecidos (não são funcionário, técnico ou parceiro) são ignorados silenciosamente.
    // O bot NÃO responde clientes. Apenas registra a mensagem para auditoria.
    console.log(`🚫 Mensagem de número não reconhecido ignorada: ${msg.from} - "${texto.substring(0, 50)}"`);
    return new Response(JSON.stringify({ status: "ignored", tipo: "cliente_desligado", from: msg.from }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("💥 Erro:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro", status: "error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
