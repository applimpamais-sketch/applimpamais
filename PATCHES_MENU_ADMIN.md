# TOP 10 PATCHES CRÍTICOS - MENU ADMIN

## PATCH #1: Paginação Server-Side em Agendamentos (P0)

**Arquivo:** `src/hooks/useAgendamentos.ts`  
**Problema:** Client-side load de todos os registros  
**Esforço:** 4-6h

```typescript
// ANTES (carrega tudo)
const { data } = await supabase.from('agendamentos').select('*');

// DEPOIS (paginação)
const { data, count } = await supabase
  .from('agendamentos')
  .select('*', { count: 'exact' })
  .range(page * pageSize, (page + 1) * pageSize - 1)
  .order('created_at', { ascending: false });
```

---

## PATCH #2: Materialized Views para Relatórios (P0)

**Arquivo:** Supabase Migration  
**Problema:** Agregações pesadas no client (4.2s load)  
**Esforço:** 6-8h

```sql
CREATE MATERIALIZED VIEW mv_relatorios_bairros AS
SELECT 
  bairro,
  COUNT(*) as quantidade,
  SUM(valor_total) as receita,
  COUNT(*) FILTER (WHERE status = 'concluido') as concluidos
FROM agendamentos
GROUP BY bairro
ORDER BY quantidade DESC;

CREATE INDEX idx_mv_bairros_quantidade ON mv_relatorios_bairros(quantidade DESC);

-- Refresh automático a cada 1 hora
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh_relatorios', '0 * * * *', 
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_relatorios_bairros');
```

---

## PATCH #3: WebSocket Real-Time para Live View (P1)

**Arquivo:** `src/pages/admin/LiveView.tsx`  
**Problema:** Polling não é verdadeiro real-time  
**Esforço:** 12-16h

```typescript
useEffect(() => {
  const channel = supabase
    .channel('live_sessions_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'live_sessions' },
      (payload) => {
        console.log('Live session updated:', payload);
        refresh(); // Atualizar stats instantaneamente
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## PATCH #4: Consolidação Páginas WhatsApp (P1)

**Arquivos:** Sidebar.tsx, App.tsx, novas páginas  
**Problema:** 4 páginas separadas com sobreposição  
**Esforço:** 12-16h

```typescript
// REMOVER de Sidebar.tsx linhas 75-78
// ADICIONAR item único:
{ title: 'WhatsApp Central', path: '/admin/integracoes/whatsapp', icon: MessageSquare }

// Criar componente com tabs
<Tabs defaultValue="dashboard">
  <TabsList>
    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
    <TabsTrigger value="config">Configuração</TabsTrigger>
    <TabsTrigger value="financeiro">Notificações Financeiras</TabsTrigger>
  </TabsList>
  <TabsContent value="dashboard">...</TabsContent>
  <TabsContent value="config">...</TabsContent>
  <TabsContent value="financeiro">...</TabsContent>
</Tabs>
```

---

## PATCH #5: HMAC Signature em Webhooks (P0)

**Arquivo:** `src/pages/admin/integracoes/Webhook.tsx` + edge function  
**Problema:** Webhooks sem validação de origem  
**Esforço:** 8-12h

```typescript
// Edge function
const crypto = await import('node:crypto');
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

headers.append('X-Webhook-Signature', signature);

// Validação no receptor
const receivedSignature = request.headers.get('X-Webhook-Signature');
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(await request.text())
  .digest('hex');

if (receivedSignature !== expectedSignature) {
  return new Response('Invalid signature', { status: 401 });
}
```

---

## PATCH #6: Bot WhatsApp - Consolidação UI (P1)

**Arquivo:** `src/pages/admin/bot/LiveView.tsx`  
**Problema:** 11 subseções separadas causando navegação confusa  
**Esforço:** 16-20h

```typescript
// Consolidar em tabs dentro da mesma página
<Tabs defaultValue="live">
  <TabsList className="grid grid-cols-4">
    <TabsTrigger value="live">Live & KPIs</TabsTrigger>
    <TabsTrigger value="auditoria">Auditoria & Diagnóstico</TabsTrigger>
    <TabsTrigger value="historico">Histórico & Análise</TabsTrigger>
    <TabsTrigger value="config">Config & Integrações</TabsTrigger>
  </TabsList>
  {/* Conteúdo consolidado */}
</Tabs>
```

---

## PATCH #7: Audit Log Global (P1)

**Arquivo:** Supabase Migration + trigger function  
**Problema:** Falta rastreabilidade  
**Esforço:** 8-12h

```sql
-- Já existe audit_logs table, adicionar triggers
CREATE OR REPLACE FUNCTION audit_critical_actions()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'agendamentos' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, metadata)
    VALUES (
      auth.uid(),
      'status_changed',
      'agendamentos',
      NEW.id,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_agendamento_status_change
AFTER UPDATE ON agendamentos
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION audit_critical_actions();
```

---

## PATCH #8: Sequência Follow-up Carrinhos (P1)

**Arquivo:** `supabase/functions/process-abandoned-carts/index.ts`  
**Problema:** Apenas 1 tentativa  
**Esforço:** 10-14h

```typescript
// Adicionar lógica de escalação
const tentativas = carrinho.tentativas_contato || 0;

let mensagem = '';
switch(tentativas) {
  case 0: // Primeira tentativa (2 min)
    mensagem = gerarMensagemRecuperacao(carrinho);
    break;
  case 1: // Segunda tentativa (D+1)
    mensagem = `Olá ${carrinho.nome_cliente}! Notamos que você não finalizou seu pedido. Temos um desconto especial de 10% para você! 🎁`;
    break;
  case 2: // Terceira tentativa (D+3)
    mensagem = `Última chance! Seu carrinho expira em 24h. Use o cupom VOLTE15 para 15% de desconto! ⏰`;
    break;
}

// Atualizar próximo contato
const proximoContato = tentativas === 0 
  ? new Date(Date.now() + 24*60*60*1000) // D+1
  : new Date(Date.now() + 3*24*60*60*1000); // D+3
```

---

## PATCH #9: Filtro de Período em Relatórios (P1)

**Arquivo:** `src/pages/admin/Relatorios.tsx`  
**Problema:** Sem filtros de data  
**Esforço:** 4-6h

```typescript
import PeriodFilter from '@/components/admin/PeriodFilter';

const [period, setPeriod] = useState<PeriodType>('30d');

// Na query
const { data } = await supabase
  .from('agendamentos')
  .select('*')
  .gte('created_at', getStartDate(period))
  .lte('created_at', new Date().toISOString());
```

---

## PATCH #10: Rate Limiting em Bulk Actions (P1)

**Arquivo:** `src/pages/admin/Agendamentos.tsx`  
**Problema:** Sem limite de updates simultâneos  
**Esforço:** 4-6h

```typescript
const handleBulkStatusUpdate = async (newStatus: string) => {
  const BATCH_SIZE = 10;
  const batches = [];
  
  for (let i = 0; i < selectedIds.length; i += BATCH_SIZE) {
    batches.push(selectedIds.slice(i, i + BATCH_SIZE));
  }
  
  for (const batch of batches) {
    await Promise.all(batch.map(id => updateStatus(id, newStatus)));
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
  }
  
  toast({ title: `${selectedIds.length} agendamento(s) atualizado(s)!` });
};
```

---

## 📦 DEPLOY INSTRUCTIONS

1. **Backup Database:** `pg_dump` antes de qualquer migration
2. **Deploy Order:** Patches #2, #7 (DB) → #1, #3, #5, #9, #10 (code) → #4, #6, #8 (features)
3. **Rollback Plan:** Git tags + database snapshots
4. **Validation:** Executar QA checklist completo
5. **Monitoring:** Ativar alertas críticos por 48h pós-deploy
