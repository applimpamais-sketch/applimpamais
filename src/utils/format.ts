export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
};

export const normalizePhone = (phone: string) => {
  // Remove tudo exceto números
  const cleaned = phone.replace(/\D/g, '');
  
  // Se já tem código de país (55), remove
  let numero = cleaned;
  if (numero.startsWith('55')) {
    numero = numero.substring(2);
  }
  
  // Se tem 11 dígitos (DDD + 9 + 8 dígitos), é celular com 9
  // Se tem 10 dígitos (DDD + 8 dígitos), é celular sem 9 ou fixo
  
  const ddd = numero.substring(0, 2);
  const resto = numero.substring(2);
  
  let com9digito, sem9digito;
  
  if (resto.length === 9) {
    // Já tem 9 dígitos (com o 9)
    com9digito = numero;
    sem9digito = ddd + resto.substring(1); // Remove o 9
  } else if (resto.length === 8) {
    // Tem 8 dígitos (sem o 9)
    sem9digito = numero;
    com9digito = ddd + '9' + resto; // Adiciona o 9
  } else {
    // Formato inválido, retorna como está
    return {
      original: phone,
      com9: `55${numero}`,
      sem9: `55${numero}`,
      comPrefixo: `+55${numero}`,
      variantes: [`55${numero}`, `+55${numero}`]
    };
  }
  
  return {
    original: phone,
    com9: `55${com9digito}`,
    sem9: `55${sem9digito}`,
    comPrefixo: `+55${com9digito}`,
    variantes: [
      `55${com9digito}`,
      `55${sem9digito}`,
      `+55${com9digito}`,
      `+55${sem9digito}`,
      `55${com9digito}@c.us`,
      `55${sem9digito}@c.us`
    ]
  };
};
