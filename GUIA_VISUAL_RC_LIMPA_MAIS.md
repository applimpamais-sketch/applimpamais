# 🎨 Guia Visual RC Limpa Mais - Design System Completo

## 📋 Índice
1. [Paleta de Cores](#paleta-de-cores)
2. [Tipografia](#tipografia)
3. [Componentes](#componentes)
4. [Layout](#layout)
5. [Espaçamentos](#espaçamentos)
6. [Sombras e Efeitos](#sombras-e-efeitos)
7. [Animações](#animações)

---

## 🎨 Paleta de Cores

### Cores Principais (HSL)
```css
/* COR PRINCIPAL - Azul RC Limpa Mais */
--primary: 212 93% 43%;           /* #074FD5 - Azul vibrante */
--primary-foreground: 0 0% 100%;  /* Texto em cima do azul */

/* VERDE DESTAQUE - Cor dos itens ativos */
--accent-green: 152 85% 55%;      /* #1FE785 - Verde neon */

/* BACKGROUNDS */
--background: 0 0% 100%;           /* Branco */
--foreground: 222.2 84% 4.9%;     /* Texto principal escuro */

/* COMPONENTES */
--card: 0 0% 100%;                /* Fundo dos cards */
--card-foreground: 222.2 84% 4.9%;
--popover: 0 0% 100%;
--popover-foreground: 222.2 84% 4.9%;

/* BORDERS */
--border: 214.3 31.8% 91.4%;      /* Bordas suaves */
--input: 214.3 31.8% 91.4%;

/* SECUNDÁRIO */
--secondary: 210 40% 96.1%;       /* Cinza muito claro */
--secondary-foreground: 222.2 47.4% 11.2%;

/* MUTED */
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;

/* DESTRUCTIVE */
--destructive: 0 84.2% 60.2%;     /* Vermelho */
--destructive-foreground: 0 0% 98%;

/* OUTROS ESTADOS */
--ring: 212 93% 43%;              /* Focus ring (azul principal) */
--radius: 0.5rem;                 /* Border radius padrão */
```

### Cores de Estado
```css
/* SUCESSO */
--success: 142 76% 36%;           /* Verde */
--success-foreground: 0 0% 100%;

/* AVISO */
--warning: 38 92% 50%;            /* Amarelo/Laranja */
--warning-foreground: 0 0% 100%;

/* ERRO */
--error: 0 84% 60%;               /* Vermelho */
--error-foreground: 0 0% 100%;
```

### Gradientes
```css
/* GRADIENTE PRINCIPAL */
background: linear-gradient(135deg, hsl(212, 93%, 43%) 0%, hsl(152, 85%, 55%) 100%);

/* GRADIENTE DE FUNDO DO LAYOUT */
background: linear-gradient(to bottom right, 
  hsl(var(--background)), 
  hsl(var(--background)), 
  hsl(var(--muted) / 0.2)
);

/* GRADIENTE DE HOVER EM CARDS */
background: linear-gradient(to bottom right, 
  hsl(var(--primary) / 0.05) 0%, 
  transparent 100%
);
```

---

## 🔤 Tipografia

### Fonte Principal
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Tamanhos de Texto
```css
/* TÍTULOS */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }  /* 30px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }       /* 24px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }    /* 20px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }   /* 18px */

/* CORPO */
.text-base { font-size: 1rem; line-height: 1.5rem; }      /* 16px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }   /* 14px */
.text-xs { font-size: 0.75rem; line-height: 1rem; }       /* 12px */
```

### Pesos de Fonte
```css
.font-normal { font-weight: 400; }    /* Texto normal */
.font-medium { font-weight: 500; }    /* Ênfase leve */
.font-semibold { font-weight: 600; }  /* Ênfase média */
.font-bold { font-weight: 700; }      /* Títulos e destaques */
```

---

## 🧩 Componentes

### 1. Sidebar (Menu Lateral)

```tsx
// ESTRUTURA E ESTILOS
const Sidebar = () => (
  <nav 
    className="flex flex-col h-screen border-r border-white/10 w-64"
    style={{ backgroundColor: '#074FD5' }}  // Azul principal
  >
    {/* Logo */}
    <div className="border-b border-white/10 flex items-center justify-center px-4 py-6">
      <img src="/logo-rc-limpa-sidebar.png" alt="Logo" className="h-12 w-auto" />
    </div>

    {/* Menu Items */}
    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      {/* Seções */}
      <div className="space-y-2">
        <h3 className="px-3 text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
          Seção
        </h3>
        {/* Items aqui */}
      </div>
    </div>

    {/* Footer com Avatar */}
    <div className="border-t border-white/10 p-4">
      {/* Avatar e logout */}
    </div>
  </nav>
);
```

**Estilos de Menu Item:**
```tsx
// ITEM INATIVO
className="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg 
           text-white hover:bg-white/10 transition-all duration-200"

// ITEM ATIVO
className="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg 
           bg-[#1FE785] text-white font-medium transition-all duration-200"
```

**Cores:**
- Fundo: `#074FD5` (azul principal)
- Texto: `white`
- Item Ativo: `#1FE785` (verde neon) com `text-white`
- Hover: `bg-white/10`
- Bordas: `border-white/10`
- Títulos de Seção: `text-white/70`

---

### 2. KPI Cards (Cards de Métricas)

#### Variante 1: StatCard (Padrão)
```tsx
<Card className="backdrop-blur-md bg-background/60 border border-border/50 
                 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] 
                 transition-all duration-300">
  <CardContent className="p-4 md:p-6">
    <div className="flex items-center justify-between">
      {/* Conteúdo à esquerda */}
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-1">Título</p>
        <p className="text-2xl md:text-3xl font-bold">Valor</p>
        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
          <TrendingUp className="h-4 w-4" /> +12%
        </p>
      </div>
      
      {/* Ícone à direita */}
      <div className="p-3 rounded-xl backdrop-blur-sm bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </CardContent>
</Card>
```

**Estilos Chave:**
- Fundo: `backdrop-blur-md bg-background/60`
- Borda: `border-border/50`
- Border Radius: `rounded-2xl`
- Hover: `hover:shadow-xl hover:scale-[1.02]`
- Transição: `transition-all duration-300`

**Variantes de Ícone (por estado):**
```tsx
// DEFAULT
bg-primary/10 text-primary

// SUCCESS
bg-green-500/10 text-green-600

// WARNING
bg-yellow-500/10 text-yellow-600

// DANGER
bg-red-500/10 text-red-600
```

#### Variante 2: DashboardKPICard (Compacto)
```tsx
<Card className="group backdrop-blur-md bg-background/60 border border-border/50 
                 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-black/10 
                 hover:scale-[1.02] transition-all duration-300 overflow-hidden relative">
  {/* Gradiente de hover */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity" />
  
  <CardContent className="relative p-3 md:p-4">
    <div className="flex items-start justify-between mb-2">
      <Icon className="h-4 w-4 text-primary/70" />
      
      {/* Badge de mudança */}
      <span className="text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm
                       text-green-600 bg-green-500/10">
        +12%
      </span>
    </div>
    <p className="text-xs text-muted-foreground mb-1">Título</p>
    <p className="text-2xl font-bold">Valor</p>
  </CardContent>
</Card>
```

---

### 3. Botões

```tsx
// BUTTON PRIMÁRIO
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground 
                   rounded-lg font-medium transition-colors">
  Texto
</Button>

// BUTTON SECUNDÁRIO
<Button variant="secondary" className="bg-secondary hover:bg-secondary/80 
                                       text-secondary-foreground rounded-lg">
  Texto
</Button>

// BUTTON OUTLINE
<Button variant="outline" className="border-border hover:bg-accent 
                                     hover:text-accent-foreground rounded-lg">
  Texto
</Button>

// BUTTON GHOST
<Button variant="ghost" className="hover:bg-accent hover:text-accent-foreground 
                                   rounded-lg">
  Texto
</Button>

// BUTTON DESTRUCTIVE
<Button variant="destructive" className="bg-destructive hover:bg-destructive/90 
                                         text-destructive-foreground rounded-lg">
  Texto
</Button>
```

**Tamanhos:**
```tsx
size="sm"      // Pequeno: h-8 px-3 text-xs
size="default" // Padrão: h-10 px-4 py-2
size="lg"      // Grande: h-11 px-8
size="icon"    // Quadrado: h-10 w-10
```

---

### 4. Badges

```tsx
// BADGE PADRÃO
<Badge className="bg-primary text-primary-foreground border-transparent 
                  rounded-full px-2.5 py-0.5 text-xs font-semibold">
  Texto
</Badge>

// BADGE SECUNDÁRIO
<Badge variant="secondary" className="bg-secondary text-secondary-foreground">
  Texto
</Badge>

// BADGE OUTLINE
<Badge variant="outline" className="border-border text-foreground">
  Texto
</Badge>

// BADGE DESTRUCTIVE
<Badge variant="destructive" className="bg-destructive text-destructive-foreground">
  Texto
</Badge>
```

---

### 5. Cards Básicos

```tsx
// CARD PADRÃO
<Card className="rounded-lg border bg-card text-card-foreground shadow-soft">
  <CardHeader>
    <CardTitle className="text-2xl font-semibold">Título</CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Descrição
    </CardDescription>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
  <CardFooter>Rodapé</CardFooter>
</Card>

// CARD COM GLASSMORPHISM (mais usado no admin)
<Card className="backdrop-blur-md bg-background/60 border border-border/50 
                 rounded-2xl shadow-lg">
  {/* Conteúdo */}
</Card>
```

---

### 6. Tabelas

```tsx
<div className="rounded-xl border border-border overflow-hidden bg-card">
  <Table>
    <TableHeader>
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        <TableHead className="font-semibold text-foreground">Coluna</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="hover:bg-muted/50 transition-colors">
        <TableCell className="text-sm">Dado</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

---

### 7. Dropdowns de Status

```tsx
// CORES POR STATUS (agendamentos)
const statusColors = {
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmado: "bg-blue-100 text-blue-800 border-blue-300",
  em_andamento: "bg-purple-100 text-purple-800 border-purple-300",
  concluido: "bg-green-100 text-green-800 border-green-300",
  cancelado: "bg-red-100 text-red-800 border-red-300",
  reembolsado: "bg-orange-100 text-orange-800 border-orange-300",
  pago: "bg-emerald-100 text-emerald-800 border-emerald-300",
};
```

---

## 📐 Layout

### AdminLayout (Layout Principal do Admin)

```tsx
<div className="flex h-screen overflow-hidden w-full 
                bg-gradient-to-br from-background via-background to-muted/20">
  {/* Sidebar Desktop */}
  <Sidebar className="hidden md:block" />
  
  {/* Main Content Area */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Header */}
    <AdminHeader />
    
    {/* Page Content */}
    <main className="flex-1 overflow-y-auto 
                     bg-gradient-to-br from-background via-muted/5 to-muted/10">
      <Outlet />
    </main>
  </div>
  
  {/* Mobile Bottom Navigation */}
  <MobileNav className="md:hidden" />
</div>
```

### AdminContainer (Container de Páginas)

```tsx
<div className="px-4 sm:px-6 lg:px-8      /* Padding horizontal responsivo */
                py-6 md:py-8              /* Padding vertical */
                pb-24 md:pb-8             /* Extra padding bottom mobile */
                space-y-6 md:space-y-8">  /* Espaçamento entre seções */
  {children}
</div>
```

### AdminHeader (Cabeçalho)

```tsx
<header className="h-14 border-b border-border bg-background/95 
                   backdrop-blur supports-[backdrop-filter]:bg-background/60
                   flex items-center justify-between px-4 md:px-6">
  {/* Título da página */}
  <h1 className="text-xl font-semibold">Título</h1>
  
  {/* Ações */}
  <div className="flex items-center gap-2">
    {/* Botões, filtros, etc */}
  </div>
</header>
```

---

## 📏 Espaçamentos

### Sistema de Espaçamento Tailwind
```css
/* GAPS (espaçamento entre elementos flex/grid) */
gap-1  /* 0.25rem = 4px */
gap-2  /* 0.5rem = 8px */
gap-3  /* 0.75rem = 12px */
gap-4  /* 1rem = 16px */
gap-6  /* 1.5rem = 24px */
gap-8  /* 2rem = 32px */

/* PADDING */
p-2   /* 0.5rem = 8px */
p-3   /* 0.75rem = 12px */
p-4   /* 1rem = 16px */
p-6   /* 1.5rem = 24px */
p-8   /* 2rem = 32px */

/* MARGIN */
m-2, m-3, m-4, m-6, m-8  /* Mesmos valores */

/* ESPAÇAMENTO ENTRE SEÇÕES (stack) */
space-y-4  /* 1rem vertical entre children */
space-y-6  /* 1.5rem */
space-y-8  /* 2rem */
```

### Padrões de Espaçamento

**Entre KPIs (Grid):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  {/* KPI Cards */}
</div>
```

**Entre Seções:**
```tsx
<div className="space-y-6 md:space-y-8">
  <section>...</section>
  <section>...</section>
</div>
```

**Padding de Cards:**
```tsx
<CardContent className="p-3 md:p-4">    {/* Compacto */}
<CardContent className="p-4 md:p-6">    {/* Padrão */}
```

---

## 🌟 Sombras e Efeitos

### Sombras
```css
/* SOMBRAS PADRÃO */
.shadow-soft { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
                            0 1px 2px 0 rgba(0, 0, 0, 0.06); }

.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
                          0 4px 6px -2px rgba(0, 0, 0, 0.05); }

.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                          0 10px 10px -5px rgba(0, 0, 0, 0.04); }

/* SOMBRA COM COR (hover em cards) */
.hover\:shadow-black/10:hover { 
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); 
}
```

### Glassmorphism (Efeito Vidro)
```css
/* PADRÃO PARA CARDS E OVERLAYS */
.backdrop-blur-md { backdrop-filter: blur(12px); }
.bg-background/60 { background-color: hsl(var(--background) / 0.6); }

/* COMBINAÇÃO COMPLETA */
className="backdrop-blur-md bg-background/60 border border-border/50"
```

### Border Radius
```css
.rounded-lg { border-radius: 0.5rem; }     /* 8px - botões, inputs */
.rounded-xl { border-radius: 0.75rem; }    /* 12px - ícones */
.rounded-2xl { border-radius: 1rem; }      /* 16px - cards */
.rounded-full { border-radius: 9999px; }   /* badges, avatars */
```

---

## 🎬 Animações

### Transições Padrão
```css
/* TRANSITION BASE */
.transition-all { transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1); }
.duration-200 { transition-duration: 200ms; }
.duration-300 { transition-duration: 300ms; }

/* HOVER SCALE (cards) */
.hover\:scale-\[1\.02\]:hover { transform: scale(1.02); }

/* OPACITY */
.transition-opacity { transition: opacity 150ms ease-in-out; }
```

### Animações de Entrada
```css
/* FADE IN */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.3s ease-out; }

/* SCALE IN */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-scale-in { animation: scaleIn 0.2s ease-out; }
```

### Padrões de Hover
```tsx
// CARD HOVER
className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300"

// BUTTON HOVER
className="hover:bg-primary/90 transition-colors"

// LINK/MENU ITEM HOVER
className="hover:bg-white/10 transition-all duration-200"
```

---

## 📊 Gráficos (Recharts)

### Cores de Gráficos
```tsx
// CORES PRINCIPAIS PARA CHARTS
const chartColors = {
  primary: "hsl(212, 93%, 43%)",      // Azul principal
  secondary: "hsl(152, 85%, 55%)",    // Verde accent
  success: "hsl(142, 76%, 36%)",      // Verde escuro
  warning: "hsl(38, 92%, 50%)",       // Laranja
  danger: "hsl(0, 84%, 60%)",         // Vermelho
  muted: "hsl(215.4, 16.3%, 46.9%)",  // Cinza
};

// USO EM RECHARTS
<Bar dataKey="value" fill="hsl(212, 93%, 43%)" radius={[8, 8, 0, 0]} />
<Line dataKey="value" stroke="hsl(212, 93%, 43%)" strokeWidth={2} />
<Area dataKey="value" fill="hsl(212, 93%, 43%)" fillOpacity={0.2} 
      stroke="hsl(212, 93%, 43%)" strokeWidth={2} />
```

### Container de Gráfico
```tsx
<Card className="backdrop-blur-md bg-background/60 border border-border/50 
                 rounded-2xl shadow-lg">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Título</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      {/* Recharts Chart */}
    </ResponsiveContainer>
  </CardContent>
</Card>
```

---

## 🎯 Padrões de Grid

### Grid de KPIs (Dashboard)
```tsx
// 4 COLUNAS (Desktop)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  <KPICard />
  <KPICard />
  <KPICard />
  <KPICard />
</div>

// 3 COLUNAS (Charts)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <ChartCard />
  <ChartCard />
  <ChartCard />
</div>

// 2 COLUNAS (Seções)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Section />
  <Section />
</div>
```

---

## 🔧 Utilitários Importantes

### Responsividade (Breakpoints)
```css
/* TAILWIND BREAKPOINTS */
sm: 640px   /* @media (min-width: 640px) */
md: 768px   /* @media (min-width: 768px) */
lg: 1024px  /* @media (min-width: 1024px) */
xl: 1280px  /* @media (min-width: 1280px) */
2xl: 1536px /* @media (min-width: 1536px) */
```

### Classes de Utilidade Comuns
```tsx
// TRUNCATE TEXT
className="truncate"  // text-overflow: ellipsis

// LINE CLAMP
className="line-clamp-2"  // max 2 linhas

// SCROLL
className="overflow-y-auto scrollbar-thin"

// FLEX
className="flex items-center justify-between gap-3"

// GRID
className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

---

## 📱 Mobile Navigation (Bottom Bar)

```tsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 
                bg-[#074FD5] border-t border-white/10 pb-safe">
  <div className="grid grid-cols-4 gap-1 px-2 py-2">
    {items.map(item => (
      <NavLink
        to={item.path}
        className={({ isActive }) => cn(
          "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all",
          isActive 
            ? "bg-[#1FE785] text-white" 
            : "text-white/70 hover:text-white hover:bg-white/10"
        )}
      >
        <item.icon className="h-5 w-5" />
        <span className="text-xs font-medium">{item.title}</span>
      </NavLink>
    ))}
  </div>
</nav>
```

---

## ✅ Checklist de Implementação

- [ ] Copiar todas as cores HSL do `index.css` ou `tailwind.config.ts`
- [ ] Usar `#074FD5` como cor principal (azul)
- [ ] Usar `#1FE785` como cor de itens ativos (verde neon)
- [ ] Sidebar com fundo `#074FD5` e texto branco
- [ ] Cards com `backdrop-blur-md bg-background/60 border-border/50 rounded-2xl`
- [ ] Hover em cards: `hover:shadow-xl hover:scale-[1.02]`
- [ ] Ícones em circles com `bg-primary/10 text-primary`
- [ ] Gradiente de fundo: `bg-gradient-to-br from-background via-muted/5 to-muted/10`
- [ ] Transições suaves: `transition-all duration-300`
- [ ] Grid responsivo para KPIs: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- [ ] Fonte Inter em toda a aplicação
- [ ] Sombras `shadow-lg` e `shadow-xl` nos cards
- [ ] Border radius `rounded-2xl` nos cards principais

---

## 🎨 Exemplos de Código Completo

### Exemplo: Página Dashboard Completa
```tsx
import AdminContainer from '@/components/admin/AdminContainer';
import StatCard from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <AdminContainer>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total de Clientes" 
          value="1,234" 
          trend="+12% vs mês anterior"
          icon={Users}
        />
        <StatCard 
          title="Agendamentos" 
          value="89" 
          trend="+8%"
          icon={Calendar}
        />
        <StatCard 
          title="Receita Total" 
          value="R$ 45.890" 
          trend="+15%"
          icon={DollarSign}
        />
        <StatCard 
          title="Taxa de Conversão" 
          value="24.5%" 
          trend="+3%"
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="backdrop-blur-md bg-background/60 border border-border/50 
                         rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Vendas por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart Component */}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-background/60 border border-border/50 
                         rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Top Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart Component */}
          </CardContent>
        </Card>
      </div>
    </AdminContainer>
  );
}
```

---

## 📞 Contato e Suporte

Este guia foi criado para facilitar a replicação do design system do RC Limpa Mais em outros projetos. Para dúvidas sobre cores, componentes ou padrões específicos, consulte os arquivos:

- `src/index.css` - Variáveis de cores e design tokens
- `tailwind.config.ts` - Configuração do Tailwind
- `src/components/ui/*` - Componentes base (shadcn/ui)
- `src/components/admin/*` - Componentes específicos do admin

---

**Versão:** 1.0  
**Última Atualização:** Novembro 2025  
**Projeto:** RC Limpa Mais Admin Dashboard
