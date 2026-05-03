/**
 * Configuração centralizada de URLs do site
 * Usar sempre este arquivo para links externos enviados aos usuários
 * 
 * ⚠️ IMPORTANTE: Alterar APENAS aqui para mudar o domínio em todos os lugares
 */

export const SITE_DOMAIN = 'https://rclimpamais.com.br';

// URLs de portais específicos
export const PARTNER_PORTAL_URL = `${SITE_DOMAIN}/parceiro`;
export const TECH_PORTAL_URL = `${SITE_DOMAIN}/tecnico`;
export const ADMIN_URL = `${SITE_DOMAIN}/admin`;

/**
 * Gera link de indicação de parceiro
 * @param codigo Código do parceiro (ex: MARIA10)
 * @returns URL completa (ex: https://rclimpamais.com.br/p/MARIA10)
 */
export function getPartnerLink(codigo: string): string {
  return `${SITE_DOMAIN}/p/${codigo}`;
}

/**
 * Gera link para admin com busca
 * @param busca Termo de busca (order_code, nome, etc)
 * @returns URL do admin com query param
 */
export function getAdminAgendamentoLink(busca: string): string {
  return `${ADMIN_URL}/agendamentos?busca=${encodeURIComponent(busca)}`;
}
