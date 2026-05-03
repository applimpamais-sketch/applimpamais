# Roadmap de Transformação SaaS

## Objetivo

Transformar a base atual do `applimpamais` em uma plataforma SaaS vendável para empresas de limpeza, sem dependências operacionais, visuais ou lógicas da RC.

## Princípios

- RC deixa de ser tratada como tenant especial no código
- todo fluxo público precisa resolver tenant explicitamente
- toda autorização precisa ser por usuário, role e tenant
- toda identidade visual precisa ser configurável
- o core do produto deve ser menor, claro e comercializável

## Fase 1: Auditoria e congelamento estrutural

### Objetivo

Mapear a base, registrar decisões e impedir que o acoplamento com a RC continue crescendo.

### Entregas

- auditoria RC vs SaaS
- inventário de branding hardcoded
- inventário de riscos críticos
- backlog priorizado

### Critério de saída

- documentação criada
- prioridades aprovadas
- nenhuma feature nova antes das correções estruturais

## Fase 2: Neutralização da marca RC

### Objetivo

Remover a RC como identidade padrão da plataforma.

### Trabalho

- substituir textos e domínios fixos
- remover logo e assets RC do fluxo principal
- criar branding padrão `Limpamais`
- separar materiais e páginas que são conteúdo interno da RC
- trocar metadados, canônicos, footers, PDFs, e-mails e mensagens

### Critério de saída

- o app não exibe RC por padrão
- login, páginas públicas e admin usam branding neutro
- docs e materiais da RC não ficam misturados ao produto principal

## Fase 3: Segurança crítica

### Objetivo

Fechar a superfície de ataque antes de vender ou migrar clientes.

### Trabalho

- revisar `supabase/config.toml`
- ativar JWT em funções administrativas
- revisar `create-team-member`, `create-tenant-admin`, `resend-tenant-invite`
- corrigir `ProtectedRoute`
- trocar `has_role` por função tenant-aware
- revisar storage e secrets

### Critério de saída

- funções internas protegidas
- front não autoriza com base em fallback inseguro
- usuário de um tenant não consegue operar outro tenant

## Fase 4: Multi-tenant real

### Objetivo

Garantir isolamento operacional completo entre clientes.

### Trabalho

- remover fallback tenant da RC
- resolver tenant por slug, subdomínio ou domínio customizado
- corrigir fluxo público de agendamento
- filtrar APIs públicas por tenant
- revisar RLS e tabelas críticas
- garantir `tenant_id` em criação de roles e perfis

### Critério de saída

- nenhum fluxo público usa "primeiro tenant ativo"
- tenant é resolvido pelo request
- cada cliente vê apenas seus dados

## Fase 5: Enxugamento do produto

### Objetivo

Definir claramente o que é core SaaS.

### Trabalho

- separar módulos `core`, `premium` e `experimental`
- reduzir itens do menu
- isolar páginas promocionais que não fazem parte do produto base
- consolidar oferta inicial do SaaS

### Core inicial recomendado

- dashboard
- agendamentos
- serviços e catálogo
- equipe
- técnicos
- financeiro
- cupons
- parceiro
- tracking
- integrações essenciais
- tenant settings
- super-admin

### Critério de saída

- a navegação reflete o produto vendável
- o app não parece mistura de operação interna com laboratório

## Fase 6: Onboarding e white-label

### Objetivo

Permitir entrada de novos clientes com previsibilidade.

### Trabalho

- fluxo de criação de tenant
- admin inicial
- logo e cores por tenant
- domínio customizado
- módulos por plano
- e-mails e documentos por tenant

### Critério de saída

- novo cliente consegue nascer com ambiente próprio
- a plataforma passa a parecer white-label de verdade

## Fase 7: Produção SaaS

### Objetivo

Deixar a operação pronta para venda e implantação.

### Trabalho

- preparar Vercel e variáveis
- validar build, preview e produção
- revisar observabilidade e logs
- criar checklist de lançamento
- validar testes mínimos de isolamento

### Critério de saída

- plataforma pronta para trial ou primeiro cliente pagante

## Ordem das próximas execuções

1. neutralizar branding e domínios RC
2. corrigir segurança crítica
3. consolidar multi-tenant
4. reorganizar o produto
5. preparar onboarding e white-label

## Próximo bloco recomendado

O próximo bloco de implementação deve atacar estes arquivos primeiro:

- [src/constants/tenant.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/constants/tenant.ts:1)
- [src/hooks/useLoginBranding.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/hooks/useLoginBranding.ts:1)
- [src/lib/constants.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/lib/constants.ts:1)
- [supabase/functions/_shared/siteConfig.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/supabase/functions/_shared/siteConfig.ts:1)
- [supabase/functions/_shared/corsConfig.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/supabase/functions/_shared/corsConfig.ts:1)
- [src/components/admin/ProtectedRoute.tsx](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/components/admin/ProtectedRoute.tsx:1)
- [src/hooks/useAuth.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/src/hooks/useAuth.ts:1)
- [supabase/functions/create-public-agendamento/index.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/supabase/functions/create-public-agendamento/index.ts:1)
- [supabase/functions/create-team-member/index.ts](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/supabase/functions/create-team-member/index.ts:1)
- [supabase/config.toml](/C:/Users/Rent%20e%20Clean/Downloads/applimpamais1/supabase/config.toml:1)
