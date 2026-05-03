# 📋 INSTRUÇÕES DE VALIDAÇÃO PÓS-CORREÇÃO

## 🎯 Objetivo
Validar que o fluxo de checkout está funcionando corretamente após implementação dos hotfixes críticos.

---

## ✅ CHECKLIST DE VALIDAÇÃO

### 1. Fluxo Completo Normal

**Passo a passo:**
```
1. Acesse o site (https://rclimpamais.com.br)
2. Adicione 2-3 itens ao carrinho
3. Clique em "Agendar Serviço"
4. Preencha TODOS os campos do formulário:
   - Nome e Sobrenome
   - Telefone (com ou sem formatação)
   - E-mail
   - CEP
   - Rua, Número, Complemento
   - Bairro
   - Cidade/Estado
   - Referência/Observações (IMPORTANTE: preencher este campo)
5. Selecione data e período
6. Clique em "Concluir Agendamento"
```

**Resultado esperado:**
- ✅ Tela de loading aparece
- ✅ Mensagem de sucesso no WhatsApp
- ✅ Redireciona para `/checkout` (NÃO para homepage)
- ✅ Página de confirmação exibe:
  - Nome do cliente
  - Endereço completo
  - Telefone
  - Data do agendamento
  - Lista de itens com preços
  - Total correto
  - Código do pedido (formato: LS-XXXXXX)
- ✅ Console mostra logs:
  ```
  ✅ [Checkout] Agendamento criado com sucesso: <uuid> Order: LS-123456
  🎫 [Checkout] OrderCode gerado/recuperado: LS-123456
  ✅ [Checkout] Validação completa com sucesso
  ✅ [Checkout] Purchase event tracked: { orderCode: 'LS-123456', total: XXX }
  ```

**Se falhar:**
- ❌ Capturar screenshot do console com erro
- ❌ Capturar screenshot da Network tab
- ❌ Enviar para investigação

---

### 2. Fluxo com Campos Opcionais Vazios

**Passo a passo:**
```
1. Acesse o site
2. Adicione 1 item ao carrinho
3. Preencha APENAS campos obrigatórios (sem observações)
4. Clique em "Concluir Agendamento"
```

**Resultado esperado:**
- ✅ Fluxo deve funcionar normalmente
- ✅ Redireciona para `/checkout`
- ✅ Página de confirmação exibe normalmente

---

### 3. Validação de Phone Tracking

**Passo a passo:**
```
1. Abra DevTools (F12)
2. Vá para aba "Network"
3. Filtre por "pixel" ou "track"
4. Complete um agendamento
5. Observe as requisições
```

**Resultado esperado:**
- ✅ Requisição para `/functions/v1/track-pixel-event` com status 200
- ✅ Payload deve incluir:
  ```json
  {
    "event_type": "Purchase",
    "order_id": "LS-XXXXXX",
    "value": XXX.XX,
    "contents": [...]
  }
  ```

---

### 4. Validação de OrderCode

**Verificar em 3 pontos:**

#### A. No Console durante criação
```javascript
// Deve aparecer:
✅ [Checkout] Agendamento criado com sucesso: <uuid> Order: LS-123456
```

#### B. Na página /checkout
```javascript
// Verificar elemento:
<p className="text-lg font-bold">#{orderCode}</p>
// Deve mostrar: #LS-123456 (não undefined)
```

#### C. No banco de dados
```sql
SELECT order_code, nome_cliente, valor_total 
FROM agendamentos 
ORDER BY created_at DESC 
LIMIT 5;
```
**Resultado esperado:**
- ✅ Coluna `order_code` preenchida com formato `LS-XXXXXX`
- ✅ NUNCA deve ser NULL ou vazio

---

### 5. Validação de Logs de Erro

**Console deve NÃO mostrar:**
- ❌ `Telefone inválido` (Zod validation error)
- ❌ `406 Not Acceptable` em `/rest/v1/leads_cupom`
- ❌ `Validação de bookingData falhou`
- ❌ Redirect silencioso para homepage após agendamento

**Console PODE mostrar (não-crítico):**
- ⚠️ `[Checkout] Erro ao buscar lead (não-crítico)`
- ⚠️ `[Checkout] Exceção ao atualizar lead (não-crítico, ignorado)`
- ⚠️ `[Checkout] Erro ao atualizar cupom (não-crítico)`

---

## 🐛 CENÁRIOS DE ERRO CONHECIDOS

### Erro 1: Validação Zod Rejeita Telefone
**Sintoma:**
```javascript
{
  validation: "regex",
  code: "invalid_string",
  message: "Telefone inválido",
  path: ["customerInfo", "phone"]
}
```

**Causa:** Phone normalizer não está funcionando

**Solução:**
- Verificar se `normalizePhone()` está sendo importado em `Agendamento.tsx`
- Verificar se `.transform(normalizePhone)` está no schema Zod

---

### Erro 2: Redirecionamento para Homepage
**Sintoma:** Cliente vê página inicial em vez de confirmação

**Causa:** Validação Zod está falhando e retornando `null`

**Solução:**
- Verificar se schema tem `.passthrough()`
- Verificar se campos `observacoes` e `timeSlot` estão no schema
- Verificar se validação usa `safeParse()` com fallback

---

### Erro 3: OrderCode Undefined
**Sintoma:** Página de confirmação mostra `#undefined`

**Causa:** OrderCode não está sendo gerado/passado corretamente

**Solução:**
- Verificar se trigger DB está ativo: `generate_order_code()`
- Verificar fallback em `Agendamento.tsx` linha 522-527
- Verificar fallback em `Checkout.tsx` linha 61-64

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Valor Esperado |
|---------|----------------|
| Taxa de conversão (agendamentos criados / tentativas) | ≥ 95% |
| Tempo até confirmação | < 3 segundos |
| Taxa de erro 406 em leads_cupom | 0% (silenciado) |
| Taxa de erro Zod | 0% |
| Taxa de redirecionamento indevido | 0% |
| OrderCode sempre presente | 100% |
| Purchase event rastreado | 100% |

---

## 🔍 FERRAMENTAS DE DEBUGGING

### 1. Console Logs
```javascript
// Filtrar por categoria:
[Checkout] // Eventos de checkout
[Agendamento] // Eventos de criação
🎫 // OrderCode events
✅ // Sucesso
❌ // Erro crítico
⚠️ // Warning não-crítico
```

### 2. Network Tab
```
Filtros úteis:
- "pixel" → Ver tracking events
- "agendamento" → Ver criação de agendamento
- "lead" → Ver atualização de leads
- "406" → Ver erros 406 (devem estar silenciados)
```

### 3. React DevTools
```
Componente: Checkout
Props: location.state.bookingData
- Verificar se customerInfo.phone está normalizado
- Verificar se observacoes está presente
- Verificar se orderCode existe
```

---

## 📞 SUPORTE

**Se encontrar problemas:**
1. Capturar screenshot do console (com todos os logs)
2. Capturar screenshot da Network tab
3. Anotar hora exata do erro
4. Enviar para análise com os seguintes dados:
   - Browser e versão
   - URL completa
   - Passos para reproduzir
   - Screenshots

---

**Status:** 🟢 Pronto para Validação  
**Tempo estimado:** 15-20 minutos  
**Prioridade:** 🔴 CRÍTICO
