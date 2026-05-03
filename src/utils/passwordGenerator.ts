/**
 * Gera uma senha aleatória criptograficamente segura
 * @param length Tamanho da senha (padrão: 12)
 * @returns Senha segura contendo letras maiúsculas, minúsculas, números e símbolos
 */
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  // Usar crypto.getRandomValues para aleatoriedade criptograficamente segura
  const getSecureRandomIndex = (max: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  };
  
  // Fisher-Yates shuffle com crypto.getRandomValues
  const secureShuffleArray = <T>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = getSecureRandomIndex(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Garantir que a senha contém pelo menos um de cada tipo
  let passwordChars: string[] = [];
  passwordChars.push(lowercase[getSecureRandomIndex(lowercase.length)]);
  passwordChars.push(uppercase[getSecureRandomIndex(uppercase.length)]);
  passwordChars.push(numbers[getSecureRandomIndex(numbers.length)]);
  passwordChars.push(symbols[getSecureRandomIndex(symbols.length)]);
  
  // Preencher o resto com caracteres aleatórios
  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(allChars[getSecureRandomIndex(allChars.length)]);
  }
  
  // Embaralhar a senha de forma segura usando Fisher-Yates com crypto
  const shuffled = secureShuffleArray(passwordChars);
  const password = shuffled.join('');
  
  // Validar que a senha atende aos requisitos de complexidade
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*]/.test(password);
  
  // Se por algum motivo não atender, regenerar (extremamente raro)
  if (!hasLower || !hasUpper || !hasDigit || !hasSymbol) {
    return generateSecurePassword(length);
  }
  
  return password;
}
