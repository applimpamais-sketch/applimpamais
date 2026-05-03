# 📐 PLANO DE EXECUÇÃO TÉCNICA - SaaS RC Limpa+

**Data:** 05/01/2026  
**Versão:** 2.0  
**Status:** Pós-Correções Críticas

---

## 📊 FASE 1: VALIDAÇÃO DAS CORREÇÕES

### ✅ Correções BEM Implementadas

| Item | Status | Observação |
|------|--------|------------|
| **Página ClienteDetalhe** | ✅ COMPLETO | Rota funcional, timeline 360°, métricas, notas |
| **Calendário Técnico** | ✅ COMPLETO | Visualização semana/dia, toggle lista/calendário |
| **WhatsApp sem mocks** | ✅ COMPLETO | Usando `useIntegracoes`, persistência no banco |
| **Sidebar reorganizado** | ✅ COMPLETO | Grupos colapsáveis (CRM, Financeiro, Integrações) |
| **Migração CRM** | ✅ COMPLETO | 9 clientes migrados de agendamentos |

### ⚠️ Correções que Precisam Ajuste

| Item | Problema | Ação Necessária |
|------|----------|-----------------|
| **Rotas WhatsApp duplicadas** | Ainda existem rotas separadas (`whatsapp-config`, `whatsapp-despesas`) | Consolidar em abas dentro de `/admin/integracoes/whatsapp` |
| **Hook useCrmCliente** | Não existe - ClienteDetalhe usa hook genérico | Criar `useCrmCliente(id)` específico |
| **Métricas CRM não atualizadas** | `valor_total_gasto` está zerado para clientes migrados | Executar `UPDATE` com JOIN em agendamentos |

### ❌ Correções Incompletas

| Item | Status | Impacto |
|------|--------|---------|
| **Breadcrumb** | Não implementado | Navegação confusa em páginas internas |
| **Empty states padronizados** | Parcial | Inconsistência visual |

---

## 🧠 FASE 2: FUNCIONALIDADES FALTANTES - ESPECIFICAÇÃO TÉCNICA

---

### 1️⃣ MÓDULO DE ORÇAMENTOS/PROPOSTAS

#### Objetivo
Permitir envio de orçamento formal antes do agendamento, aumentando conversão e profissionalismo.

#### Fluxo do Usuário
```
1. Admin acessa /admin/orcamentos
2. Clica "Novo Orçamento"
3. Seleciona cliente (existente ou novo)
4. Adiciona itens/serviços com quantidades
5. Define validade e condições
6. Gera PDF com logo da empresa
7. Envia via WhatsApp ou email
8. Cliente aceita → Converte em Agendamento
```

#### Telas Necessárias
- `/admin/orcamentos` - Lista com filtros (pendente, aceito, recusado, expirado)
- `/admin/orcamentos/novo` - Formulário de criação
- `/admin/orcamentos/:id` - Visualização e ações
- Link público: `/orcamento/:codigo` - Cliente visualiza e aceita

#### Ações Automáticas
- Lembrete WhatsApp 24h após envio (se não respondido)
- Expiração automática baseada na validade
- Atualizar status do cliente no CRM para "prospect" ao enviar

#### Valor para o Negócio
- +15-25% conversão de leads
- Redução de tempo em negociações via WhatsApp
- Histórico de propostas para análise

#### Arquitetura Técnica

```sql
-- Tabela: orcamentos
CREATE TABLE public.orcamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(10) UNIQUE NOT NULL, -- Ex: ORC-A1B2C3
  cliente_id UUID REFERENCES crm_clientes(id),
  
  -- Dados do cliente (para orçamentos sem cadastro)
  nome_cliente TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  
  -- Itens e valores
  itens JSONB NOT NULL, -- [{servico_id, nome, quantidade, preco_unitario, preco_total}]
  subtotal NUMERIC NOT NULL,
  desconto_percentual NUMERIC DEFAULT 0,
  valor_desconto NUMERIC DEFAULT 0,
  valor_total NUMERIC NOT NULL,
  
  -- Datas e status
  validade DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, enviado, visualizado, aceito, recusado, expirado
  data_envio TIMESTAMPTZ,
  data_visualizacao TIMESTAMPTZ,
  data_resposta TIMESTAMPTZ,
  
  -- Conversão
  agendamento_id UUID REFERENCES agendamentos(id),
  
  -- Metadados
  observacoes TEXT,
  condicoes_pagamento TEXT,
  criado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_manage_orcamentos" ON public.orcamentos
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));
CREATE POLICY "public_view_orcamento" ON public.orcamentos
  FOR SELECT USING (true); -- Link público usa código
```

---

### 2️⃣ ORDEM DE SERVIÇO (OS) DIGITAL

#### Objetivo
Documentar serviço realizado com checklist, fotos e assinatura digital para evitar disputas.

#### Fluxo do Usuário
```
1. Agendamento confirmado → OS gerada automaticamente
2. Técnico chega no local
3. Abre OS no app
4. Registra fotos ANTES
5. Executa checklist de serviços
6. Registra fotos DEPOIS
7. Cliente assina na tela
8. OS finalizada → PDF gerado automaticamente
9. PDF enviado ao cliente via WhatsApp
```

#### Telas Necessárias
- `/tecnico/os/:id` - Interface mobile-first para técnico
- `/admin/os` - Lista de todas OS
- `/admin/os/:id` - Visualização detalhada com timeline
- Link público: `/os/:codigo` - Cliente visualiza sua OS

#### Ações Automáticas
- Criar OS ao confirmar agendamento
- Enviar PDF ao cliente após conclusão
- Atualizar status do agendamento para "concluído"
- Calcular tempo de execução

#### Valor para o Negócio
- Eliminação de 90% das disputas
- Fotos para marketing nas redes sociais
- Controle de qualidade do técnico
- Histórico completo do serviço

#### Arquitetura Técnica

```sql
-- Tabela: ordens_servico
CREATE TABLE public.ordens_servico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(10) UNIQUE NOT NULL, -- Ex: OS-2026-001
  agendamento_id UUID REFERENCES agendamentos(id) NOT NULL,
  tecnico_id UUID REFERENCES profiles(id),
  
  -- Status e datas
  status TEXT NOT NULL DEFAULT 'pendente', 
  -- pendente, em_andamento, aguardando_assinatura, concluida, cancelada
  
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  tempo_execucao_minutos INTEGER,
  
  -- Checklist
  checklist JSONB NOT NULL DEFAULT '[]', 
  -- [{item, descricao, realizado, observacao}]
  
  -- Fotos
  fotos_antes JSONB DEFAULT '[]', -- [{url, timestamp, descricao}]
  fotos_depois JSONB DEFAULT '[]',
  
  -- Assinatura
  assinatura_cliente_url TEXT,
  nome_assinante TEXT,
  data_assinatura TIMESTAMPTZ,
  
  -- Observações
  observacoes_tecnico TEXT,
  observacoes_cliente TEXT,
  problemas_encontrados TEXT,
  
  -- PDF
  pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bucket Storage para fotos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('os-fotos', 'os-fotos', false);

CREATE POLICY "tecnico_upload_fotos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'os-fotos' AND 
    has_role(auth.uid(), 'tecnico')
  );
```

---

### 3️⃣ GESTÃO DE RECORRÊNCIA

#### Objetivo
Automatizar agendamentos recorrentes para clientes frequentes, garantindo receita previsível.

#### Fluxo do Usuário
```
1. Ao criar agendamento, admin marca "Recorrente"
2. Define frequência: semanal, quinzenal, mensal, bimestral
3. Define data/horário preferencial
4. Sistema cria próximos agendamentos automaticamente
5. 3 dias antes: Enviar confirmação ao cliente
6. Cliente confirma → Mantém | Reagenda → Sugere nova data | Cancela → Interrompe
```

#### Telas Necessárias
- Campo no formulário de agendamento
- `/admin/recorrencias` - Gerenciar contratos recorrentes
- Dashboard: Indicador de receita recorrente

#### Ações Automáticas
- Cron job diário: Criar agendamentos futuros (30 dias à frente)
- Lembrete WhatsApp 3 dias antes pedindo confirmação
- Se cliente não responder: Confirmar automaticamente
- Atualizar próximo agendamento após conclusão

#### Valor para o Negócio
- +30-40% retenção de clientes
- Receita mensal previsível
- Redução de trabalho operacional

#### Arquitetura Técnica

```sql
-- Tabela: recorrencias
CREATE TABLE public.recorrencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES crm_clientes(id),
  
  -- Dados base
  telefone TEXT NOT NULL,
  nome_cliente TEXT NOT NULL,
  endereco TEXT NOT NULL,
  bairro TEXT,
  cidade TEXT,
  
  -- Serviços recorrentes
  itens_padrao JSONB NOT NULL,
  valor_estimado NUMERIC NOT NULL,
  
  -- Frequência
  frequencia TEXT NOT NULL, -- semanal, quinzenal, mensal, bimestral
  dia_semana_preferencial INTEGER, -- 0-6 (domingo-sábado)
  horario_preferencial TEXT,
  
  -- Controle
  ativo BOOLEAN DEFAULT true,
  proximo_agendamento DATE,
  ultimo_agendamento_id UUID REFERENCES agendamentos(id),
  total_realizados INTEGER DEFAULT 0,
  
  -- Metadados
  observacoes TEXT,
  criado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cron job (Edge Function)
-- supabase/functions/generate-recurring-appointments/index.ts
```

---

### 4️⃣ CONTROLE DE ESTOQUE/MATERIAIS

#### Objetivo
Controlar produtos químicos e materiais, evitar falta e calcular custo real do serviço.

#### Fluxo do Usuário
```
1. Cadastrar produtos (impermeabilizante, detergente, etc.)
2. Registrar entradas (compras)
3. Ao concluir OS, técnico registra materiais usados
4. Sistema deduz do estoque automaticamente
5. Alerta quando estoque baixo
6. Relatório de custo por serviço
```

#### Telas Necessárias
- `/admin/estoque` - Dashboard de estoque
- `/admin/estoque/produtos` - Cadastro de produtos
- `/admin/estoque/movimentacoes` - Entradas e saídas
- Na OS: Seleção de materiais usados

#### Ações Automáticas
- Alerta push quando produto < estoque mínimo
- Sugestão de reposição baseada em consumo médio
- Cálculo automático de custo do serviço

#### Valor para o Negócio
- Evitar falta de material em serviço
- Conhecer custo real e margem de lucro
- Planejamento de compras

#### Arquitetura Técnica

```sql
-- Tabela: produtos
CREATE TABLE public.produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT, -- quimico, equipamento, consumivel
  unidade TEXT NOT NULL, -- litro, unidade, kg
  estoque_atual NUMERIC DEFAULT 0,
  estoque_minimo NUMERIC DEFAULT 5,
  preco_custo NUMERIC,
  fornecedor TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: estoque_movimentacoes
CREATE TABLE public.estoque_movimentacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id) NOT NULL,
  tipo TEXT NOT NULL, -- entrada, saida, ajuste
  quantidade NUMERIC NOT NULL,
  os_id UUID REFERENCES ordens_servico(id),
  observacao TEXT,
  registrado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 5️⃣ FOTOS ANTES/DEPOIS

#### Objetivo
Registrar visualmente o serviço para prova de qualidade e marketing.

#### Fluxo do Usuário
```
1. Técnico abre serviço no app
2. Tira fotos ANTES (câmera nativa)
3. Executa serviço
4. Tira fotos DEPOIS
5. Fotos são salvas na OS
6. Admin pode marcar fotos para marketing
7. Galeria de fotos disponível para redes sociais
```

#### Telas Necessárias
- Integrado na OS do técnico
- `/admin/galeria` - Banco de fotos aprovadas
- Filtros por tipo de serviço, bairro, período

#### Ações Automáticas
- Comprimir fotos automaticamente
- Adicionar marca d'água com logo
- Sugerir melhores fotos para marketing (futuro: IA)

#### Valor para o Negócio
- Conteúdo para redes sociais
- Prova de qualidade para clientes
- Portfolio para novos clientes

#### Arquitetura Técnica

```sql
-- Já incluído na tabela ordens_servico (fotos_antes, fotos_depois)
-- Adicionar tabela para galeria de marketing

CREATE TABLE public.galeria_marketing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID REFERENCES ordens_servico(id),
  foto_url TEXT NOT NULL,
  tipo TEXT NOT NULL, -- antes, depois
  tipo_servico TEXT,
  bairro TEXT,
  cidade TEXT,
  aprovado_para_marketing BOOLEAN DEFAULT false,
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 6️⃣ INTEGRAÇÃO PAGAMENTO ONLINE (PIX/CARTÃO)

#### Objetivo
Receber pagamento antecipado para reduzir no-show e melhorar fluxo de caixa.

#### Fluxo do Usuário
```
1. Cliente agenda pelo site
2. No checkout: Opção de pagar agora (PIX/Cartão)
3. PIX: QR Code gerado, pagamento confirmado automaticamente
4. Cartão: Processado via Stripe/Mercado Pago
5. Agendamento confirmado automaticamente ao pagar
6. Opção: Pagar sinal (30%) ou valor total
```

#### Telas Necessárias
- Checkout atualizado com opção de pagamento
- `/admin/pagamentos` - Dashboard de pagamentos online
- Comprovante de pagamento no agendamento

#### Ações Automáticas
- Confirmar agendamento ao receber pagamento
- Enviar comprovante via WhatsApp
- Atualizar status financeiro automaticamente

#### Valor para o Negócio
- Redução de 50% em no-shows
- Fluxo de caixa antecipado
- Menos inadimplência

#### Arquitetura Técnica

```typescript
// Usar Stripe Connect ou Mercado Pago
// supabase/functions/create-payment-intent/index.ts
// supabase/functions/payment-webhook/index.ts

// Tabela já existe: pagamentos_agendamentos
// Adicionar campos:
ALTER TABLE pagamentos_agendamentos ADD COLUMN 
  payment_intent_id TEXT,
  metodo_pagamento TEXT, -- pix_online, cartao, presencial
  gateway TEXT; -- stripe, mercadopago, manual
```

---

### 7️⃣ NPS AUTOMÁTICO

#### Objetivo
Coletar feedback automaticamente após cada serviço para melhoria contínua.

#### Fluxo do Usuário
```
1. Serviço concluído
2. 24h depois: WhatsApp com link de pesquisa
3. Cliente responde NPS (0-10)
4. Se < 7: Alerta para admin resolver
5. Se >= 9: Pedir avaliação pública no Google
```

#### Telas Necessárias
- Link público: `/nps/:codigo`
- `/admin/nps` - Dashboard de NPS
- Detalhamento de detratores

#### Ações Automáticas
- Envio 24h após conclusão
- Alerta para detratores
- Solicitação de review para promotores

#### Valor para o Negócio
- Identificar problemas rapidamente
- Aumentar reviews positivos
- Métrica de qualidade para equipe

---

## 📐 FASE 3: PADRONIZAÇÃO DO PRODUTO

### 3.1 Padrão de Páginas CRUD

```typescript
// Estrutura padrão para páginas de listagem
<AdminContainer>
  <PageHeader 
    title="Título"
    description="Descrição"
    icon={IconComponent}
    actions={<Button>Nova Ação</Button>}
  />
  
  {/* Breadcrumb */}
  <Breadcrumb items={[{ label: 'Admin', path: '/admin' }, { label: 'Atual' }]} />
  
  {/* Filtros */}
  <FilterBar>...</FilterBar>
  
  {/* Loading State */}
  {isLoading && <LoadingSkeleton />}
  
  {/* Empty State */}
  {!isLoading && data.length === 0 && <EmptyState />}
  
  {/* Lista/Grid */}
  {data.length > 0 && <DataGrid />}
  
  {/* Paginação */}
  <Pagination />
</AdminContainer>
```

### 3.2 Padrão de Status

| Entidade | Status Possíveis |
|----------|------------------|
| **Agendamento** | pendente → confirmado → em_andamento → concluido / cancelado |
| **Orçamento** | pendente → enviado → visualizado → aceito / recusado / expirado |
| **OS** | pendente → em_andamento → aguardando_assinatura → concluida / cancelada |
| **Pagamento** | pendente → pago → estornado |
| **Recorrência** | ativo → pausado → cancelado |

### 3.3 Padrão de Automações

```typescript
// Eventos disparadores padronizados
const EVENTOS = {
  AGENDAMENTO_CRIADO: 'agendamento.criado',
  AGENDAMENTO_CONFIRMADO: 'agendamento.confirmado',
  AGENDAMENTO_CONCLUIDO: 'agendamento.concluido',
  ORCAMENTO_ENVIADO: 'orcamento.enviado',
  ORCAMENTO_ACEITO: 'orcamento.aceito',
  PAGAMENTO_RECEBIDO: 'pagamento.recebido',
  NPS_COLETADO: 'nps.coletado',
  ESTOQUE_BAIXO: 'estoque.baixo',
};

// Cada evento pode ter N ações configuráveis
// - Enviar WhatsApp
// - Enviar Email
// - Push Notification
// - Criar Tarefa CRM
// - Webhook externo
```

---

## 📊 FASE 4: PRIORIZAÇÃO E ROADMAP

### Matriz de Prioridade

| Funcionalidade | Impacto Financeiro | Impacto Operacional | Complexidade | Valor Percebido | **SCORE** |
|----------------|-------------------|---------------------|--------------|-----------------|-----------|
| **Orçamentos** | Alto | Alto | Média | Alto | **9.0** |
| **Ordem de Serviço** | Alto | Alto | Alta | Alto | **8.5** |
| **Recorrência** | Muito Alto | Médio | Média | Alto | **8.5** |
| **Pagamento Online** | Muito Alto | Baixo | Média | Alto | **8.0** |
| **Fotos Antes/Depois** | Médio | Alto | Baixa | Alto | **7.5** |
| **NPS Automático** | Médio | Médio | Baixa | Médio | **6.5** |
| **Estoque** | Médio | Alto | Média | Médio | **6.5** |

### Classificação

#### 🔴 AGORA (Obrigatório - Próximos 30 dias)
1. **Módulo de Orçamentos** - Essencial para conversão
2. **Ordem de Serviço** - Essencial para documentação
3. **Correções pendentes** - Breadcrumb, métricas CRM

#### 🟡 PRÓXIMO (Importante - 30-60 dias)
4. **Gestão de Recorrência** - Receita previsível
5. **Fotos Antes/Depois** - Marketing + qualidade
6. **Pagamento Online** - Fluxo de caixa

#### 🟢 DEPOIS (Diferencial - 60-90 dias)
7. **NPS Automático** - Qualidade
8. **Controle de Estoque** - Custo operacional
9. **Roteirização** - Eficiência

---

### 📅 ROADMAP EXECUTÁVEL

#### Sprint 1 (Dias 1-14): ORÇAMENTOS
```
Dia 1-2: Migration + Tabela orcamentos
Dia 3-5: Hook useOrcamentos + Página listagem
Dia 6-8: Formulário criação + Seleção itens
Dia 9-10: Geração PDF (jspdf)
Dia 11-12: Página pública + Aceite
Dia 13-14: Conversão para Agendamento + Testes
```

#### Sprint 2 (Dias 15-28): ORDEM DE SERVIÇO
```
Dia 15-16: Migration + Tabela ordens_servico
Dia 17-19: Interface técnico (checklist, fotos)
Dia 20-22: Captura fotos + Upload Storage
Dia 23-24: Assinatura digital (canvas)
Dia 25-26: Geração PDF automática
Dia 27-28: Testes + Ajustes
```

#### Sprint 3 (Dias 29-42): RECORRÊNCIA
```
Dia 29-30: Tabela recorrencias + Migration
Dia 31-33: UI no formulário de agendamento
Dia 34-36: Edge Function geradora de agendamentos
Dia 37-39: Cron job + Confirmação automática
Dia 40-42: Dashboard de recorrências
```

#### Sprint 4 (Dias 43-56): FOTOS + PAGAMENTO
```
Dia 43-46: Melhorias fotos (galeria marketing)
Dia 47-50: Integração Stripe/MP
Dia 51-54: Checkout com PIX
Dia 55-56: Testes e2e
```

#### Sprint 5 (Dias 57-70): NPS + ESTOQUE
```
Dia 57-60: NPS automático
Dia 61-67: Módulo estoque básico
Dia 68-70: Refinamentos e bugs
```

---

## 🚀 FASE 5: PREPARAÇÃO PARA ESCALA

### Gargalos Identificados

| Área | Gargalo | Solução |
|------|---------|---------|
| **Realtime** | Muitos canais abertos | Consolidar em 1 canal por usuário |
| **Consultas CRM** | JOIN pesado clientes↔agendamentos | Materializar métricas (atualizar via trigger) |
| **Fotos** | Upload grande | Comprimir client-side antes de enviar |
| **PDF** | Geração síncrona | Mover para Edge Function assíncrona |
| **WhatsApp** | Rate limiting Ultramsg | Fila com retry (já planejado) |

### Cache Necessário

```typescript
// React Query já faz cache
// Adicionar staleTime para dados que mudam pouco:
const { data: servicos } = useQuery({
  queryKey: ['servicos'],
  queryFn: fetchServicos,
  staleTime: 1000 * 60 * 60, // 1 hora
});
```

### Jobs Assíncronos

| Job | Frequência | Prioridade |
|-----|------------|------------|
| Gerar agendamentos recorrentes | Diário 06:00 | Alta |
| Enviar lembretes 24h | A cada 15min | Alta |
| Enviar NPS | A cada 1h | Média |
| Processar carrinhos abandonados | A cada 5min | Já existe |
| Expirar orçamentos | Diário 00:00 | Baixa |
| Limpar sessões antigas | Semanal | Baixa |

---

## ⚠️ RISCOS TÉCNICOS

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Ultramsg fora do ar** | Média | Alto | Fila de retry + fallback SMS |
| **Limite de rows Supabase** | Baixa | Alto | Monitorar, arquivar dados antigos |
| **PDF pesado demais** | Média | Baixo | Limitar tamanho de imagens |
| **Usuário sem internet** | Alta | Médio | PWA offline para técnico (futuro) |

---

## 📝 RECOMENDAÇÕES FINAIS (Tech Lead)

### 1. Priorize Orçamento + OS
Essas duas funcionalidades são diferenciais competitivos e resolvem dores reais do mercado de limpeza.

### 2. Não complique o Estoque
Para empresas pequenas, um controle simples de entrada/saída é suficiente. Não precisa de lote, validade, múltiplos depósitos.

### 3. Pagamento Online é Opcional
Muitos clientes preferem pagar presencialmente. Implemente mas não force.

### 4. Invista em Mobile
A área do técnico é o diferencial. PWA com offline é o futuro.

### 5. Monitore Custos
- OpenAI: ~R$ 0.30-0.50/conversa
- Ultramsg: ~R$ 0.15/mensagem
- Supabase: Gratuito até 500MB
- Stripe: 2.9% + R$ 0.20/transação

### 6. Documente Tudo
Cada nova feature deve ter:
- Descrição do fluxo
- Tabelas envolvidas
- RLS policies
- Testes mínimos

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Antes de Começar Cada Feature
- [ ] Migration SQL aprovada
- [ ] RLS policies definidas
- [ ] Hook React Query criado
- [ ] Tipos TypeScript definidos
- [ ] Testes manuais documentados

### Após Cada Deploy
- [ ] Verificar RLS no banco
- [ ] Testar com usuário real
- [ ] Monitorar logs de erro
- [ ] Atualizar documentação

---

*Documento gerado por Lovable AI - Tech Lead & Product Manager*
*Última atualização: 05/01/2026*
