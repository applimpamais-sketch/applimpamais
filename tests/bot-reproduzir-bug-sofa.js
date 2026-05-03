#!/usr/bin/env node
/**
 * Script de teste E2E para reproduzir o bug "loop não entendi" ao escolher sofá
 * 
 * OBJETIVO: Validar que Correções #17 e #18 resolveram o problema de capitalização
 * que causava o bot a não reconhecer "sofá" quando cliente escolhia entre múltiplos itens.
 * 
 * SEQUÊNCIA TESTADA:
 * 1. Usuário: "limpeza"
 * 2. Usuário: "belo horizonte"
 * 3. Usuário: "sofá e colchão"
 * 4. Usuário: "sofá"  ← AQUI DEVE FUNCIONAR (não dar "não entendi")
 * 
 * RESULTADO ESPERADO:
 * - Bot deve reconhecer "sofá" e transicionar para estado "coletando_modelo_sofa"
 * - NÃO deve responder "Ops, não consegui entender..."
 * 
 * USO:
 * 1. Configurar variáveis WEBHOOK_URL e AUTH_TOKEN abaixo
 * 2. Executar: node tests/bot-reproduzir-bug-sofa.js
 * 3. Verificar output no console
 * 4. Validar no banco: SELECT * FROM whatsapp_conversas WHERE telefone = '5531999999999' ORDER BY criado_em DESC LIMIT 1;
 */

// ========== CONFIGURAÇÃO (AJUSTAR ANTES DE EXECUTAR) ==========
const WEBHOOK_URL = 'https://yyrnshankehiqvkndrwk.supabase.co/functions/v1/receive-whatsapp-bot-webhook';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cm5zaGFua2VoaXF2a25kcndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzcxNTgsImV4cCI6MjA3ODExMzE1OH0.QsEdE5OsdSsD6cpuPyJy_K98bBDDzybyEN3CEr_eo-M'; // Supabase anon key

const TELEFONE_TESTE = '5531999999999'; // Número de teste

// Sequência de mensagens para reproduzir o bug
const MENSAGENS = [
  { 
    body: 'limpeza', 
    delay: 1000,
    esperado: 'bot deve confirmar tipo de serviço'
  },
  { 
    body: 'belo horizonte', 
    delay: 2000,
    esperado: 'bot deve confirmar cidade e pedir item'
  },
  { 
    body: 'sofá e colchão', 
    delay: 2000,
    esperado: 'bot deve detectar múltiplos itens e listar: ✅ Sofá ✅ Colchão'
  },
  { 
    body: 'sofá', 
    delay: 3000,
    esperado: '✅ CRÍTICO: Bot DEVE reconhecer "sofá" e ir para coletando_modelo_sofa'
  },
];

// ========== FUNÇÕES AUXILIARES ==========

function gerarMessageId() {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function enviarMensagem(body, index) {
  const messageId = gerarMessageId();
  
  const payload = {
    id: messageId,
    from: TELEFONE_TESTE,
    type: 'text',
    body: body,
    timestamp: Math.floor(Date.now() / 1000)
  };
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📤 [${index + 1}/${MENSAGENS.length}] ENVIANDO: "${body}"`);
  console.log(`   Message ID: ${messageId}`);
  console.log(`   Esperado: ${MENSAGENS[index].esperado}`);
  console.log(`${'='.repeat(70)}`);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Status: ${response.status} OK`);
      console.log(`📥 Resposta:`, JSON.stringify(result, null, 2));
    } else {
      console.error(`❌ Status: ${response.status} ERRO`);
      console.error(`📥 Resposta:`, JSON.stringify(result, null, 2));
    }
    
    return { success: response.ok, status: response.status, result };
  } catch (error) {
    console.error(`❌ EXCEÇÃO ao enviar mensagem:`, error.message);
    return { success: false, error: error.message };
  }
}

async function aguardar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function imprimirBanner(texto) {
  const largura = 70;
  const borda = '█'.repeat(largura);
  const espacos = ' '.repeat(Math.max(0, largura - texto.length - 4));
  console.log(`\n${borda}`);
  console.log(`█  ${texto}${espacos}█`);
  console.log(`${borda}\n`);
}

// ========== EXECUÇÃO PRINCIPAL ==========

async function executarTeste() {
  imprimirBanner('TESTE E2E: Reproduzir Bug Loop "Não Entendi"');
  
  console.log('📋 CONFIGURAÇÃO:');
  console.log(`   Webhook: ${WEBHOOK_URL}`);
  console.log(`   Telefone: ${TELEFONE_TESTE}`);
  console.log(`   Total de mensagens: ${MENSAGENS.length}`);
  
  console.log('\n⚠️  IMPORTANTE: Este teste irá criar uma nova conversa no banco.');
  console.log('    Certifique-se de limpar conversas de teste antigas antes de rodar.\n');
  
  await aguardar(2000);
  
  // Enviar todas as mensagens sequencialmente
  const resultados = [];
  
  for (let i = 0; i < MENSAGENS.length; i++) {
    const msg = MENSAGENS[i];
    
    // Aguardar delay antes de enviar
    if (i > 0) {
      console.log(`\n⏳ Aguardando ${msg.delay}ms antes de próxima mensagem...\n`);
      await aguardar(msg.delay);
    }
    
    const resultado = await enviarMensagem(msg.body, i);
    resultados.push({ mensagem: msg.body, resultado });
  }
  
  // Resumo final
  imprimirBanner('RESUMO DO TESTE');
  
  const sucessos = resultados.filter(r => r.resultado.success).length;
  const falhas = resultados.filter(r => !r.resultado.success).length;
  
  console.log(`✅ Sucessos: ${sucessos}/${MENSAGENS.length}`);
  console.log(`❌ Falhas: ${falhas}/${MENSAGENS.length}`);
  
  if (falhas > 0) {
    console.log('\n⚠️  ATENÇÃO: Algumas mensagens falharam. Verifique logs acima.');
  }
  
  // Instruções de validação
  imprimirBanner('VALIDAÇÃO NO BANCO DE DADOS');
  
  console.log('Execute as queries abaixo no Supabase para validar o resultado:\n');
  
  console.log('-- 1. Ver conversa criada:');
  console.log(`SELECT id, telefone, estado_atual, contexto FROM whatsapp_conversas WHERE telefone = '${TELEFONE_TESTE}' ORDER BY criado_em DESC LIMIT 1;\n`);
  
  console.log('-- 2. Ver histórico de mensagens:');
  console.log(`SELECT wm.direcao, wm.conteudo, wm.criado_em FROM whatsapp_mensagens wm WHERE wm.conversa_id = (SELECT id FROM whatsapp_conversas WHERE telefone = '${TELEFONE_TESTE}' ORDER BY criado_em DESC LIMIT 1) ORDER BY wm.criado_em ASC;\n`);
  
  console.log('-- 3. Verificar logs de idempotência:');
  console.log(`SELECT message_id, processado_em FROM whatsapp_mensagens_processadas WHERE telefone = '${TELEFONE_TESTE}' ORDER BY processado_em DESC LIMIT 10;\n`);
  
  // Critérios de sucesso
  imprimirBanner('CRITÉRIOS DE SUCESSO');
  
  console.log('✅ TESTE PASSOU se:');
  console.log('   1. Estado final = "coletando_modelo_sofa" (ou estado posterior)');
  console.log('   2. NÃO há mensagem "Ops, não consegui entender" após "sofá"');
  console.log('   3. Bot respondeu perguntando modelo do sofá (ex: "Qual o modelo do seu sofá?")');
  console.log('   4. Contexto contém: itens_selecionados ou item_atual = "Sofá"');
  
  console.log('\n❌ TESTE FALHOU se:');
  console.log('   1. Estado final = "identificando_item" (preso no loop)');
  console.log('   2. Bot respondeu "Ops, não consegui entender..." após "sofá"');
  console.log('   3. Contexto NÃO contém item "Sofá" selecionado');
  
  // Cleanup
  imprimirBanner('LIMPEZA (OPCIONAL)');
  
  console.log('Para limpar dados de teste após validação:\n');
  console.log(`-- Deletar conversa de teste:`);
  console.log(`DELETE FROM whatsapp_conversas WHERE telefone = '${TELEFONE_TESTE}';\n`);
  console.log(`-- Deletar mensagens processadas:`);
  console.log(`DELETE FROM whatsapp_mensagens_processadas WHERE telefone = '${TELEFONE_TESTE}';\n`);
  
  imprimirBanner('TESTE CONCLUÍDO');
  
  console.log(`\n📊 Resultados salvos em: resultados.length = ${resultados.length}`);
  console.log(`🕒 Timestamp: ${new Date().toISOString()}\n`);
  
  process.exit(falhas > 0 ? 1 : 0);
}

// ========== INÍCIO DA EXECUÇÃO ==========

console.log('\n🚀 Iniciando teste E2E em 3 segundos...\n');

setTimeout(() => {
  executarTeste().catch(error => {
    console.error('\n💥 ERRO FATAL:', error);
    process.exit(1);
  });
}, 3000);
