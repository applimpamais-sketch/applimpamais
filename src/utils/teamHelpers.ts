export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export function getRoleDescription(role: string): string {
  switch (role) {
    case 'admin':
      return 'Acesso total ao sistema, incluindo gerenciamento de equipe';
    case 'operador':
      return 'Pode gerenciar agendamentos, cupons e visualizar relatórios';
    case 'visualizador':
      return 'Apenas visualização de dados e relatórios';
    default:
      return 'Sem permissões definidas';
  }
}

export function getRolePermissions(role: string): string[] {
  switch (role) {
    case 'admin':
      return [
        'Gerenciar equipe',
        'Gerenciar agendamentos',
        'Gerenciar cupons',
        'Visualizar relatórios',
        'Acessar dashboard',
      ];
    case 'operador':
      return [
        'Gerenciar agendamentos',
        'Gerenciar cupons',
        'Visualizar relatórios',
        'Acessar dashboard',
      ];
    case 'visualizador':
      return [
        'Visualizar agendamentos',
        'Visualizar relatórios',
        'Acessar dashboard',
      ];
    default:
      return [];
  }
}
