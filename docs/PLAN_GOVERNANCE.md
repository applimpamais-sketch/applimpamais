# Governança de Planos Enterprise

## Arquitetura Implementada

### 1. RPC Centralizada `can_use_feature()`

Função única que valida TUDO:
- Plano do tenant
- Status do tenant (ativo/trial/suspenso)
- Feature flags específicos
- Expiração de promoções

```sql
SELECT can_use_feature('whatsapp_bot');
-- Retorna: { allowed: true, reason: 'PLAN_FEATURE', message: '...' }
```

### 2. Tabela `tenant_features`

Feature flags por tenant para:
- Liberar beta
- Promoções temporárias
- Vendas de addons
- Trials de funcionalidades

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| tenant_id | UUID | FK para tenant |
| feature_key | TEXT | Chave da feature |
| enabled | BOOLEAN | Se está ativo |
| expires_at | TIMESTAMPTZ | Expiração (NULL = permanente) |
| reason | TEXT | 'beta', 'promo', 'addon' |

### 3. Tabela `tenant_usage_metrics`

Contadores oficiais centralizados:
- Técnicos ativos
- Agendamentos do mês
- Cupons ativos
- Funcionários do bot
- Membros do dashboard

Atualizado via `refresh_tenant_usage_metrics(tenant_id)`.

### 4. RPC `check_resource_limit()`

Valida limites com bloqueio automático:

```sql
SELECT check_resource_limit('funcionarios_bot', NULL, 1);
-- Retorna: { allowed: false, reason: 'LIMIT_EXCEEDED', current: 5, limit: 5 }
```

### 5. Suporte a Franquias

Novos campos em `saas_tenants`:
- `parent_tenant_id`: FK para tenant pai
- `franquia_tipo`: 'master' | 'filial' | 'independente'

Funções:
- `is_franqueador(tenant_id)`: Verifica se tem filiais
- `get_tenant_filiais(tenant_id)`: Lista filiais

### 6. Log de Atividades

Tabela `tenant_activity_log` registra toda ação importante:

```sql
SELECT log_tenant_action('criar_agendamento', 'agendamento', 'uuid', '{"valor": 150}');
```

## Hooks Frontend

### useFeatureAccess

```tsx
const { hasAccess, needsUpgrade, isLoading } = useFeatureAccess('whatsapp_bot');
```

### useResourceLimit

```tsx
const { canAdd, usageText, usagePercent, isAtLimit } = useResourceLimit('tecnicos');
```

### useFeatureValidation

```tsx
const { validateFeatureAndLimit } = useFeatureValidation();

const handleAdd = async () => {
  const ok = await validateFeatureAndLimit('whatsapp_bot', 'funcionarios_bot');
  if (!ok) return; // Erro já exibido
  // Prosseguir
};
```

## Componentes

### FeatureGateV2

```tsx
<FeatureGateV2 feature="whatsapp_bot">
  <WhatsAppDashboard />
</FeatureGateV2>
```

### ResourceLimitGuard

```tsx
<ResourceLimitGuard resource="tecnicos">
  <AddTecnicoForm />
</ResourceLimitGuard>
```

### ResourceUsageBar

```tsx
<ResourceUsageBar resource="agendamentos_mes" />
```

## Fluxo de Validação

```
┌─────────────────────────────────────────────────────────────┐
│                    Ação do Usuário                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  validateFeatureAndLimit()   │
              └──────┬─────────────────┬─────┘
                     │                 │
          ┌──────────▼──────────┐  ┌───▼───────────────┐
          │ can_use_feature()   │  │ check_resource_   │
          │ RPC do banco        │  │ limit() RPC       │
          └──────────┬──────────┘  └───────┬───────────┘
                     │                     │
          ┌──────────▼──────────┐  ┌───────▼───────────┐
          │ Feature no plano?   │  │ Dentro do limite? │
          │ Feature flag ativo? │  │                   │
          └──────────┬──────────┘  └───────┬───────────┘
                     │                     │
                     └──────────┬──────────┘
                                │
                     ┌──────────▼──────────┐
                     │ Todos OK?           │
                     │ SIM → Prosseguir    │
                     │ NÃO → Toast + Block │
                     └─────────────────────┘
```

## Migração de Código Existente

### Antes (useTenantLimits local)
```tsx
const { hasFeature, canAdd } = useTenantLimits();
if (!hasFeature('whatsapp_bot') || !canAdd('funcionarios_bot')) {
  // ...
}
```

### Depois (RPC centralizada)
```tsx
const { validateFeatureAndLimitAsync } = useLimitValidation();
const result = await validateFeatureAndLimitAsync('whatsapp_bot', 'funcionarios_bot');
if (!result.canProceed) {
  result.showError();
  return;
}
```

## Segurança

- Todas as decisões são feitas no banco (SECURITY DEFINER)
- Frontend não pode burlar validações
- RLS aplicado em todas as novas tabelas
- Logs de atividade para auditoria
