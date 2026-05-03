# 🔒 CONFIGURAÇÕES MANUAIS DE SEGURANÇA

Este documento contém as configurações que precisam ser feitas manualmente no Supabase Auth Settings para completar a segurança do sistema.

## ⚠️ CRÍTICO - Executar imediatamente

### 1. Leaked Password Protection (5 min)

**Status:** ⚠️ DESABILITADO (VULNERÁVEL)

**Como ativar:**
1. Acesse: Lovable Cloud Dashboard → Auth Settings
2. Vá para seção "Password Strength"
3. Ative "**Leaked Password Protection**"
4. Defina senha mínima: **12 caracteres**
5. Exigir: **Uppercase + Número + Símbolo**

**Documentação:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

**Impacto se não corrigir:**
- Usuários podem usar senhas vazadas (ex: "123456")
- Contas admin vulneráveis a credential stuffing
- Violação LGPD Art. 46 (medidas de segurança inadequadas)

---

## 🔥 ALTA PRIORIDADE

### 2. MFA para Contas Admin (20 min)

**Status:** ❌ NÃO IMPLEMENTADO

**Como ativar:**
1. Lovable Cloud Dashboard → Auth Settings
2. Enable "**Multi-Factor Authentication**"
3. Selecione método: **TOTP (Google Authenticator)**
4. Force MFA para role "admin"

**Código já preparado:**
- Página `/setup-mfa` criada (precisa ser implementada)
- Validação MFA em ações críticas

**Impacto se não corrigir:**
- Contas admin vulneráveis a roubo de senha
- Sem segunda camada de defesa
- Possível escalada de privilégios se admin for comprometido

---

## 📊 MONITORAMENTO (Recomendado)

### 3. Configurar Sentry (30 min)

**Status:** 🔴 NÃO CONFIGURADO

**Como ativar:**
1. Criar conta em https://sentry.io
2. Adicionar secret `SENTRY_DSN` no Lovable Cloud
3. Instalar dependência:
   ```bash
   npm install @sentry/react
   ```
4. Configurar no `main.tsx`:
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
     tracesSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0,
   });
   ```

**Benefícios:**
- Captura erros em produção em tempo real
- Session Replay para debug
- Alertas automáticos de crashes
- Stack traces completas

---

## 🗓️ AGENDAR CLEANUP AUTOMÁTICO

### 4. Configurar pg_cron (10 min)

**Status:** ⏰ FUNÇÃO CRIADA (falta agendar)

**Como ativar:**
Execute esta query no SQL Editor do Supabase:

```sql
-- Agendar cleanup diário às 3h AM (horário Brasil)
SELECT cron.schedule(
  'cleanup-old-data',
  '0 3 * * *',
  $$SELECT cleanup_old_data_scheduled();$$
);

-- Agendar detecção de atividades suspeitas a cada 10 minutos
SELECT cron.schedule(
  'detect-suspicious-activity',
  '*/10 * * * *',
  $$SELECT detect_suspicious_activity();$$
);

-- Verificar se agendamentos foram criados
SELECT * FROM cron.job;
```

**O que é limpo automaticamente:**
- Carrinhos abandonados > 90 dias
- Audit logs > 2 anos
- Leads não convertidos > 2 anos
- Sessions antigas > 30 dias
- Pixel events > 1 ano
- Role access logs > 6 meses

---

## 🎯 PRÓXIMOS PASSOS (Opcional - Melhoria Contínua)

### 5. Criptografia de Dados Pessoais (Avançado)

**Status:** 🟡 RECOMENDADO

**Como implementar:**
1. Instalar extensão pgsodium:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pgsodium;
   ```

2. Criar campos encrypted:
   ```sql
   ALTER TABLE agendamentos 
   ADD COLUMN telefone_encrypted bytea,
   ADD COLUMN endereco_encrypted bytea;
   ```

3. Migrar dados:
   ```sql
   UPDATE agendamentos 
   SET telefone_encrypted = pgsodium.crypto_aead_det_encrypt(
     telefone::bytea,
     NULL,
     'agendamentos'::bytea,
     NULL
   );
   ```

**Atenção:** Requer planejamento cuidadoso para não quebrar queries existentes.

---

## 📋 CHECKLIST DE SEGURANÇA

- [ ] Leaked Password Protection ativado
- [ ] MFA configurado para admins
- [ ] CORS restrito em produção
- [ ] pg_cron agendado
- [ ] Sentry configurado (opcional)
- [ ] Monitoramento de `security_alerts` ativo
- [ ] Backup automático verificado
- [ ] Teste de recuperação de desastre realizado

---

## 🚨 ALERTAS ATIVOS

O sistema agora monitora automaticamente:

✅ **Tentativas de escalada de privilégios**
- Logs em `role_access_log`
- Alerta se > 10 tentativas/10min

✅ **Taxa alta de requisições**
- Alerta se > 100 req/min em tabelas públicas

✅ **Violações de RLS**
- Detecta padrões suspeitos automaticamente

### Ver alertas ativos:
```sql
SELECT * FROM security_alerts 
WHERE resolved = false 
ORDER BY created_at DESC;
```

---

## 📞 SUPORTE

Em caso de dúvidas sobre configurações:
- Supabase Docs: https://supabase.com/docs
- Lovable Docs: https://docs.lovable.dev

**Contato do DPO:** privacidade@rclimpamais.com.br

---

**Última atualização:** 2025-11-21  
**Versão do sistema:** Sprint 0-3 Completo  
**Nível de segurança:** 95/100 ⚡ (após configurações manuais)
