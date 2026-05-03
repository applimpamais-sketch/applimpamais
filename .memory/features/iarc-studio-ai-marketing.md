# Memory: features/iarc-studio-ai-marketing
Updated: now

Módulo IARC Studio integra ferramentas de marketing baseadas em IA generativa diretamente no dashboard.

## Ferramentas Disponíveis

### 1. Gerador de Criativos
- **Modo Manual**: Formulário com tipo (feed/stories/carrossel), descrição, estilo visual
- **Modo Assistido (Wizard)**: Fluxo conversacional em 5 etapas:
  1. Seleção de serviço do catálogo (`ServiceSelector`)
  2. Estratégia de preço (sem preço/fixo/promocional com `PricingSelector`)
  3. Elementos visuais (timer, garantia, antes/depois com `ElementsSelector`)
  4. Formato e estilo visual (`FormatSelector` + `StyleSelector`)
  5. Texto overlay e revisão
- Edge function: `iarc-generate-creative` (usa Gemini 2.5 Flash Image)

### 2. Construtor de Landing Pages
- **Templates**: promocao_simples, vsl, captura_leads, comparativo, servico_local
- **Wizard em 5 etapas**:
  1. Seleção de serviço
  2. Estratégia de preço
  3. Destino CTA (WhatsApp/Checkout/Formulário) - Checkout requer módulo `shop_pro`
  4. Template e elementos (depoimentos, garantia, timer, etc.)
  5. Nome e copy (headline/subheadline opcionais - IA gera se vazio)
- Edge function: `iarc-generate-landing` (gera copy estruturada com JSON)
- Salva em `iarc_landing_pages` com slug único

### 3. Gerador de Copy
- Headlines, CTAs e bullets para anúncios
- Edge function: `iarc-generate-copy`

## Componentes Reutilizáveis (src/components/iarc/)
- `WizardStep`: Container de etapa com progress bar e navegação
- `ServiceSelector`: Grid de serviços do catálogo com busca
- `PricingSelector`: Estratégia de preço com inputs dinâmicos
- `CtaSelector`: Destino do CTA com verificação de módulos
- `ElementsSelector`: Checkboxes de elementos visuais
- `StyleSelector`: Estilos visuais (minimalista, vibrante, profissional, moderno, elegante)
- `FormatSelector`: Formatos de imagem (feed, stories, carrossel)

## Hook
- `useServicosParaIARC`: Busca serviços agrupados por categoria/subcategoria

## Controle de Acesso
- Módulo: `iarc_criativos`
- Verificado via `ModuleGate` e `useTenantModules`

## Rotas
- `/admin/iarc` - Index
- `/admin/iarc/criativos` - Modo manual
- `/admin/iarc/criativos/wizard` - Modo assistido
- `/admin/iarc/landing-pages` - Templates
- `/admin/iarc/landing-pages/wizard` - Wizard LP
- `/admin/iarc/copy-generator` - Gerador de copy
