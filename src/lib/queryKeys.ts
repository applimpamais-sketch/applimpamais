// Query keys padronizadas para cache consistency
// Todas as páginas financeiras DEVEM usar estas keys

export const QUERY_KEYS = {
  // Core financeiro - FONTE ÚNICA DE VERDADE
  financeCore: (start: string, end: string) => ['finance-core', start, end] as const,
  ledger: (start: string, end: string) => ['ledger', start, end] as const,
  
  // Derivados (consomem do core)
  dashboard: ['dashboard-stats'] as const,
  dashboardFinanceiro: ['dashboard-financeiro'] as const,
  consolidado: ['dashboard-consolidado'] as const,
  fluxoCaixa: (period: string) => ['fluxo-caixa', period] as const,
  receitas: (filters: Record<string, unknown>) => ['receitas', filters] as const,
  despesas: (filters: Record<string, unknown>) => ['despesas', filters] as const,
  
  // Tabelas base
  agendamentos: ['agendamentos'] as const,
  pagamentos: ['pagamentos'] as const,
  
  // Views agregadas
  financeSummary: (start: string, end: string) => ['finance-summary', start, end] as const,
  cashflowDaily: (start: string, end: string) => ['cashflow-daily', start, end] as const,
  receiptsByMethod: ['receipts-by-method'] as const,
  expensesByCategory: ['expenses-by-category'] as const,
} as const;

// Grupos de invalidação - quando algo muda, invalida todo o grupo
export const INVALIDATION_GROUPS = {
  financial: [
    'finance-core',
    'ledger',
    'dashboard-stats',
    'dashboard-financeiro',
    'dashboard-consolidado',
    'fluxo-caixa',
    'receitas',
    'despesas',
    'finance-summary',
    'cashflow-daily',
    'receipts-by-method',
    'expenses-by-category',
  ],
  appointments: [
    'agendamentos',
    'dashboard-stats',
    'receitas',
    'finance-core',
  ],
} as const;
