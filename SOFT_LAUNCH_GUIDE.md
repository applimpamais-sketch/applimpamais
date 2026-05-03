# Guia de Soft Launch - Bot WhatsApp RC Limpa Mais

## Etapa 4: Soft Launch com 50 Clientes Reais
**Data de Início:** 2024-12-24  
**Duração:** 7 dias  
**Meta:** Validar correções críticas com tráfego real controlado

---

## 1. SELEÇÃO DE CLIENTES

### 1.1 Critérios de Seleção
Selecionar 50 clientes que atendam aos seguintes critérios:

✅ **Clientes Ideais:**
- Clientes recorrentes (já fizeram pelo menos 2 agendamentos)
- Histórico positivo (sem reclamações registradas)
- Diversidade geográfica (diferentes bairros/cidades)
- Mix de perfis: residencial e comercial
- Diferentes tipos de serviço: limpeza, impermeabilização, combos

❌ **Clientes a Evitar:**
- Clientes com histórico de reclamações
- Clientes inadimplentes
- Clientes que já reportaram problemas com bot
- Primeiros clientes (sem histórico de comportamento)

### 1.2 Query de Seleção
```sql
-- Selecionar 50 clientes candidatos para soft launch
WITH clientes_qualificados AS (
  SELECT 
    telefone,
    nome_cliente,
    COUNT(DISTINCT id) as total_agendamentos,
    MAX(data_agendamento) as ultimo_agendamento,
    SUM(valor_total) as valor_total_historico,
    STRING_AGG(DISTINCT cidade, ', ') as cidades,
    AVG(
      CASE 
        WHEN status = 'concluido' THEN 1 
        ELSE 0 
      END
    ) as taxa_conclusao
  FROM agendamentos
  WHERE 
    created_at >= NOW() - INTERVAL '6 months'
    AND telefone IS NOT NULL
    AND status IN ('concluido', 'pago')
  GROUP BY telefone, nome_cliente
  HAVING COUNT(DISTINCT id) >= 2
)
SELECT 
  telefone,
  nome_cliente,
  total_agendamentos,
  ultimo_agendamento,
  ROUND(valor_total_historico, 2) as valor_total,
  cidades,
  ROUND(taxa_conclusao * 100, 1) as taxa_conclusao_pct
FROM clientes_qualificados
WHERE taxa_conclusao >= 0.8  -- Pelo menos 80% de conclusão
ORDER BY 
  total_agendamentos DESC,
  ultimo_agendamento DESC
LIMIT 50;
```

### 1.3 Registro de Clientes Soft Launch
```sql
-- Criar tabela para rastrear clientes do soft launch
CREATE TABLE IF NOT EXISTS soft_launch_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone TEXT NOT NULL UNIQUE,
  nome_cliente TEXT NOT NULL,
  data_inclusao TIMESTAMPTZ DEFAULT NOW(),
  motivo_inclusao TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  feedback_coletado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir clientes selecionados (executar após validar query acima)
INSERT INTO soft_launch_clientes (telefone, nome_cliente, motivo_inclusao)
SELECT 
  telefone,
  nome_cliente,
  'Cliente recorrente com histórico positivo - ' || total_agendamentos || ' agendamentos'
FROM (
  -- [COPIAR QUERY 1.2 AQUI]
) AS candidatos
ON CONFLICT (telefone) DO NOTHING;
```

---

## 2. CONFIGURAÇÃO DE WHITELIST

### 2.1 Implementar Whitelist no Bot
Modificar edge function `receive-whatsapp-bot-webhook` para verificar whitelist:

```typescript
// Adicionar no início do handler, após normalização do telefone
const SOFT_LAUNCH_ENABLED = Deno.env.get('SOFT_LAUNCH_ENABLED') === 'true';

if (SOFT_LAUNCH_ENABLED) {
  const { data: isWhitelisted } = await supabase
    .from('soft_launch_clientes')
    .select('id')
    .eq('telefone', telefoneNormalizado)
    .eq('ativo', true)
    .maybeSingle();

  if (!isWhitelisted) {
    console.log(`[SOFT LAUNCH] Cliente ${telefoneNormalizado} não está na whitelist`);
    
    // Enviar mensagem explicativa
    await enviarMensagem(
      telefoneNormalizado,
      '⚠️ Nosso atendimento por WhatsApp está temporariamente em manutenção. ' +
      'Por favor, entre em contato pelo telefone (31) 99410-3135 para agendamentos. ' +
      'Pedimos desculpas pelo inconveniente!'
    );
    
    return new Response(JSON.stringify({ status: 'not_whitelisted' }), {
      headers: corsHeaders,
      status: 200
    });
  }
  
  console.log(`[SOFT LAUNCH] Cliente ${telefoneNormalizado} aprovado para soft launch`);
}
```

### 2.2 Variável de Ambiente
Adicionar no Supabase:
- `SOFT_LAUNCH_ENABLED=true` (para ativar modo soft launch)
- Após 7 dias de sucesso: `SOFT_LAUNCH_ENABLED=false` (para liberar para todos)

---

## 3. COMUNICAÇÃO COM CLIENTES

### 3.1 Mensagem Inicial (Opcional - Não Enviar)
**Decisão:** NÃO enviar mensagem prévia aos clientes. Deixar que eles iniciem contato naturalmente via WhatsApp.

**Motivo:** 
- Teste mais realista do fluxo
- Evita criar expectativa específica
- Observar comportamento orgânico

### 3.2 Mensagem de Boas-Vindas Bot (Automática)
Já está implementada no estado `inicial`. Bot se apresenta automaticamente quando cliente envia primeira mensagem.

### 3.3 Comunicação Pós-Agendamento (Automática)
Lembretes já configurados via `whatsapp_lembretes`:
- 1 dia antes (18:00)
- Dia do serviço (08:00)
- 1 dia depois (14:00) - **incluir pergunta de feedback**

Modificar lembrete de 1 dia depois para coletar feedback:
```sql
-- Atualizar template de lembrete pós-serviço para soft launch
UPDATE templates_mensagens
SET conteudo = 
  'Olá {{nome_cliente}}! 👋\n\n' ||
  'Esperamos que tenha ficado satisfeito(a) com nosso serviço de {{tipo_servico}} realizado ontem! 🧼✨\n\n' ||
  '💬 Gostaríamos muito de ouvir sua opinião:\n' ||
  '• O que achou do atendimento pelo WhatsApp?\n' ||
  '• Encontrou alguma dificuldade?\n' ||
  '• Sugestões de melhoria?\n\n' ||
  'Seu feedback é essencial para continuarmos melhorando! 🙏\n\n' ||
  'RC Limpa Mais - Limpeza que Transforma'
WHERE categoria = 'lembrete_pos_servico';
```

---

## 4. MONITORAMENTO INTENSIVO

### 4.1 Métricas Críticas (Atualizar de 4 em 4 horas)

```sql
-- Dashboard Soft Launch - Executar a cada 4 horas
WITH soft_launch_conversas AS (
  SELECT 
    c.*,
    slc.nome_cliente as nome_whitelist
  FROM whatsapp_conversas c
  JOIN soft_launch_clientes slc ON slc.telefone = c.telefone
  WHERE 
    c.criado_em >= (SELECT MIN(data_inclusao) FROM soft_launch_clientes)
    AND slc.ativo = true
)
SELECT 
  'Total de Conversas' as metrica,
  COUNT(*) as valor
FROM soft_launch_conversas

UNION ALL

SELECT 
  'Conversas Finalizadas' as metrica,
  COUNT(*) as valor
FROM soft_launch_conversas
WHERE finalizado = true

UNION ALL

SELECT 
  'Conversas com Agendamento' as metrica,
  COUNT(*) as valor
FROM soft_launch_conversas
WHERE contexto->>'agendamento_bot_id' IS NOT NULL

UNION ALL

SELECT 
  'Taxa de Conversão (%)' as metrica,
  ROUND(
    100.0 * 
    COUNT(CASE WHEN contexto->>'agendamento_bot_id' IS NOT NULL THEN 1 END) / 
    NULLIF(COUNT(*), 0),
    2
  ) as valor
FROM soft_launch_conversas

UNION ALL

SELECT 
  'Loops Detectados' as metrica,
  COUNT(DISTINCT c.id) as valor
FROM soft_launch_conversas c
JOIN whatsapp_mensagens m ON m.conversa_id = c.id
WHERE m.criado_em >= NOW() - INTERVAL '2 minutes'
GROUP BY c.id
HAVING COUNT(m.id) > 10

UNION ALL

SELECT 
  'Conversas Travadas (>30min)' as metrica,
  COUNT(*) as valor
FROM soft_launch_conversas
WHERE 
  finalizado = false
  AND ultima_mensagem < NOW() - INTERVAL '30 minutes'
  AND estado_atual IN (
    'identificando_item',
    'coletando_tamanho_sofa',
    'coletando_opcao_item',
    'apresentando_orcamento'
  );
```

### 4.2 Alertas Específicos Soft Launch

**ALERTA CRÍTICO:** Se qualquer métrica abaixo for atingida, executar rollback imediato:
- Taxa de loop > 2% das conversas soft launch
- Taxa de conversão < 20% (baseline esperado: 30%+)
- Mais de 5 conversas travadas simultaneamente
- Taxa de falha Ultramsg > 10%

**Comando de Rollback:**
```bash
# Desativar soft launch imediatamente
supabase secrets set SOFT_LAUNCH_ENABLED=false

# OU executar rollback completo (Cenário 3)
# Ver ROLLBACK_SCRIPT.sql
```

---

## 5. COLETA DE FEEDBACK

### 5.1 Registro de Feedback
```sql
-- Criar tabela de feedback soft launch
CREATE TABLE IF NOT EXISTS soft_launch_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone TEXT NOT NULL,
  nome_cliente TEXT,
  agendamento_id UUID REFERENCES agendamentos(id),
  nota_geral INTEGER CHECK (nota_geral >= 1 AND nota_geral <= 5),
  facilidade_uso INTEGER CHECK (facilidade_uso >= 1 AND facilidade_uso <= 5),
  velocidade_resposta INTEGER CHECK (velocidade_resposta >= 1 AND velocidade_resposta <= 5),
  clareza_informacoes INTEGER CHECK (clareza_informacoes >= 1 AND clareza_informacoes <= 5),
  comentario_positivo TEXT,
  comentario_negativo TEXT,
  sugestao_melhoria TEXT,
  prefere_humano BOOLEAN,
  voltaria_usar BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas rápidas
CREATE INDEX idx_soft_launch_feedback_telefone ON soft_launch_feedback(telefone);
CREATE INDEX idx_soft_launch_feedback_created ON soft_launch_feedback(created_at DESC);
```

### 5.2 Formulário de Feedback (Enviar via WhatsApp após serviço)
Enviar link para formulário Google Forms ou Typeform com perguntas:

1. **Nota Geral (1-5 estrelas):** Como você avalia sua experiência com nosso atendimento por WhatsApp?
2. **Facilidade de Uso (1-5):** Foi fácil navegar pelo atendimento e fazer seu agendamento?
3. **Velocidade de Resposta (1-5):** O bot respondeu rapidamente às suas mensagens?
4. **Clareza das Informações (1-5):** As informações sobre serviços e preços foram claras?
5. **O que você mais gostou?** (texto livre)
6. **O que você menos gostou?** (texto livre)
7. **Sugestões de melhoria?** (texto livre)
8. **Você preferiria falar com um humano?** (Sim/Não)
9. **Voltaria a usar o atendimento por WhatsApp?** (Sim/Não)

---

## 6. CRITÉRIOS DE SUCESSO (GO/NO-GO)

### 6.1 Critérios para Aprovar Rollout Completo (Etapa 5)

✅ **Critérios Obrigatórios (todos devem ser atingidos):**
1. **Taxa de Conversão >= 25%** (conversas → agendamentos)
2. **Taxa de Loop < 2%** das conversas
3. **Taxa de Falha Ultramsg < 5%**
4. **Conversas Travadas < 10%** do total
5. **Nenhum erro crítico** detectado em 7 dias
6. **Feedback médio >= 3.5/5** em todas as categorias
7. **Pelo menos 30 feedbacks** coletados (60% dos 50 clientes)

✅ **Critérios Desejáveis (bônus):**
- Taxa de conversão > 30%
- Feedback médio >= 4.0/5
- Menos de 5% preferem humano
- Mais de 80% voltariam a usar

### 6.2 Decisão GO/NO-GO

**SE todos critérios obrigatórios atingidos:**
→ Prosseguir para Etapa 5 (Rollout Gradual)

**SE 1 ou mais critérios obrigatórios falharem:**
→ Executar análise de causa raiz
→ Aplicar correções necessárias
→ Estender soft launch por +7 dias
→ Reavaliação

**SE erros críticos recorrentes:**
→ Rollback imediato (ROLLBACK_SCRIPT.sql)
→ Sprint de correções
→ Novo soft launch após fixes

---

## 7. CRONOGRAMA DE ATIVIDADES

### Dia 1-2 (Setup)
- [ ] Executar query de seleção de clientes
- [ ] Inserir clientes na tabela `soft_launch_clientes`
- [ ] Configurar `SOFT_LAUNCH_ENABLED=true` no Supabase
- [ ] Deploy edge function com whitelist
- [ ] Validar: enviar mensagem de teste para 1 cliente whitelist
- [ ] Validar: enviar mensagem de teste para 1 cliente NÃO whitelist (deve receber mensagem de manutenção)

### Dia 3-7 (Monitoramento)
**Execução 3x/dia (08:00, 14:00, 20:00 BRT):**
- [ ] Executar query de métricas críticas (seção 4.1)
- [ ] Verificar alertas (loops, travamentos, falhas)
- [ ] Registrar observações em planilha
- [ ] Responder feedbacks recebidos

**Execução 1x/dia (22:00 BRT):**
- [ ] Gerar relatório diário consolidado
- [ ] Atualizar dashboard
- [ ] Decidir: continuar OU rollback OU ajustar

### Dia 8-9 (Análise Final)
- [ ] Compilar todas as métricas dos 7 dias
- [ ] Calcular médias e tendências
- [ ] Avaliar critérios de sucesso GO/NO-GO
- [ ] Preparar apresentação de resultados
- [ ] Decisão final: aprovar rollout completo OU estender soft launch OU rollback

---

## 8. TEMPLATE DE RELATÓRIO DIÁRIO

```markdown
# Relatório Soft Launch - Dia X/7
**Data:** [DATA]  
**Horário:** [HORÁRIO]  

## Métricas do Dia
- Total de conversas iniciadas: X
- Conversas finalizadas: X (X%)
- Agendamentos criados: X
- Taxa de conversão: X%
- Loops detectados: X
- Conversas travadas: X
- Falhas Ultramsg: X (X%)

## Comparação com Dia Anterior
- Conversas: ▲/▼ X%
- Taxa de conversão: ▲/▼ X pontos percentuais
- Loops: ▲/▼ X casos

## Feedbacks Recebidos
- Total de feedbacks: X
- Nota média geral: X.X/5
- Principais elogios: [resumo]
- Principais reclamações: [resumo]
- Sugestões de melhoria: [resumo]

## Incidentes
- [ ] Nenhum incidente
- [X] Incidente detectado: [descrição + ação tomada]

## Ações Necessárias
- [ ] Nenhuma ação necessária
- [X] Ação: [descrição]

## Status Geral
🟢 Verde (tudo OK) / 🟡 Amarelo (atenção) / 🔴 Vermelho (crítico)

## Observações
[Texto livre com insights e observações relevantes]
```

---

## 9. CONTATOS DE EMERGÊNCIA

- **Operador Responsável:** [INSERIR NOME + TELEFONE]
- **Suporte Técnico:** [INSERIR EMAIL/SLACK]
- **Ultramsg Dashboard:** https://ultramsg.com/dashboard
- **Supabase Dashboard:** [LINK DO PROJETO]

---

## 10. PRÓXIMOS PASSOS APÓS SUCESSO

Após 7 dias de soft launch bem-sucedido:

1. Compilar relatório final consolidado
2. Apresentar resultados para stakeholders
3. Obter aprovação formal para rollout completo
4. Desativar whitelist: `SOFT_LAUNCH_ENABLED=false`
5. Prosseguir para **Etapa 5: Rollout Gradual 100%**

---

**Última Atualização:** 2024-12-24  
**Status:** Pronto para Execução
