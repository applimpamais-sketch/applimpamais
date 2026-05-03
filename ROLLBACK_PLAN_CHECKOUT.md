# 🔄 PLANO DE ROLLBACK - CORREÇÃO CHECKOUT

**Objetivo**: Reverter alterações se necessário  
**Tempo estimado**: 5 minutos  
**Risco**: Baixo (alterações isoladas)

---

## 🚨 QUANDO FAZER ROLLBACK

Execute rollback IMEDIATAMENTE se:
- [ ] Taxa de erro aumentou (>10% de falhas 500)
- [ ] Agendamentos com dados corrompidos no banco
- [ ] Usuários reportando bloqueio total
- [ ] Edge function não responde (timeout >30s)

---

## 📋 PROCEDIMENTO DE ROLLBACK

### 1. Edge Function (Backend)
```bash
# Opção A: Deploy da versão anterior (se disponível)
cd supabase/functions
git checkout HEAD~1 create-public-agendamento/index.ts
supabase functions deploy create-public-agendamento

# Opção B: Reverter manualmente (remover request_id, manter validação)
# Editar create-public-agendamento/index.ts
# - Remover crypto.randomUUID() calls
# - Remover request_id de responses
# - Manter validação telefone/CEP original
supabase functions deploy create-public-agendamento
```

**Verificar**:
```bash
curl -X OPTIONS https://yyrnshankehiqvkndrwk.supabase.co/functions/v1/create-public-agendamento \
  -H "Origin: https://rclimpamais.com.br" \
  -v 2>&1 | grep "HTTP/1.1 204"
```

---

### 2. Frontend (React)

#### Git Rollback
```bash
cd src/pages
git checkout HEAD~1 Agendamento.tsx

cd src/services
git checkout HEAD~1 api.ts
```

#### Manual Rollback (se git não disponível)
**Arquivo**: `src/pages/Agendamento.tsx` (linha 478)

```diff
# REVERTER PARA:
- const telefoneFormatado = sanitizeString(formData.telefone).replace(/\D/g, '');
- const cepFormatado = sanitizeString(formData.cep).replace(/\D/g, '');
+ const telefoneFormatado = sanitizeString(formData.telefone);
+ const cepFormatado = sanitizeString(formData.cep);
```

**ATENÇÃO**: ⚠️ Isso restaura o bug original (400 com telefone formatado)

---

## 🔍 VALIDAÇÃO PÓS-ROLLBACK

### 1. Teste Básico (curl)
```bash
curl -X POST https://yyrnshankehiqvkndrwk.supabase.co/functions/v1/create-public-agendamento \
  -H "Origin: https://rclimpamais.com.br" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_cliente": "Teste Rollback",
    "telefone": "31994678382",
    "endereco": "Rua Teste 123",
    "bairro": "Centro",
    "cidade": "BH - MG",
    "cep": "30840570",
    "data_agendamento": "2025-12-01",
    "itens_carrinho": [],
    "valor_total": 100
  }' | jq .
```

**Resultado Esperado**: `{ "success": true, "agendamento": {...} }`

---

### 2. Teste Manual (Browser)
1. Abrir https://rclimpamais.com.br/agendamento
2. Adicionar item ao carrinho
3. Preencher formulário
4. Clicar "Concluir Agendamento"
5. Verificar redirecionamento para /checkout

---

## 📊 CENÁRIOS DE ROLLBACK

### Cenário 1: Edge Function com erros 500
**Sintoma**: Todos os agendamentos falham com erro interno  
**Causa Provável**: Bug em request_id ou sanitização  
**Rollback**: Apenas backend (edge function)

```bash
git checkout HEAD~1 supabase/functions/create-public-agendamento/index.ts
supabase functions deploy create-public-agendamento
```

---

### Cenário 2: Frontend com validação quebrada
**Sintoma**: Usuários conseguem enviar dados inválidos  
**Causa Provável**: Bug em normalização telefone/CEP  
**Rollback**: Apenas frontend (Agendamento.tsx)

```bash
git checkout HEAD~1 src/pages/Agendamento.tsx
```

⚠️ **IMPORTANTE**: Isso restaura o bug original (400 com telefone formatado). Considere apenas desabilitar a remoção de formatação temporariamente.

---

### Cenário 3: Rollback Total (pior caso)
**Sintoma**: Fluxo completamente quebrado  
**Causa Provável**: Múltiplos bugs introduzidos  
**Rollback**: Frontend + Backend

```bash
# Backend
git checkout HEAD~1 supabase/functions/create-public-agendamento/index.ts
supabase functions deploy create-public-agendamento

# Frontend
git checkout HEAD~1 src/pages/Agendamento.tsx
git checkout HEAD~1 src/services/api.ts
```

---

## 🔧 ROLLBACK ALTERNATIVO (Hot Fix)

Se rollback completo não for viável, aplicar hot fix mínimo:

### Backend (Edge Function)
```typescript
// Remover apenas request_id (manter validação)
// Linha 86-98: Remover requestId
const requestId = crypto.randomUUID(); // ❌ REMOVER
console.error(`❌ [create-public-agendamento] [${requestId}]...`); // ❌ REMOVER request_id do log
// Linha 93: Remover request_id do response
request_id: requestId, // ❌ REMOVER
```

### Frontend
```typescript
// Manter normalização mas adicionar fallback
const telefoneFormatado = (formData.telefone || '').replace(/\D/g, '') || formData.telefone;
const cepFormatado = (formData.cep || '').replace(/\D/g, '') || formData.cep;
```

---

## 📞 COMUNICAÇÃO

### Usuários Afetados
**Canal**: Mensagem no topo do site  
**Mensagem**:
```
⚠️ Estamos realizando manutenção no sistema de agendamentos. 
Se tiver problemas, entre em contato pelo WhatsApp (31) 99467-8382.
```

### Equipe Técnica
**Canal**: Slack/WhatsApp  
**Mensagem**:
```
🚨 ROLLBACK EXECUTADO - Checkout RC Limpa Mais
Status: [OK / COM PROBLEMAS]
Funcionalidade: [RESTAURADA / DEGRADADA]
Próximos passos: [MONITORAR / INVESTIGAR]
```

---

## ✅ CHECKLIST PÓS-ROLLBACK

- [ ] Edge function responde 200 para dados válidos
- [ ] Frontend não exibe erros CORS
- [ ] Agendamentos sendo criados no banco
- [ ] Usuários conseguem finalizar checkout
- [ ] Logs não mostram erros críticos
- [ ] Métricas voltaram ao normal (taxa de sucesso >90%)

---

**Última atualização**: 2025-11-25  
**Responsável**: Equipe Lovable + RC Limpa Mais
