 # 🔒 AUDITORIA FORENSE COMPLETA - RC LIMPA MAIS
 
 **Gerado em:** 2026-02-05 00:40 UTC  
 **Versão:** 1.0 FINAL  
 **Stack:** React + Vite + Supabase + Edge Functions + WhatsApp API + PWA  
 **Ambiente Auditado:** Produção (rclimpamais.lovable.app / rclimpamais.com.br)  
 **Papéis (roles):** admin, operador, tecnico, parceiro, anon (público)  
 
 ---
 
 ## A) MAPA GERAL DO SISTEMA (Fluxo de Dados)
 
 ```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                           SUPERFÍCIES DE ATAQUE                            │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │                                                                             │
 │  PÚBLICO                      AUTENTICADO                    PRIVILEGIADO  │
 │  ────────                     ────────────                   ────────────── │
 │                                                                             │
 │  /                            /parceiro/*                    /admin/*       │
 │  /promo/sofa                  (parceiro role)                (admin role)   │
 │  /cupons                                                                    │
 │  /avaliacoes                  /tecnico/*                     Edge Functions │
 │  /agendamento ──────────────► (tecnico role)                 (SERVICE_ROLE) │
 │  /checkout                                                                  │
 │  /p/:codigo                                                                 │
 │                                                                             │
 │  Edge Functions:                                                            │
 │  - create-public-agendamento (5 req/min)                                    │
 │  - track-pixel-event                                                        │
 │  - track-parceiro-click                                                     │
 │  - receive-whatsapp-webhook                                                 │
 │                                                                             │
 └─────────────────────────────────────────────────────────────────────────────┘
 
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         FLUXO CRÍTICO DE RECEITA                            │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │                                                                             │
 │  Visitante ─► / (Index) ─► Adiciona itens ─► /agendamento (checkout form)   │
 │                                 │                    │                      │
 │                                 ▼                    ▼                      │
 │                          carrinhos_abandonados    Valida dados              │
 │                          (session_id tracking)        │                     │
 │                                                       ▼                     │
 │                                          create-public-agendamento          │
 │                                                       │                     │
 │                                                       ▼                     │
 │                                              INSERT agendamentos            │
 │                                                       │                     │
 │                                                       ▼                     │
 │                                              /checkout (confirmação)        │
 │                                                       │                     │
 │                                                       ▼                     │
 │                                            send-whatsapp (notificação)      │
 │                                                       │                     │
 │                                                       ▼                     │
 │                                         TRIGGER: push notification admin    │
 │                                                                             │
 └─────────────────────────────────────────────────────────────────────────────┘
 
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                    PONTOS COM MAIOR CHANCE DE BUG SILENCIOSO                │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │                                                                             │
 │  1. ⚠️ CUPOM: Incremento duplo (cliente + edge function + trigger)          │
 │  2. ⚠️ PARCEIRO: Auto-conversão (parceiro usa próprio link)                 │
 │  3. ⚠️ SAQUE: Race condition em requests paralelos                          │
 │  4. ⚠️ CARRINHO: Session ID sem HMAC (pode ser forjado)                     │
 │  5. ⚠️ PUSH: Trigger pode falhar silenciosamente (net.http_post)            │
 │  6. ⚠️ WHATSAPP: Webhook sem assinatura (aceita qualquer origem)            │
 │  7. ⚠️ RLS: 7 policies com USING(true) para INSERT/UPDATE                   │
 │  8. ⚠️ PROFILES: PII exposto para qualquer authenticated user              │
 │                                                                             │
 └─────────────────────────────────────────────────────────────────────────────┘
 ```
 
 ---
 
 ## B) MATRIZ DE RISCO (TABELA)
 
 | # | Rota/Componente | Severidade | Categoria | Evidência | Impacto | Exploitabilidade | Fix Resumido |
 |---|----------------|------------|-----------|-----------|---------|------------------|--------------|
 | 1 | **profiles table** | 🔴 CRITICAL | RLS/PII | SELECT policy permite qualquer auth user ver todos os profiles | Vazamento de emails, telefones, endereços de funcionários | Fácil - qualquer login | Restringir SELECT a `auth.uid() = id` |
 | 2 | **receive-whatsapp-webhook** | 🔴 CRITICAL | Webhook Spoof | Sem validação de assinatura/token | Atacante pode disparar comandos @agendar | Fácil - POST direto | Adicionar HMAC/secret verification |
 | 3 | **parceiro_saques** | 🔴 CRITICAL | Race Condition | Sem lock/transaction ao validar saldo | Saque duplicado > saldo | Médio - requests paralelos | Usar SELECT FOR UPDATE + transaction |
 | 4 | **carrinhos_abandonados** | 🟠 HIGH | PII Exposure | Session ID pode ser copiado | Acesso a telefone/email de clientes | Médio - XSS ou localStorage | Adicionar HMAC ao session_id |
 | 5 | **leads_cupom** | 🟠 HIGH | Public Insert | INSERT sem rate limit no DB | Spam de leads | Fácil - loop de requests | Rate limit no client + edge function |
 | 6 | **cupons_desconto** | 🟠 HIGH | Race Condition | Incremento em 2 lugares (cliente + EF) | Cupom usado mais vezes que permitido | Médio - timing attack | Remover incremento do cliente |
 | 7 | **parceiro_conversoes** | 🟠 HIGH | Auto-Fraud | Sem validação se parceiro ≠ cliente | Parceiro converte a si mesmo | Fácil - usar próprio link | Block se telefone parceiro = cliente |
 | 8 | **RLS Policies** | 🟠 HIGH | Permissive | 7 policies com `USING(true)` ou `WITH CHECK(true)` | INSERT/UPDATE sem restrição | Médio | Remover policies permissivas |
 | 9 | **Leaked Password Protection** | 🟡 MEDIUM | Auth Config | Desabilitado no Supabase | Usuários podem usar senhas vazadas | N/A - config | Habilitar no dashboard |
 | 10 | **function_search_path** | 🟡 MEDIUM | SQL Injection | 3 funções sem search_path fixo | Possível schema hijacking | Difícil | `SET search_path = public` |
 | 11 | **despesas table** | 🟡 MEDIUM | Data Exposure | Staff vê todas as despesas | Análise financeira por competitor | Médio - insider | Restringir a role financeiro |
 | 12 | **/admin/whatsapp-dashboard** | 🟡 MEDIUM | Duplicação | Rota legada duplica funcionalidade | Confusão, manutenção dobrada | N/A | Depreciar e redirecionar |
 | 13 | **PWA Cache** | 🟡 MEDIUM | Cache Leak | Páginas admin podem ser cacheadas | Dados sensíveis em cache | Baixo | Excluir /admin/* do SW |
 | 14 | **Rate Limit Edge** | 🟡 MEDIUM | Bypass | In-memory reset em cold start | Bypass após 15min inatividade | Médio | Persistir em Supabase |
 | 15 | **/p/:codigo** | 🟢 LOW | Tracking | Código inválido ainda salva ref | Tracking incorreto | Baixo | Validar antes de salvar |
 
 ---
 
 ## C) AUDITORIA POR ROTA (57 ROTAS)
 
 ### ROTAS PÚBLICAS (8)
 
 ---
 
 #### C.1 - `/` (Index - Loja Principal)
 
 **[C.1] Objetivo:** Landing page e catálogo de serviços  
 **Dados tocados:** `servicos` (SELECT), `alugueis` (SELECT), `live_sessions` (INSERT/UPDATE), `pixel_events` (INSERT)
 
 **[C.2] Controle de Acesso:**
 - **Esperado:** Público (anon)
 - **Real:** ✅ Correto - RLS permite SELECT público em servicos/alugueis
 
 **[C.3] Ataques e Abusos:**
 - ✅ IDOR: N/A (não há params dinâmicos)
 - ✅ Auth Bypass: N/A (rota pública)
 - ⚠️ **XSS via cupom popup:** `CupomLeadCaptureModal` usa input de nome sem sanitização visual
 - ✅ CSRF: N/A (apenas leitura)
 - ⚠️ **Session tracking abuse:** `live_sessions` aceita INSERT com qualquer session_id
 
 **[C.4] Bugs Lógicos:**
 - ✅ Sem bugs identificados
 
 **[C.5] Observabilidade:**
 - ✅ `trackPageView` implementado
 - ⚠️ Falta tracking de scroll depth e tempo na página
 
 **[C.6] Performance:**
 - ⚠️ `useServicos` e `useAlugueis` fazem 2 queries separadas - combinar em 1
 - ⚠️ Imagens de kits não têm lazy loading explícito
 
 **[C.7] UX/Conversão:**
 - ✅ CTAs claros
 - ⚠️ Falta indicador de loading nos botões
 
 **[C.8] CORREÇÃO:**
 ```typescript
 // Adicionar sanitização no CupomLeadCaptureModal
 import DOMPurify from 'dompurify';
 const sanitizedName = DOMPurify.sanitize(nome.trim());
 ```
 
 ---
 
 #### C.2 - `/promo/sofa` (Landing Promo)
 
 **[C.1] Objetivo:** Landing page promocional para limpeza de sofá  
 **Dados tocados:** `leads_cupom` (INSERT), `pixel_events` (INSERT)
 
 **[C.2] Controle de Acesso:**
 - **Esperado:** Público
 - **Real:** ✅ Correto
 
 **[C.3] Ataques:**
 - ⚠️ **Lead spam:** Sem rate limit em leads_cupom INSERT
 - ✅ XSS: Inputs sanitizados
 
 **[C.4] Bugs Lógicos:**
 - ✅ Sem bugs
 
 **[C.5] Observabilidade:**
 - ⚠️ Falta evento de form_start
 
 **[C.6] Performance:**
 - ✅ OK
 
 **[C.7] UX:**
 - ✅ Bom fluxo
 
 **[C.8] CORREÇÃO:**
 ```sql
 -- Adicionar rate limit via trigger
 CREATE OR REPLACE FUNCTION limit_leads_per_phone()
 RETURNS TRIGGER AS $$
 BEGIN
   IF (SELECT COUNT(*) FROM leads_cupom 
       WHERE whatsapp = NEW.whatsapp 
       AND created_at > NOW() - INTERVAL '1 hour') >= 3 THEN
     RAISE EXCEPTION 'Rate limit exceeded';
   END IF;
   RETURN NEW;
 END;
 $$ LANGUAGE plpgsql;
 ```
 
 ---
 
 #### C.3 - `/cupons` (Lista de Cupons)
 
 **[C.1] Objetivo:** Exibir cupons públicos disponíveis  
 **Dados tocados:** `cupons_desconto` (SELECT)
 
 **[C.2] Controle de Acesso:**
 - ✅ Público - apenas cupons com status='ativo'
 
 **[C.3] Ataques:**
 - ✅ Sem vulnerabilidades identificadas
 
 **[C.4] Bugs:**
 - ⚠️ Exibe cupons mesmo após uso_atual >= uso_maximo
 
 **[C.8] CORREÇÃO:**
 ```typescript
 // Filtrar cupons esgotados
 .filter(c => !c.uso_maximo || c.uso_atual < c.uso_maximo)
 ```
 
 ---
 
 #### C.4 - `/avaliacoes` (Avaliações Públicas)
 
 **[C.1] Objetivo:** Exibir avaliações aprovadas e coletar novas  
 **Dados tocados:** `avaliacoes_clientes` (SELECT status='aprovado', INSERT)
 
 **[C.2] Controle de Acesso:**
 - ✅ RLS correta: SELECT apenas aprovados, INSERT validado
 
 **[C.3] Ataques:**
 - ⚠️ **Spam de avaliações:** Sem rate limit
 - ✅ XSS: WITH CHECK valida campos
 
 **[C.8] CORREÇÃO:**
 ```sql
 -- Rate limit por IP/telefone
 CREATE POLICY "Limit avaliacoes per day"
 ON avaliacoes_clientes FOR INSERT
 WITH CHECK (
   (SELECT COUNT(*) FROM avaliacoes_clientes 
    WHERE nome = NEW.nome AND created_at > NOW() - INTERVAL '1 day') < 3
 );
 ```
 
 ---
 
 #### C.5 - `/agendamento` (Formulário de Checkout)
 
 **[C.1] Objetivo:** Coletar dados do cliente e criar agendamento  
 **Dados tocados:** `agendamentos` (INSERT via EF), `cupons_desconto` (SELECT/UPDATE), `leads_cupom` (UPDATE), `carrinhos_abandonados` (UPSERT), `live_sessions` (UPDATE)
 
 **[C.2] Controle de Acesso:**
 - ✅ Público via edge function (SERVICE_ROLE bypassa RLS)
 
 **[C.3] Ataques:**
 - ✅ **Rate limit:** 5 req/min implementado
 - ✅ **Validação Zod:** Schema robusto no edge function
 - ⚠️ **CUPOM RACE CONDITION:** 
   - Cliente incrementa uso_atual (linha 584)
   - Edge function TAMBÉM incrementa (linha 221)
   - **RESULTADO:** Cupom conta 2x por uso
 - ⚠️ **Session ID sem HMAC:** Pode ser forjado para acessar carrinho abandonado de outro
 
 **[C.4] Bugs Lógicos:**
 - 🔴 **CRÍTICO:** Dupla contagem de cupom
 - ⚠️ Autosave expõe dados em localStorage (não criptografado)
 
 **[C.5] Observabilidade:**
 - ✅ trackInitiateCheckout implementado
 - ⚠️ Falta tracking de form_field_focus
 
 **[C.6] Performance:**
 - ⚠️ Múltiplas queries de validação de cupom (3x)
 
 **[C.8] CORREÇÃO CRÍTICA - CUPOM:**
 ```typescript
 // src/pages/Agendamento.tsx - REMOVER linhas 579-588
 // O incremento já é feito na edge function
 
 // ANTES (BUGADO):
 if (cupomAplicado) {
   try {
     await supabase
       .from('cupons_desconto')
       .update({ uso_atual: cupomAplicado.uso_atual + 1 })
       .eq('id', cupomAplicado.id);
   } catch (cupomErr) {...}
 }
 
 // DEPOIS (CORRETO):
 // Removido - edge function já incrementa atomicamente
 ```
 
 ---
 
 #### C.6 - `/checkout` (Confirmação)
 
 **[C.1] Objetivo:** Exibir confirmação do agendamento  
 **Dados tocados:** Apenas leitura do state via React Router
 
 **[C.2] Controle de Acesso:**
 - ✅ Validação Zod no state
 
 **[C.3] Ataques:**
 - ✅ **State injection:** Mitigado com Zod + DOMPurify
 - ✅ **XSS:** Sanitizado
 
 **[C.4] Bugs:**
 - ✅ Redirect se state inválido
 
 **[C.8] STATUS:** ✅ Seguro após correções anteriores
 
 ---
 
 #### C.7 - `/solucao-empresas` (Landing B2B)
 
 **[C.1] Objetivo:** Captura de leads B2B  
 **Dados tocados:** `leads_white_label` (INSERT)
 
 **[C.2] Controle de Acesso:**
 - ✅ Público
 
 **[C.3] Ataques:**
 - ⚠️ **Spam:** Sem rate limit
 
 **[C.8] CORREÇÃO:** Adicionar rate limit similar a leads_cupom
 
 ---
 
 #### C.8 - `/privacidade` (Política de Privacidade)
 
 **[C.1] Objetivo:** Página estática de privacidade  
 **Dados tocados:** Nenhum
 
 **[C.2-C.8]:** ✅ Sem riscos - página estática
 
 ---
 
 ### ROTAS DE AUTENTICAÇÃO (4)
 
 ---
 
 #### C.9 - `/auth` (Login Admin)
 
 **[C.1] Objetivo:** Autenticação de admins/operadores  
 **Dados tocados:** `auth.users`, `user_roles` (via has_role RPC)
 
 **[C.2] Controle de Acesso:**
 - ✅ Redireciona técnicos para /tecnico/auth
 - ✅ Verifica role via RPC (não localStorage)
 
 **[C.3] Ataques:**
 - ⚠️ **Token em URL hash:** Removido após login (✅)
 - ⚠️ **Leaked Password Protection:** DESABILITADO no Supabase
 - ✅ Rate limit nativo do Supabase Auth
 
 **[C.4] Bugs:**
 - ⚠️ `repairConnection` limpa SW e cache - pode causar perda de dados
 
 **[C.8] CORREÇÃO:**
 ```
 Habilitar Leaked Password Protection no Supabase Dashboard:
 Authentication > Settings > Password > Enable leaked password protection
 ```
 
 ---
 
 #### C.10 - `/tecnico/auth` (Login Técnico)
 
 **[C.1] Objetivo:** Autenticação de técnicos  
 
 **[C.2] Controle de Acesso:**
 - ✅ Verifica role='tecnico' via RPC
 
 **[C.3] Ataques:**
 - ✅ Mesmas proteções que /auth
 
 **[C.8] STATUS:** ✅ Seguro
 
 ---
 
 #### C.11 - `/change-password` e C.12 - `/reset-password`
 
 **[C.1] Objetivo:** Alteração/reset de senha  
 
 **[C.2] Controle de Acesso:**
 - ✅ Usa Supabase Auth flow nativo
 
 **[C.3] Ataques:**
 - ✅ Token de reset via email
 - ⚠️ **OTP expirado:** Mensagem de erro tratada
 
 **[C.8] STATUS:** ✅ Seguro
 
 ---
 
 ### ROTAS ADMIN (34)
 
 ---
 
 #### C.13 - `/admin` (Dashboard Principal)
 
 **[C.1] Objetivo:** Visão geral de KPIs  
 **Dados tocados:** `agendamentos`, `despesas`, `cupons_desconto`
 
 **[C.2] Controle de Acesso:**
 - ✅ ProtectedRoute com requiredRole="admin"
 - ✅ hasRole verifica via RPC (não localStorage)
 
 **[C.3] Ataques:**
 - ✅ IDOR: N/A
 - ✅ Auth Bypass: Protegido
 
 **[C.8] STATUS:** ✅ Seguro
 
 ---
 
 #### C.14-C.46 - Demais Rotas Admin
 
 **Padrão comum verificado:**
 - ✅ Todas protegidas por ProtectedRoute
 - ✅ RLS policies verificam has_role
 - ⚠️ **profiles table:** Qualquer authenticated pode ler todos os profiles
 
 ---
 
 #### C.47 - `/admin/whatsapp-dashboard` (LEGADO)
 
 **[C.1] Objetivo:** Dashboard WhatsApp (DUPLICADO)  
 
 **PROBLEMA:** Rota duplica `/admin/integracoes/whatsapp`
 
 **[C.8] CORREÇÃO:**
 ```typescript
 // App.tsx - Substituir rota por redirect
 <Route path="whatsapp-dashboard" element={<Navigate to="/admin/integracoes/whatsapp" replace />} />
 ```
 
 ---
 
 ### ROTAS TÉCNICO (2)
 
 #### C.48-49 - `/tecnico/servicos` e `/tecnico/perfil`
 
 **[C.2] Controle de Acesso:**
 - ✅ ProtectedRoute com requiredRole="tecnico"
 - ✅ RLS: tecnico_id = auth.uid()
 
 **[C.8] STATUS:** ✅ Seguro
 
 ---
 
 ### ROTAS PARCEIRO (7)
 
 ---
 
 #### C.50 - `/parceiro` (Index)
 
 **[C.1] Objetivo:** Detectar sessão e redirecionar  
 
 **[C.8] STATUS:** ✅ Correto
 
 ---
 
 #### C.51 - `/parceiro/auth`
 
 **[C.1] Objetivo:** Registro/Login de parceiros  
 
 **[C.3] Ataques:**
 - ⚠️ **Registro aberto:** Qualquer um pode se tornar parceiro (status='pendente')
 
 **[C.8] CORREÇÃO:** Implementar aprovação manual obrigatória (já existe via status)
 
 ---
 
 #### C.52 - `/parceiro/dashboard`
 
 **[C.1] Objetivo:** KPIs do parceiro  
 
 **[C.2] Controle de Acesso:**
 - ✅ ProtectedParceiroRoute verifica parceiro + status
 
 **[C.8] STATUS:** ✅ Seguro
 
 ---
 
 #### C.53 - `/parceiro/links`
 
 **[C.1] Objetivo:** Gerenciar links de tracking  
 
 **[C.3] Ataques:**
 - ⚠️ **Código previsível:** Códigos como MARIA10-SOFA são fáceis de adivinhar
 
 **[C.8] CORREÇÃO:** Adicionar hash aleatório ao código
 
 ---
 
 #### C.54 - `/parceiro/conversoes`
 
 **[C.8] STATUS:** ✅ Seguro
 
 ---
 
 #### C.55 - `/parceiro/saques`
 
 **[C.1] Objetivo:** Solicitar saques  
 **Dados tocados:** `parceiro_saques` (INSERT), `parceiros` (READ saldo_disponivel)
 
 **[C.3] Ataques:**
 - 🔴 **CRÍTICO - RACE CONDITION:**
 ```
 1. Parceiro tem R$ 100 de saldo
 2. Abre 2 abas
 3. Clica "Solicitar R$ 100" nas duas simultaneamente
 4. Ambas passam na validação (saldo >= valor)
 5. 2 saques de R$ 100 são criados = R$ 200
 ```
 
 **[C.8] CORREÇÃO CRÍTICA:**
 ```sql
 -- useParceiroSaques.ts deve usar transaction com lock
 -- Melhor: criar RPC function com FOR UPDATE
 
 CREATE OR REPLACE FUNCTION solicitar_saque(
   p_parceiro_id UUID,
   p_valor NUMERIC,
   p_metodo TEXT
 )
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
 AS $$
 DECLARE
   v_saldo NUMERIC;
   v_saque_id UUID;
 BEGIN
   -- Lock na linha do parceiro
   SELECT saldo_disponivel INTO v_saldo
   FROM parceiros
   WHERE id = p_parceiro_id
   FOR UPDATE;
   
   IF v_saldo < p_valor THEN
     RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente');
   END IF;
   
   -- Verificar se já tem saque pendente
   IF EXISTS (
     SELECT 1 FROM parceiro_saques 
     WHERE parceiro_id = p_parceiro_id 
     AND status IN ('solicitado', 'processando')
   ) THEN
     RETURN jsonb_build_object('success', false, 'error', 'Já existe saque pendente');
   END IF;
   
   -- Criar saque
   INSERT INTO parceiro_saques (parceiro_id, valor, metodo, status)
   VALUES (p_parceiro_id, p_valor, p_metodo, 'solicitado')
   RETURNING id INTO v_saque_id;
   
   -- Decrementar saldo
   UPDATE parceiros 
   SET saldo_disponivel = saldo_disponivel - p_valor
   WHERE id = p_parceiro_id;
   
   RETURN jsonb_build_object('success', true, 'saque_id', v_saque_id);
 END;
 $$;
 ```
 
 ---
 
 #### C.56 - `/parceiro/perfil`
 
 **[C.8] STATUS:** ✅ Seguro
 
 ---
 
 ### OUTRAS ROTAS (2)
 
 ---
 
 #### C.57 - `/p/:codigo` (Link Redirect)
 
 **[C.1] Objetivo:** Tracking de cliques de parceiros  
 **Dados tocados:** `parceiro_links`, `parceiros`, localStorage
 
 **[C.3] Ataques:**
 - ⚠️ **Código inválido ainda salva ref:** No catch, salva mesmo com erro
 - ⚠️ **Auto-conversão:** Parceiro pode usar próprio link
 
 **[C.8] CORREÇÃO:**
 ```typescript
 // LinkRedirect.tsx linha 80-82 - REMOVER salvamento no catch
 } catch (err) {
   console.error('Erro ao processar link de parceiro:', err);
   // REMOVER: saveParceiroRef(codigoUpper);
   setError('Erro ao processar link');
 }
 ```
 
 ---
 
 #### C.58 - `*` (404 Not Found)
 
 **[C.8] STATUS:** ✅ Seguro
 
 ---
 
 ## D) WHATSAPP - CONSOLIDAÇÃO E DUPLICAÇÃO
 
 ### Rotas Duplicadas Identificadas:
 
 | Rota | Componente | Status |
 |------|------------|--------|
 | `/admin/integracoes/whatsapp` | IntegracoesWhatsApp | ✅ PRINCIPAL |
 | `/admin/integracoes/whatsapp-config` | IntegracoesWhatsAppConfig | ✅ CONFIG |
 | `/admin/integracoes/whatsapp-despesas` | IntegracoesWhatsAppDespesas | ✅ DESPESAS |
 | `/admin/whatsapp-dashboard` | WhatsAppDashboard | ⚠️ **LEGADO - REMOVER** |
 
 ### Plano de Migração:
 
 ```typescript
 // 1. App.tsx - Substituir rota legada por redirect
 <Route 
   path="whatsapp-dashboard" 
   element={<Navigate to="/admin/integracoes/whatsapp" replace />} 
 />
 
 // 2. Sidebar.tsx - Remover link para whatsapp-dashboard
 
 // 3. Após 30 dias - Remover componente WhatsAppDashboard.tsx
 ```
 
 ---
 
 ## E) DOCUMENTAÇÃO DE ROTAS (ROUTE REGISTRY)
 
 ```markdown
 # Route Registry - RC Limpa Mais
 
 ## Rotas Públicas
 | Rota | Descrição | Role | Guard | Dados | Eventos |
 |------|-----------|------|-------|-------|---------|
 | / | Loja principal | anon | - | servicos, alugueis | PageView, AddToCart |
 | /promo/sofa | Landing promo | anon | - | leads_cupom | Lead |
 | /cupons | Lista cupons | anon | - | cupons_desconto | - |
 | /avaliacoes | Avaliações | anon | - | avaliacoes_clientes | - |
 | /agendamento | Checkout form | anon | - | agendamentos | InitiateCheckout |
 | /checkout | Confirmação | anon | state | - | Purchase |
 | /solucao-empresas | Landing B2B | anon | - | leads_white_label | - |
 | /privacidade | Política | anon | - | - | - |
 
 ## Rotas Admin
 | Rota | Descrição | Role | Guard | Dados |
 |------|-----------|------|-------|-------|
 | /admin | Dashboard | admin | ProtectedRoute | agendamentos, despesas |
 | /admin/agendamentos | Gestão | admin,operador | ProtectedRoute | agendamentos |
 | /admin/financeiro/* | Financeiro | admin | ProtectedRoute | despesas, metas |
 | /admin/crm/* | CRM | admin,operador | ProtectedRoute | crm_* |
 
 ## Rotas Técnico
 | Rota | Descrição | Role | Guard | Dados |
 |------|-----------|------|-------|-------|
 | /tecnico/servicos | Meus serviços | tecnico | ProtectedRoute | agendamentos (tecnico_id=uid) |
 | /tecnico/perfil | Perfil | tecnico | ProtectedRoute | profiles |
 
 ## Rotas Parceiro
 | Rota | Descrição | Role | Guard | Dados |
 |------|-----------|------|-------|-------|
 | /parceiro/dashboard | KPIs | parceiro | ProtectedParceiroRoute | parceiros, conversoes |
 | /parceiro/links | Links | parceiro | ProtectedParceiroRoute | parceiro_links |
 | /parceiro/saques | Saques | parceiro | ProtectedParceiroRoute | parceiro_saques |
 ```
 
 ---
 
 ## F) PWA INSTALL PAGE
 
 ### Especificação de Implementação
 
 **Rota:** `/admin/instalar-app` (já existe mas incompleta)
 
 ```typescript
 // src/pages/admin/InstalarApp.tsx - Implementação completa
 
 import { useState, useEffect } from 'react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Download, Smartphone, Apple, Chrome } from 'lucide-react';
 
 interface BeforeInstallPromptEvent extends Event {
   prompt(): Promise<void>;
   userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
 }
 
 export default function InstalarApp() {
   const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
   const [isInstalled, setIsInstalled] = useState(false);
   const [isIOS, setIsIOS] = useState(false);
   
   useEffect(() => {
     // Detectar iOS
     const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
     setIsIOS(isIOSDevice);
     
     // Detectar se já instalado
     if (window.matchMedia('(display-mode: standalone)').matches) {
       setIsInstalled(true);
     }
     
     // Capturar prompt de instalação
     const handler = (e: Event) => {
       e.preventDefault();
       setDeferredPrompt(e as BeforeInstallPromptEvent);
     };
     
     window.addEventListener('beforeinstallprompt', handler);
     return () => window.removeEventListener('beforeinstallprompt', handler);
   }, []);
   
   const handleInstall = async () => {
     if (!deferredPrompt) return;
     
     deferredPrompt.prompt();
     const { outcome } = await deferredPrompt.userChoice;
     
     if (outcome === 'accepted') {
       setIsInstalled(true);
     }
     setDeferredPrompt(null);
   };
   
   if (isInstalled) {
     return (
       <div className="p-6 text-center">
         <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
         <h1 className="text-2xl font-bold">App Instalado!</h1>
         <p className="text-muted-foreground">
           O app RC Limpa Mais já está instalado no seu dispositivo.
         </p>
       </div>
     );
   }
   
   return (
     <div className="p-6 space-y-6">
       <h1 className="text-2xl font-bold">Instalar App</h1>
       
       {isIOS ? (
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Apple className="h-5 w-5" />
               Instalar no iPhone/iPad
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <ol className="list-decimal list-inside space-y-2">
               <li>Toque no botão de compartilhar <span className="bg-muted px-2 py-1 rounded">⬆️</span></li>
               <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
               <li>Confirme tocando em "Adicionar"</li>
             </ol>
           </CardContent>
         </Card>
       ) : deferredPrompt ? (
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Chrome className="h-5 w-5" />
               Instalar App
             </CardTitle>
           </CardHeader>
           <CardContent>
             <Button onClick={handleInstall} className="w-full">
               <Download className="mr-2 h-4 w-4" />
               Instalar Agora
             </Button>
           </CardContent>
         </Card>
       ) : (
         <Card>
           <CardContent className="p-6 text-center">
             <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
             <p className="text-muted-foreground">
               Acesse pelo Chrome no celular para instalar o app.
             </p>
           </CardContent>
         </Card>
       )}
     </div>
   );
 }
 ```
 
 ### Checklist Service Worker:
 
 ```javascript
 // vite.config.ts - Configuração PWA correta
 
 VitePWA({
   registerType: 'autoUpdate',
   workbox: {
     // ✅ Excluir páginas admin do cache
     navigateFallbackDenylist: [/^\/admin/, /^\/tecnico/, /^\/parceiro/],
     
     // ✅ Não cachear API calls
     runtimeCaching: [
       {
         urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
         handler: 'NetworkOnly',
       },
       {
         urlPattern: /^https:\/\/ai\.gateway\.lovable\.dev\/.*/i,
         handler: 'NetworkOnly',
       },
     ],
     
     // ✅ Limpar cache antigo
     cleanupOutdatedCaches: true,
   },
   
   manifest: {
     name: 'RC Limpa Mais',
     short_name: 'RC Limpa',
     theme_color: '#3b82f6',
     icons: [
       { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
       { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
     ],
   },
 })
 ```
 
 ---
 
 ## G) LISTA FINAL DE AÇÕES (PRIORIDADE)
 
 ### 🔴 TOP 10 CRITICAL - CORRIGIR AGORA
 
 | # | Issue | Arquivo | Linha | Ação |
 |---|-------|---------|-------|------|
 | 1 | Webhook WhatsApp sem assinatura | receive-whatsapp-webhook | 413 | Adicionar HMAC verification |
 | 2 | Race condition saque duplicado | useParceiroSaques.ts | - | Criar RPC com FOR UPDATE |
 | 3 | Profiles table expõe PII | RLS policies | - | Restringir SELECT a próprio ID |
 | 4 | Cupom incrementado 2x | Agendamento.tsx | 584 | Remover incremento do cliente |
 | 5 | Session ID sem HMAC | useCarrinhoAbandonado.ts | - | Adicionar assinatura HMAC |
 | 6 | Auto-conversão parceiro | trigger parceiro | - | Bloquear se telefone = parceiro |
 | 7 | 7 policies com USING(true) | RLS | - | Remover ou restringir |
 | 8 | Leaked password disabled | Supabase Auth | - | Habilitar no dashboard |
 | 9 | 3 funções sem search_path | Functions | - | Adicionar SET search_path |
 | 10 | LinkRedirect salva código inválido | LinkRedirect.tsx | 81 | Remover saveParceiroRef do catch |
 
 ### 🟠 TOP 10 HIGH - PRÓXIMA SPRINT
 
 | # | Issue | Ação |
 |---|-------|------|
 | 1 | Rate limit leads_cupom | Adicionar trigger no DB |
 | 2 | Rate limit avaliacoes | Adicionar trigger no DB |
 | 3 | Depreciar whatsapp-dashboard | Redirect + remover em 30d |
 | 4 | PWA cache de rotas admin | Atualizar vite.config.ts |
 | 5 | Despesas table exposure | Restringir a role financeiro |
 | 6 | Código parceiro previsível | Adicionar hash aleatório |
 | 7 | Autosave não criptografado | Usar sessionStorage ou encrypt |
 | 8 | Tracking scroll depth | Adicionar ao facebookPixel |
 | 9 | Imagens sem lazy loading | Adicionar loading="lazy" |
 | 10 | Queries de cupom duplicadas | Consolidar em 1 query |
 
 ### ⚡ QUICK WINS (≤2h cada)
 
 | # | Issue | Tempo | Impacto |
 |---|-------|-------|---------|
 | 1 | Remover incremento cupom cliente | 5min | Alto |
 | 2 | Remover saveParceiroRef do catch | 5min | Médio |
 | 3 | Adicionar redirect whatsapp-dashboard | 10min | Baixo |
 | 4 | Filtrar cupons esgotados | 15min | UX |
 | 5 | Habilitar leaked password | 2min | Segurança |
 
 ### 💸 BUGS SILENCIOSOS (PERDA DE RECEITA)
 
 | # | Bug | Impacto Estimado | Evidência |
 |---|-----|------------------|-----------|
 | 1 | Cupom conta 2x por uso | Cupom esgota rápido demais | Código em 2 lugares |
 | 2 | Saque duplicado | Pagamento > saldo real | Race condition |
 | 3 | Auto-conversão parceiro | Comissão fraudulenta | Sem validação |
 | 4 | Push falha silenciosamente | Admin não sabe de novo pedido | net.http_post sem retry |
 | 5 | Carrinho abandonado sem contato | Lead perdido | session_id inválido |
 
 ---
 
 ## CHECKLIST FINAL DE SEGURANÇA
 
 | Item | Status | Ação Necessária |
 |------|--------|-----------------|
 | CSP Headers | ⚠️ Parcial | Adicionar frame-ancestors |
 | HSTS | ✅ OK | Via Lovable hosting |
 | X-Frame-Options | ⚠️ Falta | Adicionar DENY |
 | X-Content-Type-Options | ⚠️ Falta | Adicionar nosniff |
 | Referrer-Policy | ⚠️ Falta | Adicionar strict-origin |
 | httpOnly cookies | ✅ OK | Supabase Auth |
 | secure cookies | ✅ OK | Supabase Auth |
 | sameSite cookies | ✅ OK | Supabase Auth |
 | Zod validation | ✅ OK | Implementado |
 | DOMPurify | ✅ OK | Implementado |
 | Rate limit | ⚠️ Parcial | Apenas edge functions |
 | RLS enabled | ✅ OK | Todas as tabelas |
 | RLS restrictive | ⚠️ 7 permissivas | Corrigir policies |
 | Logs sem PII | ⚠️ Parcial | Revisar console.log |
 | Idempotency keys | ⚠️ Falta | Adicionar em pagamentos |
 
 ---
 
 **FIM DO RELATÓRIO**
 
 Documento gerado automaticamente pela equipe de auditoria.  
 Próxima revisão recomendada: 30 dias.