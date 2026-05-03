/**
 * Utilitário para normalização de telefones brasileiros
 * Remove todos os caracteres não-numéricos
 */

/**
 * Remove todos os caracteres não-numéricos de um telefone
 * @param phone - Telefone com ou sem formatação
 * @returns Telefone apenas com dígitos (ex: "31992027856")
 */
export function normalizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Valida se o telefone tem formato brasileiro válido (10 ou 11 dígitos)
 * @param phone - Telefone normalizado (apenas dígitos)
 * @returns true se válido
 */
export function isValidBrazilianPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^[0-9]{10,11}$/.test(normalized);
}

/**
 * Formata telefone brasileiro para exibição
 * @param phone - Telefone com ou sem formatação
 * @returns Telefone formatado (ex: "(31) 99202-7856")
 */
export function formatPhone(phone: string | undefined | null): string {
  const normalized = normalizePhone(phone);
  
  if (normalized.length === 11) {
    // Celular: (XX) 9XXXX-XXXX
    return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 7)}-${normalized.slice(7)}`;
  } else if (normalized.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 6)}-${normalized.slice(6)}`;
  }
  
  return normalized;
}
