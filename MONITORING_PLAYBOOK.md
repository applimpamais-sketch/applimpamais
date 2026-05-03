# Playbook de Monitoramento - Bot WhatsApp RC Limpa Mais

## Deploy Staging - Etapa 3
**Data de Deploy:** 2024-12-24  
**Versão:** v1.1.0 (Correções Críticas #1-#5)  
**Duração Monitoramento:** 48 horas

---

## 1. EDGE FUNCTION DEPLOYADA

### receive-whatsapp-bot-webhook
- **Status:** Deployed ✅
- **Correções aplicadas:**
  - ✅ #1: explicando_servico retorna mensagem completa
  - ✅ #2: tamanhos_disponiveis persistido no contexto
  - ✅ #3: coletando_opcao_item preserva contexto crítico
  - ✅ #4: identificando_item multi-item sem loop infinito
  - ✅ #5: obterSaudacaoPorHorario usa timezone Brasília correto

---

## 2. QUERIES DE MONITORAMENTO

### 2.1 Detectar Loops Infinitos
```sql
-- Conversas com mais de 10 mensagens em 2 minutos (possível loop)
SELECT 
  c.id,
  c.telefone,
  c.estado_atual,
  COUNT(m.id) as total_mensagens,
  MAX(m.criado_em) as ultima_mensagem
FROM whatsapp_conversas c
JOIN whatsapp_mensagens m ON m.conversa_id = c.id
WHERE m.criado_em >= NOW() - INTERVAL '2 minutes'
GROUP BY c.id, c.telefone, c.estado_atual
HAVING COUNT(m.id) > 10
ORDER BY total_mensagens DESC;
```

### 2.2 Conversas Travadas em Estados Críticos
```sql
-- Conversas há mais de 30 min no mesmo estado sem finalizar
SELECT 
  id,
  telefone,
  estado_atual,
  contexto,
  ultima_mensagem,
  criado_em,
  NOW() - ultima_mensagem as tempo_sem_resposta
FROM whatsapp_conversas
WHERE 
  finalizado = false 
  AND ultima_mensagem < NOW() - INTERVAL '30 minutes'
  AND estado_atual IN (
    'identificando_item',
    'coletando_tamanho_sofa',
    'coletando_opcao_item',
    'apresentando_orcamento'
  )
ORDER BY ultima_mensagem ASC;
```

### 2.3 Taxa de Conversão (antes vs depois)
```sql
-- Métrica de sucesso: conversas que chegaram a agendamentos_bot
SELECT 
  DATE(criado_em) as data,
  COUNT(*) as total_conversas,
  COUNT(CASE WHEN estado_atual = 'finalizado' THEN 1 END) as finalizadas,
  COUNT(CASE WHEN contexto->>'agendamento_bot_id' IS NOT NULL THEN 1 END) as com_agendamento,
  ROUND(
    100.0 * COUNT(CASE WHEN contexto->>'agendamento_bot_id' IS NOT NULL THEN 1 END) / NULLIF(COUNT(*), 0),
    2
  ) as taxa_conversao_pct
FROM whatsapp_conversas
WHERE criado_em >= NOW() - INTERVAL '7 days'
GROUP BY DATE(criado_em)
ORDER BY data DESC;
```

### 2.4 Erros de OpenAI API (Rate Limit / Falhas)
```sql
-- Logs de WhatsApp com erro de processamento
SELECT 
  telefone_remetente,
  tipo_mensagem,
  processamento_status,
  erro_mensagem,
  created_at
FROM whatsapp_financeiro_log
WHERE 
  processamento_status = 'erro'
  AND created_at >= NOW() - INTERVAL '48 hours'
ORDER BY created_at DESC
LIMIT 100;
```

### 2.5 Ultramsg API - Mensagens Não Enviadas
```sql
-- Mensagens enviadas com sucesso vs falhas
SELECT 
  DATE(created_at) as data,
  COUNT(*) as total_tentativas,
  COUNT(CASE WHEN sucesso = true THEN 1 END) as enviadas_sucesso,
  COUNT(CASE WHEN sucesso = false THEN 1 END) as falhas,
  ROUND(100.0 * COUNT(CASE WHEN sucesso = false THEN 1 END) / NULLIF(COUNT(*), 0), 2) as taxa_falha_pct
FROM whatsapp_envios_log
WHERE created_at >= NOW() - INTERVAL '48 hours'
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

---

## 3. ALERTAS CONFIGURADOS

### 3.1 Loop Infinito (CRÍTICO)
- **Condição:** Mais de 10 mensagens em 2 minutos na mesma conversa
- **Ação:** Marcar conversa como finalizada automaticamente + notificar equipe
- **Query:** 2.1 acima
- **Frequência:** A cada 5 minutos

### 3.2 Conversas Travadas (ALTO)
- **Condição:** Conversa há mais de 30 min sem resposta em estado crítico
- **Ação:** Notificar equipe para intervenção manual
- **Query:** 2.2 acima
- **Frequência:** A cada 15 minutos

### 3.3 Taxa de Falha Ultramsg > 5% (ALTO)
- **Condição:** Taxa de falha de envio > 5% nas últimas 24h
- **Ação:** Verificar credenciais Ultramsg + saldo de créditos
- **Query:** 2.5 acima
- **Frequência:** A cada 1 hora

### 3.4 OpenAI Rate Limit (MÉDIO)
- **Condição:** Mais de 10 erros de rate limit em 1 hora
- **Ação:** Ativar fallback de respostas simples + notificar
- **Query:** 2.4 acima
- **Frequência:** A cada 30 minutos

---

## 4. DASHBOARD SUGERIDO

### Métricas em Tempo Real (atualizar a cada 5 min)
1. **Total de conversas ativas** (não finalizadas)
2. **Conversas em loop** (query 2.1)
3. **Conversas travadas** (query 2.2)
4. **Taxa de conversão hoje** (query 2.3)
5. **Taxa de falha Ultramsg últimas 24h** (query 2.5)
6. **Erros OpenAI últimas 24h** (query 2.4)

### Gráficos
- **Linha temporal:** Conversas iniciadas vs finalizadas vs com agendamento (últimos 7 dias)
- **Barra:** Estados mais frequentes (estado_atual)
- **Pizza:** Taxa de sucesso de envio Ultramsg (últimas 48h)

---

## 5. ROLLBACK PLAN

### 5.1 Condições para Rollback Imediato
- Taxa de loop infinito > 5% das conversas
- Taxa de falha Ultramsg > 20%
- Mais de 50% das conversas travadas em estados críticos
- Erro crítico detectado (ex.: bot não responde a nenhuma mensagem)

### 5.2 Comando de Rollback
```bash
# Reverter para versão anterior (antes das correções)
git revert HEAD~1
git push origin main

# OU restaurar manualmente o arquivo
git checkout <commit-anterior> supabase/functions/receive-whatsapp-bot-webhook/index.ts
git commit -m "Rollback: Reverter correções críticas devido a falha em staging"
git push origin main
```

### 5.3 Rollback de Dados (se necessário)
```sql
-- Marcar todas as conversas como finalizadas se houver loop massivo
UPDATE whatsapp_conversas
SET 
  finalizado = true,
  contexto = jsonb_set(
    COALESCE(contexto, '{}'::jsonb),
    '{rollback_reason}',
    '"Loop massivo detectado - conversa finalizada por segurança"'
  )
WHERE 
  finalizado = false
  AND criado_em >= NOW() - INTERVAL '48 hours';
```

---

## 6. CHECKLIST DE VALIDAÇÃO (executar a cada 12h)

### Manhã (08:00 BRT)
- [ ] Executar query 2.1 (loops)
- [ ] Executar query 2.2 (conversas travadas)
- [ ] Executar query 2.3 (taxa de conversão)
- [ ] Verificar logs de edge function (supabase--edge-function-logs)
- [ ] Verificar dashboard Ultramsg (créditos restantes)

### Tarde (16:00 BRT)
- [ ] Repetir todas as queries acima
- [ ] Comparar métricas: manhã vs tarde
- [ ] Verificar se há padrões (ex.: loops sempre no mesmo estado)
- [ ] Testar manualmente 1 conversa completa (simulação)

### Noite (22:00 BRT)
- [ ] Executar todas as queries
- [ ] Gerar relatório diário
- [ ] Decidir: continuar staging OU rollback OU prosseguir para soft launch

---

## 7. CRITÉRIOS DE SUCESSO (após 48h)

Para aprovar passagem para **Etapa 4 (Soft Launch)**:
- ✅ Taxa de loop infinito < 1%
- ✅ Taxa de conversão >= 30% (baseline anterior)
- ✅ Taxa de falha Ultramsg < 5%
- ✅ Nenhum erro crítico de OpenAI (rate limit controlado)
- ✅ Conversas travadas < 10% do total
- ✅ Pelo menos 50 conversas completas testadas com sucesso

---

## 8. LOGS E ARTEFATOS

### Edge Function Logs
```bash
# Verificar logs em tempo real
supabase functions logs receive-whatsapp-bot-webhook --follow
```

### Testes Manuais Recomendados
1. Cliente enviando lista de itens (ex.: "Quero limpar sofá, colchão e tapete")
2. Cliente enviando foto de sofá
3. Cliente enviando áudio
4. Cliente mudando de ideia no meio (ex.: "Na verdade quero outro item")
5. Cliente testando multi-item (adicionar 3+ itens ao carrinho)

---

## 9. CONTATOS DE EMERGÊNCIA

- **Operador Responsável:** [INSERIR NOME/CONTATO]
- **Equipe Técnica:** [INSERIR EMAIL/SLACK]
- **Ultramsg Support:** https://ultramsg.com/dashboard
- **OpenAI Status:** https://status.openai.com/

---

**Última Atualização:** 2024-12-24  
**Próxima Revisão:** Após 48h (2024-12-26)
