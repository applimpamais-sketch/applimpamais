 /**
  * Utilitários para gerenciar referência de canal interno no localStorage
  * Validade: 7 dias (canais internos têm janela menor que parceiros)
  */
 
 const STORAGE_KEYS = {
   CANAL: 'canal_origem',
   TIMESTAMP: 'canal_origem_timestamp',
 } as const;
 
 const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
 
 /**
  * Obtém o código de canal válido (não expirado)
  * Retorna null se não existir ou estiver expirado (>7 dias)
  */
 export function getValidCanalRef(): string | null {
   try {
     const canal = localStorage.getItem(STORAGE_KEYS.CANAL);
     const timestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
     
     if (!canal || !timestamp) return null;
     
     const isExpired = Date.now() - parseInt(timestamp) > SEVEN_DAYS_MS;
     
     if (isExpired) {
       clearCanalRef();
       return null;
     }
     
     return canal;
   } catch {
     return null;
   }
 }
 
 /**
  * Limpa todos os dados de referência de canal do localStorage
  */
 export function clearCanalRef(): void {
   try {
     localStorage.removeItem(STORAGE_KEYS.CANAL);
     localStorage.removeItem(STORAGE_KEYS.TIMESTAMP);
   } catch {
     // Silenciar erros de localStorage
   }
 }
 
 /**
  * Salva referência de canal no localStorage
  * Sobrescreve qualquer referência anterior (last-click attribution)
  */
 export function saveCanalRef(codigo: string): void {
   try {
     const codigoNormalized = codigo.toLowerCase().trim();
     localStorage.setItem(STORAGE_KEYS.CANAL, codigoNormalized);
     localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
     
     console.log(`[CanalRef] Referência salva: ${codigoNormalized}`);
   } catch {
     // Silenciar erros de localStorage
   }
 }
 
 /**
  * Verifica se a referência do canal ainda é válida
  */
 export function hasValidCanalRef(): boolean {
   return getValidCanalRef() !== null;
 }