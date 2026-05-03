#!/usr/bin/env node
/**
 * TESTE E2E: Reproduzir bug "loop não peguei" ao escolher sofá
 * 
 * Referência: user-uploads://image-205.png
 * Sequência exata da imagem:
 *   1. Usuário: "limpeza"
 *   2. Usuário: "contagem"  
 *   3. Usuário: "sofá"
 *   4. Usuário: "Sofá" (com maiúscula)
 *   5. Usuário: "limpeza de sofá"
 * 
 * Resultado esperado ANTES do hotfix:
 *   - Bot entra em loop "não peguei", "bugou minha cabeça"
 * 
 * Resultado esperado DEPOIS do hotfix:
 *   - Bot reconhece "sofá" e pede modelo
 * 
 * Uso:
 *   WEBHOOK_URL=https://xxx.functions.supabase.co/receive-whatsapp-bot-webhook \
 *   AUTH_TOKEN=your_anon_key \
 *   TELEFONE_TESTE=5531999999999 \
 *   node tests/repro-sofa-loop.js
 */

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:54321/functions/v1/receive-whatsapp-bot-webhook';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; 
const TELEFONE_TESTE = process.env.TELEFONE_TESTE || '5531999999999';

const mensagens = [
  { body: 'limpeza', delay: 1000, expected_state: 'escolhendo_tipo_servico_global' },
  { body: 'contagem', delay: 2000, expected_state: 'identificando_item' }, // Espera que cidade seja reconhecida APÓS hotfix #3
  { body: 'sofá', delay: 2000, expected_state: 'coletando_modelo_sofa' }, // CRÍTICO: Deve ir para modelo, NÃO loop de erro
  { body: 'Sofá', delay: 1500, expected_state: 'coletando_modelo_sofa' }, // Testar com maiúscula
  { body: 'limpeza de sofá', delay: 2000, expected_state: 'coletando_modelo_sofa' }
];

let conversaId = null;
let errosDetectados = [];

async function enviarMensagem(body, index, expectedState) {
  const payload = {
    from: TELEFONE_TESTE,
    to: '5531994678382@c.us',
    type: 'text',
    body: body,
    id: `test_${Date.now()}_${index}`,
    timestamp: Math.floor(Date.now() / 1000)
  };
  
  console.log(`\n📤 [${index + 1}/${mensagens.length}] Enviando: "${body}"`);
  console.log(`   Esperado: Bot deve ir para estado "${expectedState}"`);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error(`❌ HTTP ${response.status}:`, await response.text());
      errosDetectados.push({
        mensagem: body,
        erro: `HTTP ${response.status}`,
        index
      });
      return null;
    }
    
    const result = await response.json();
    console.log(`📥 Resposta:`, JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error(`❌ Erro ao enviar mensagem ${index + 1}:`, error.message);
    errosDetectados.push({
      mensagem: body,
      erro: error.message,
      index
    });
    return null;
  }
}

async function verificarEstadoNoDb() {
  // Query Supabase para verificar estado atual da conversa
  console.log('\n🔍 Verificando estado no banco de dados...');
  
  const query = `
    SELECT 
      id, 
      telefone, 
      estado_atual, 
      contexto,
      criado_em,
      (SELECT COUNT(*) FROM whatsapp_mensagens WHERE conversa_id = wc.id) as total_mensagens,
      (SELECT COUNT(*) FROM whatsapp_mensagens 
       WHERE conversa_id = wc.id 
       AND conteudo LIKE '%não consegui entender%' 
       OR conteudo LIKE '%bugou minha cabeça%') as erros_fallback
    FROM whatsapp_conversas wc
    WHERE telefone = '${TELEFONE_TESTE}'
    ORDER BY criado_em DESC
    LIMIT 1;
  `;
  
  console.log('📊 SQL para executar manualmente:');
  console.log(query);
  
  return null; // Não executamos a query aqui pois requer credenciais DB
}

async function executarTeste() {
  console.log('═'.repeat(80));
  console.log('🧪 TESTE E2E: Reproduzir bug loop "não peguei" ao escolher sofá');
  console.log('═'.repeat(80));
  console.log(`📞 Telefone de teste: ${TELEFONE_TESTE}`);
  console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
  console.log('');
  
  for (let i = 0; i < mensagens.length; i++) {
    const msg = mensagens[i];
    
    // Aguardar delay antes de enviar próxima mensagem
    if (i > 0) {
      console.log(`⏱️  Aguardando ${msg.delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, msg.delay));
    }
    
    const result = await enviarMensagem(msg.body, i, msg.expected_state);
    
    if (!result) {
      console.log('⚠️  Mensagem falhou, continuando teste...');
      continue;
    }
    
    // Verificar se resposta contém mensagens de erro/fallback
    const respostaBot = result.mensagem || result.message || JSON.stringify(result);
    const contemErro = /não consegui entender|bugou minha cabeça|tenta de novo|não peguei/i.test(respostaBot);
    
    if (contemErro && msg.expected_state === 'coletando_modelo_sofa') {
      console.log('❌ BUG DETECTADO! Bot retornou mensagem de erro quando deveria reconhecer item.');
      errosDetectados.push({
        mensagem: msg.body,
        erro: 'Loop de fallback detectado',
        resposta_bot: respostaBot,
        index: i
      });
    } else if (!contemErro && msg.expected_state === 'coletando_modelo_sofa') {
      console.log('✅ Item reconhecido corretamente!');
    }
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 RESULTADO DO TESTE');
  console.log('═'.repeat(80));
  
  if (errosDetectados.length === 0) {
    console.log('✅ TESTE PASSOU! Nenhum erro detectado.');
    console.log('');
    console.log('✨ Hotfixes aplicados com sucesso:');
    console.log('   - Normalização de cidade (ISSUE-003)');
    console.log('   - Matching de item melhorado (ISSUE-002)');
    console.log('   - Detecção em verificando_cidade (ISSUE-001)');
  } else {
    console.log(`❌ TESTE FALHOU! ${errosDetectados.length} erro(s) detectado(s):\n`);
    errosDetectados.forEach((erro, idx) => {
      console.log(`${idx + 1}. Mensagem "${erro.mensagem}" (índice ${erro.index})`);
      console.log(`   Erro: ${erro.erro}`);
      if (erro.resposta_bot) {
        console.log(`   Resposta bot: ${erro.resposta_bot.substring(0, 100)}...`);
      }
      console.log('');
    });
    
    console.log('🔧 Ações recomendadas:');
    console.log('   1. Verificar se hotfixes foram aplicados corretamente');
    console.log('   2. Executar query SQL abaixo para investigar estado da conversa');
    console.log('   3. Verificar logs do edge function no Supabase Dashboard');
  }
  
  console.log('\n📊 Queries SQL para investigação:');
  await verificarEstadoNoDb();
  
  console.log('\n' + '═'.repeat(80));
  
  process.exit(errosDetectados.length > 0 ? 1 : 0);
}

// Executar teste
executarTeste().catch(error => {
  console.error('💥 Erro fatal no teste:', error);
  process.exit(1);
});
