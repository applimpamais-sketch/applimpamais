# Auditoria RC vs SaaS

## Resumo executivo

A base atual do `applimpamais` já tem fundação relevante de SaaS:

- contexto de tenant no frontend
- tabelas e tipos com `tenant_id`
- superfícies de super-admin
- módulos, limites e subscriptions
- branding por tenant em partes da aplicação

O bloqueio principal não é "falta de arquitetura". O bloqueio é a convivência de três camadas ao mesmo tempo:

1. regras legadas da RC
2. SaaS multi-tenant parcial
3. fluxos públicos e administrativos ainda mono-tenant ou permissivos

Hoje a aplicação está mais próxima de `plataforma da RC com recursos SaaS` do que de `produto SaaS neutro`.

## Veredito

### O que já está pronto para SaaS

- Estrutura de tenant no frontend em [src/hooks/useTenantContext.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/hooks/useTenantContext.ts:47)
- Módulos e limites por tenant em [src/hooks/useTenantModules.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/hooks/useTenantModules.ts:30) e [src/hooks/useTenantLimits.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/hooks/useTenantLimits.ts:41)
- Super-admin e gestão de tenants em [src/pages/super-admin/Tenants.tsx](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/pages/super-admin/Tenants.tsx:1) e [src/hooks/useTenants.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/hooks/useTenants.ts:65)
- Convenções de query por tenant em [src/hooks/useSecureQuery.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/hooks/useSecureQuery.ts:1)
- White-label parcial em [src/hooks/useStoreCustomization.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/hooks/useStoreCustomization.ts:14)
- Base do banco com `saas_tenants`, `tenant_modulos`, `saas_subscriptions` e dezenas de tabelas tenantizadas em [src/integrations/supabase/types.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/integrations/supabase/types.ts:3743)

### O que ainda está preso à RC

#### 1. Identidade e branding

- Tenant master e fallback hardcoded em [src/constants/tenant.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/constants/tenant.ts:6)
- Domínio master e login branding da RC em [src/hooks/useLoginBranding.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/hooks/useLoginBranding.ts:12)
- Domínio estático em [src/lib/constants.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/lib/constants.ts:11) e [supabase/functions/_shared/siteConfig.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/supabase/functions/_shared/siteConfig.ts:8)
- Assets, logos e alt texts RC espalhados em `src/components`, `src/pages` e `public`
- Conteúdo institucional e PDFs com nome da RC em `src/utils/pdfTemplates`, `src/utils/adminManualContent.ts` e `public/exports`

#### 2. Fluxo público mono-tenant

- Agendamento público escolhe "o primeiro tenant ativo" em [supabase/functions/create-public-agendamento/index.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/supabase/functions/create-public-agendamento/index.ts:141)
- Hooks e páginas públicas ainda assumem tenant operacional da RC, como em [src/hooks/useCalendarioDisponibilidade.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/hooks/useCalendarioDisponibilidade.ts:9)
- Catálogo, landing pages, avaliações, guias e materiais ainda carregam copy e links da RC

#### 3. Segurança e autorização

- Muitas Edge Functions com `verify_jwt = false` em [supabase/config.toml](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/supabase/config.toml:1)
- `ProtectedRoute` libera acesso se houver `tenant_id` ou role válida em [src/components/admin/ProtectedRoute.tsx](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/components/admin/ProtectedRoute.tsx:106)
- `useAuth` ainda usa `rpc('has_role')` global em [src/hooks/useAuth.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/hooks/useAuth.ts:90)
- `create-team-member` cria usuário e role sem validar tenant do chamador em [supabase/functions/create-team-member/index.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/supabase/functions/create-team-member/index.ts:31)

#### 4. Regras operacionais da RC infiltradas no produto

- Tracking, parceiro, técnico e admin ainda têm caminhos especiais para "tenant master RC"
- Integrações e notificações usam telefone, e-mail e assinatura RC em vários pontos
- Migrations legadas criam e consolidam tenant RC como base operacional

## Classificação por grupo

### Grupo A: reaproveitar quase como está

- dashboard/admin base
- financeiro
- equipe
- técnicos
- orçamentos
- notas fiscais
- cupons
- tenant modules e limits
- super-admin

### Grupo B: reaproveitar com refatoração obrigatória

- autenticação e autorização
- login branding
- tracking
- parceiro
- onboarding
- catálogo público
- checkout/agendamento público
- integrações WhatsApp, push, pixel e UTMify
- templates PDF e e-mails

### Grupo C: manter fora do core SaaS por enquanto

- materiais estáticos da RC em `public/exports`
- guias/ebooks da RC
- campanhas e copies comerciais da RC
- fluxos altamente específicos de operação/marketing interno

## Riscos que impedem venda imediata

### Críticos

- Funções administrativas expostas sem JWT
- Fluxo público criando registros sem resolver tenant corretamente
- Autorização frouxa no admin
- Dependência explícita de tenant master/fallback

### Altos

- Branding RC visível em páginas e e-mails
- Domínios e URLs estáticos antigos
- Conteúdo institucional e legal apontando para RC
- Setup local e deploy ainda conectados ao projeto Supabase legado

### Médios

- Rotas muito concentradas em [src/App.tsx](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/App.tsx:1)
- Módulos demais expostos ao mesmo tempo para um produto inicial
- Muito conteúdo promocional dentro do app principal

## Primeira lista de corte

Esses itens devem sair do núcleo SaaS ou ser neutralizados cedo:

- `RC_LIMPA_MAIS_TENANT_ID`
- `MASTER_TENANT_FALLBACK_ID`
- `MASTER_TENANT_NAME`
- logos `logo-rc-*`
- domínios `rclimpamais.com.br` e `rclimpamais.lovable.app`
- e-mails `@rclimpamais.com.br`
- telefone padrão RC
- páginas promocionais e guias da RC como parte do produto principal

## Conclusão

O projeto é convertível e vale a pena evoluir. A decisão correta agora não é reescrever tudo, e sim:

1. neutralizar a base
2. endurecer segurança
3. consolidar multi-tenant real
4. só depois polir o produto e o white-label

Sem isso, a plataforma continua forte como sistema interno, mas frágil como SaaS comercial.
