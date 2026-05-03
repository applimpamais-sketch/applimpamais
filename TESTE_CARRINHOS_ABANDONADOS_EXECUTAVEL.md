# 🧪 TESTES EXECUTÁVEIS: Carrinhos Abandonados
## Guia Prático e Rápido

---

## ⚡ TESTE RÁPIDO (5 minutos)

### 1️⃣ Criar Carrinho Abandonado

**Abra seu navegador em modo anônimo e execute**:

```bash
# URL: https://rclimpamais.com.br
# 1. Adicione 1-2 serviços ao carrinho
# 2. Clique em "Agendar"
# 3. Preencha:
#    - Nome: João Teste
#    - Telefone: (31) 99999-9999  ← SEU WHATSAPP REAL
#    - CEP: 30130-100
#    - Endereço: Rua Teste, 123
#    - Cidade: Belo Horizonte
# 4. Selecione uma data futura
# 5. AGUARDE 15 SEGUNDOS SEM CLICAR EM NADA
# 6. Feche a aba
```

### 2️⃣ Verificar no Banco (após 15 segundos)

```sql
-- Cole isso no Supabase SQL Editor ou use o query tool
SELECT 
  id,
  nome_cliente,
  telefone,
  status,
  valor_total,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutos_atras
FROM carrinhos_abandonados
WHERE telefone LIKE '%99999999%'
ORDER BY created_at DESC
LIMIT 1;
```

**✅ Sucesso se**: 1 registro com `status='abandonado'`

### 3️⃣ Aguardar WhatsApp (2 minutos após criação do registro)

**Verifique seu WhatsApp**: Mensagem deve chegar automaticamente

**Formato esperado**:
```
Olá João Teste! 👋

Você estava quase finalizando seu agendamento! 
Falta pouco para garantir sua data. 😊

📦 Serviços selecionados:
🧹 Limpeza
• [Nome do item]
  → Quantidade: 1 unidade
  → Valor unitário: R$ XX,XX

💰 Valor total: R$ XXX,XX
💳 Pode ser pago no PIX ou em 12x no cartão

📍 Endereço: Rua Teste, 123

Continue por aqui: https://rclimpamais.com.br

Estou aqui para ajudar! 💬
```

### 4️⃣ Verificar Atualização no Banco (após receber WhatsApp)

```sql
SELECT 
  status,
  tentativas_contato,
  ultima_tentativa_contato
FROM carrinhos_abandonados
WHERE telefone LIKE '%99999999%'
ORDER BY created_at DESC
LIMIT 1;
```

**✅ Sucesso se**:
- `status='contatado'`
- `tentativas_contato=1`
- `ultima_tentativa_contato` é recente

---

## 📊 QUERIES DE DIAGNÓSTICO

### Query 1: Ver TODOS os carrinhos abandonados
```sql
SELECT 
  id,
  nome_cliente,
  telefone,
  cidade,
  valor_total,
  status,
  tentativas_contato,
  created_at,
  last_activity
FROM carrinhos_abandonados
ORDER BY created_at DESC
LIMIT 20;
```

### Query 2: Carrinhos que DEVERIAM ter recebido WhatsApp mas não receberam
```sql
-- Carrinhos > 5 minutos sem contato (POSSÍVEL BUG)
SELECT 
  id,
  nome_cliente,
  telefone,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutos_desde_criacao,
  status,
  tentativas_contato
FROM carrinhos_abandonados
WHERE status = 'abandonado'
  AND tentativas_contato = 0
  AND telefone IS NOT NULL
  AND created_at < NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

**Se essa query retornar registros = BUG CONFIRMADO**

### Query 3: Estatísticas de Recuperação
```sql
SELECT 
  COUNT(*) as total_carrinhos,
  COUNT(*) FILTER (WHERE status = 'abandonado') as nao_contatados,
  COUNT(*) FILTER (WHERE status = 'contatado') as contatados,
  COUNT(*) FILTER (WHERE status = 'recuperado') as recuperados,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'recuperado') / 
    NULLIF(COUNT(*), 0), 
    2
  ) as taxa_recuperacao_pct,
  SUM(valor_total) as valor_total_em_risco
FROM carrinhos_abandonados
WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

## 🔧 TESTES ADICIONAIS

### Teste A: Carrinho SEM telefone (NÃO deve salvar)
```
1. Modo anônimo
2. Adicionar itens
3. Preencher APENAS nome: "Maria Teste"
4. NÃO preencher telefone
5. Aguardar 15s
6. Fechar aba

✅ Esperado: Nenhum registro criado
```

**Validação**:
```sql
SELECT COUNT(*) FROM carrinhos_abandonados WHERE nome_cliente = 'Maria Teste';
-- Deve retornar 0
```

### Teste B: Abandono rápido < 10s (NÃO deve salvar)
```
1. Modo anônimo
2. Adicionar itens → checkout
3. Preencher nome + telefone
4. Aguardar APENAS 5 segundos
5. Fechar aba

✅ Esperado: Nenhum registro (debounce não atingido)
```

---

## 🎯 CENÁRIOS REALISTAS

### Cenário 1: Cliente indeciso
```
1. Adiciona 3 itens ao carrinho
2. Vai para checkout
3. Preenche metade do formulário (nome + telefone)
4. Fecha aba para "pensar melhor"
```
**Resultado**: Carrinho salvo, WhatsApp automático após 2 min

### Cenário 2: Cliente com dúvida sobre preço
```
1. Adiciona 5 itens
2. Vê total alto
3. Fecha aba
```
**Resultado**: Carrinho NÃO salvo (sem telefone)

### Cenário 3: Cliente interrompido
```
1. Preenche formulário completo
2. Seleciona data
3. Recebe ligação e fecha aba
```
**Resultado**: Carrinho salvo, WhatsApp com mensagem personalizada

---

## 🚨 TROUBLESHOOTING

### Problema 1: Registro não foi criado
**Checklist**:
- [ ] Aguardou 15+ segundos?
- [ ] Telefone foi preenchido?
- [ ] Carrinho não estava vazio?
- [ ] Console do navegador sem erros?

**Debug**:
```javascript
// Abra Console (F12) e digite:
localStorage.getItem('carrinho_session_id')
// Deve retornar um UUID
```

### Problema 2: WhatsApp não chegou
**Checklist**:
- [ ] Registro existe no banco? (Query 1)
- [ ] Status é 'abandonado'?
- [ ] Telefone está correto?
- [ ] Aguardou 2+ minutos após criação?
- [ ] Horário comercial? (⚠️ Atualmente DESATIVADO em modo teste)

**Logs da Edge Function**:
```sql
-- Verificar se CRON executou
SELECT * FROM function_edge_logs 
WHERE function_id LIKE '%abandoned%'
ORDER BY timestamp DESC
LIMIT 10;
```

### Problema 3: Edge Function não executou
**Verificar agendamento CRON**:
- Deve executar a cada 5 minutos
- Logs devem aparecer em `function_edge_logs`

**Executar manualmente**:
```bash
# Via Supabase Dashboard:
# Functions → process-abandoned-carts → Test
# Ou via curl (se tiver acesso ao endpoint)
```

---

## 📝 TEMPLATE DE RELATÓRIO

**Use este template para reportar resultados**:

```markdown
## Teste Executado em: [DATA/HORA]

### Carrinho Criado
- [x] Registro no banco: SIM / NÃO
- ID do registro: ________________
- Timestamp criação: ________________

### WhatsApp Recebido
- [x] Mensagem recebida: SIM / NÃO
- Tempo até receber: _____ minutos
- Conteúdo correto: SIM / NÃO

### Status Atualizado
- [x] Status mudou para 'contatado': SIM / NÃO
- Tentativas_contato = 1: SIM / NÃO

### Screenshots
- [ ] Formulário preenchido (anexado)
- [ ] WhatsApp recebido (anexado)
- [ ] Query do banco (anexado)

### Observações
[Escreva aqui qualquer comportamento inesperado]
```

---

## ⏱️ TIMELINE ESPERADA

```
00:00 - Usuário entra no checkout
00:10 - Aguarda 10s → REGISTRO CRIADO no banco
00:15 - Fecha aba
02:00 - CRON executa pela primeira vez após criação
02:01 - WhatsApp ENVIADO automaticamente
02:02 - Status ATUALIZADO para 'contatado'
```

**Tempo total do teste**: ~2-3 minutos

---

## ✅ CHECKLIST FINAL

**Antes de considerar sistema validado**:

- [ ] Registro criado após 10s de inatividade
- [ ] WhatsApp recebido em 2-3 minutos
- [ ] Status atualizado corretamente
- [ ] Mensagem personalizada com dados corretos
- [ ] Admin consegue visualizar carrinho
- [ ] Query 2 retorna 0 registros (sem bugs)
- [ ] Teste repetido com 3 cenários diferentes

**Se TODOS os itens estiverem marcados = SISTEMA 100% FUNCIONAL** ✅
