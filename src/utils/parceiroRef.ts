/**
 * Utilitários para gerenciar referência de parceiro no localStorage
 * Validade: 30 dias
 */

const STORAGE_KEYS = {
  REF: 'parceiro_ref',
  TIMESTAMP: 'parceiro_ref_timestamp',
  CUPOM: 'parceiro_cupom',
} as const;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Obtém o código de parceiro válido (não expirado)
 * Retorna null se não existir ou estiver expirado (>30 dias)
 */
export function getValidParceiroRef(): string | null {
  try {
    const ref = localStorage.getItem(STORAGE_KEYS.REF);
    const timestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
    
    if (!ref || !timestamp) return null;
    
    const isExpired = Date.now() - parseInt(timestamp) > THIRTY_DAYS_MS;
    
    if (isExpired) {
      clearParceiroRef();
      return null;
    }
    
    return ref;
  } catch {
    return null;
  }
}

/**
 * Obtém o cupom vinculado ao parceiro (se existir e não expirado)
 */
export function getValidParceiroCupom(): string | null {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
    
    if (!timestamp) return null;
    
    const isExpired = Date.now() - parseInt(timestamp) > THIRTY_DAYS_MS;
    
    if (isExpired) {
      clearParceiroRef();
      return null;
    }
    
    return localStorage.getItem(STORAGE_KEYS.CUPOM);
  } catch {
    return null;
  }
}

/**
 * Limpa todos os dados de referência de parceiro do localStorage
 */
export function clearParceiroRef(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.REF);
    localStorage.removeItem(STORAGE_KEYS.TIMESTAMP);
    localStorage.removeItem(STORAGE_KEYS.CUPOM);
  } catch {
    // Silenciar erros de localStorage
  }
}

/**
 * Salva referência de parceiro no localStorage
 * Sobrescreve qualquer referência anterior (last-click attribution)
 */
export function saveParceiroRef(codigo: string, cupom?: string): void {
  try {
    const codigoUpper = codigo.toUpperCase();
    localStorage.setItem(STORAGE_KEYS.REF, codigoUpper);
    localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
    
    if (cupom) {
      localStorage.setItem(STORAGE_KEYS.CUPOM, cupom);
    } else {
      // Limpar cupom anterior se novo link não tem cupom
      localStorage.removeItem(STORAGE_KEYS.CUPOM);
    }
    
    console.log(`[ParceiroRef] Referência salva: ${codigoUpper}${cupom ? `, cupom: ${cupom}` : ''}`);
  } catch {
    // Silenciar erros de localStorage
  }
}

/**
 * Obtém o código base do parceiro (antes do hífen)
 * Ex: "MARIA10-SOFA" -> "MARIA10"
 */
export function getParceiroBaseCode(codigo: string): string {
  return codigo.toUpperCase().split('-')[0];
}

/**
 * Verifica se a referência do parceiro ainda é válida
 */
export function hasValidParceiroRef(): boolean {
  return getValidParceiroRef() !== null;
}
