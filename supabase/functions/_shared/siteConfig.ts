/**
 * Configuração centralizada de URLs do site.
 * Usar sempre este arquivo para links externos enviados aos usuários.
 */

const DEFAULT_SITE_DOMAIN = 'https://app.limpamais.com';
const configuredSiteDomain = Deno.env.get('SITE_DOMAIN') ?? Deno.env.get('PUBLIC_SITE_URL') ?? DEFAULT_SITE_DOMAIN;

export const SITE_DOMAIN = configuredSiteDomain.replace(/\/$/, '');

export const PARTNER_PORTAL_URL = `${SITE_DOMAIN}/parceiro`;
export const TECH_PORTAL_URL = `${SITE_DOMAIN}/tecnico`;
export const ADMIN_URL = `${SITE_DOMAIN}/admin`;

export function getPartnerLink(codigo: string): string {
  return `${SITE_DOMAIN}/p/${codigo}`;
}

export function getAdminAgendamentoLink(busca: string): string {
  return `${ADMIN_URL}/agendamentos?busca=${encodeURIComponent(busca)}`;
}
