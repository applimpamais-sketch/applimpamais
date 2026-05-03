/**
 * Mapeamento de módulos SaaS para rotas e itens de menu
 * 
 * Cada módulo desbloqueia funcionalidades específicas no dashboard.
 * Itens não incluídos aqui são considerados "sempre disponíveis".
 */

// Mapeamento: código do módulo → paths que desbloqueia
export const MODULE_MENU_MAP: Record<string, string[]> = {
  // Módulo base - obrigatório
  'dashboard_gestao': ['/admin', '/admin/agendamentos', '/admin/equipe'],
  
  // Track Live - rastreamento de técnicos
  'rastreamento_rota': ['/admin/tecnicos', '/admin/tracking'],
  
  // Finance Pro - módulo financeiro completo
  'financeiro': [
    '/admin/financeiro',
    '/admin/financeiro/consolidado',
    '/admin/financeiro/receitas',
    '/admin/financeiro/despesas',
    '/admin/financeiro/fluxo-caixa',
    '/admin/financeiro/metas',
    '/admin/notas-fiscais',
    '/admin/orcamentos',
  ],
  
  // ZapBot Pro - WhatsApp automation
  'whatsapp_bot': [
    '/admin/templates',
    '/admin/whatsapp-dashboard',
    '/admin/integracoes/whatsapp',
    '/admin/integracoes/whatsapp-config',
    '/admin/integracoes/whatsapp-despesas',
  ],
  
  // Growth Kit - ferramentas de marketing
  'marketing_tools': [
    '/admin/marketing',
    '/admin/carrinhos-abandonados',
    '/admin/cupons',
    '/admin/push-notifications',
    '/admin/avaliacoes-config',
  ],
  
  // Content Engine - Blog e SEO
  'blog_seo': [
    '/admin/blog',
    '/admin/blog/gerar',
    '/admin/blog/fila',
    '/admin/blog/keywords',
    '/admin/blog/importar',
    '/admin/blog/configuracoes',
    '/admin/blog/logs',
  ],
  
  // Indica+ - programa de parcerias
  'parcerias': ['/admin/parcerias'],
  
  // Insights Pro - relatórios avançados
  'relatorios_avancados': ['/admin/relatorios'],
  
  // Connect API - integrações externas
  'api_access': [
    '/admin/integracoes/canais',
    '/admin/integracoes/anuncios',
    '/admin/integracoes/pixel',
    '/admin/integracoes/webhook',
  ],
  
  // Shop Pro - loja online avançada
  'loja_online': ['/admin/analytics', '/admin/servicos', '/admin/checkout-avancado', '/admin/orcamentos'],
  
  // White Label - marca própria
  'white_label': [], // Não desbloqueia páginas, apenas permite logo/cores customizadas
  
  // IARC Studio - IA para Criativos
  'iarc_criativos': [
    '/admin/iarc',
    '/admin/iarc/criativos',
    '/admin/iarc/landing-pages',
    '/admin/iarc/copy-generator',
  ],
};

// Paths sempre disponíveis (não precisam de módulo)
export const ALWAYS_AVAILABLE_PATHS = [
  '/admin',
  '/admin/agendamentos',
  '/admin/equipe',
  '/admin/perfil',
  '/admin/ajuda',
];

// Mapeamento inverso: path → módulo necessário
export function getRequiredModuleForPath(path: string): string | null {
  // Verificar se é path sempre disponível
  if (ALWAYS_AVAILABLE_PATHS.some(p => path === p || path.startsWith(p + '/'))) {
    return null;
  }
  
  // Buscar módulo que desbloqueia este path
  for (const [moduleCode, paths] of Object.entries(MODULE_MENU_MAP)) {
    if (paths.some(p => path === p || path.startsWith(p + '/'))) {
      return moduleCode;
    }
  }
  
  return null;
}

// Verificar se um path está liberado dado os módulos ativos
export function isPathUnlocked(path: string, activeModules: string[]): boolean {
  const requiredModule = getRequiredModuleForPath(path);
  
  // Sem módulo necessário = sempre disponível
  if (!requiredModule) return true;
  
  // Verificar se o módulo necessário está ativo
  return activeModules.includes(requiredModule);
}

// Interface para itens de menu com informação de módulo
export interface MenuItemConfig {
  title: string;
  path: string;
  icon: string;
  requiredModule?: string;
  end?: boolean;
}

// Nomes amigáveis dos módulos (para tooltips)
export const MODULE_NAMES: Record<string, string> = {
  'dashboard_gestao': 'Command Center',
  'rastreamento_rota': 'Track Live',
  'financeiro': 'Finance Pro',
  'whatsapp_bot': 'ZapBot Pro',
  'marketing_tools': 'Growth Kit',
  'blog_seo': 'Content Engine',
  'parcerias': 'Indica+',
  'relatorios_avancados': 'Insights Pro',
  'api_access': 'Connect API',
  'loja_online': 'Shop Pro',
  'white_label': 'Sua Marca',
  'iarc_criativos': 'IARC Studio',
};
