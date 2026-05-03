export const STATUS_COLORS = {
  pendente: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-800',
    badge: 'bg-orange-100 dark:bg-orange-900/30',
    icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    borderLeft: 'border-l-orange-500',
  },
  confirmado: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-800',
    badge: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    borderLeft: 'border-l-blue-500',
  },
  pago: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-800',
    badge: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    borderLeft: 'border-l-emerald-500',
  },
  concluido: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-800',
    badge: 'bg-green-100 dark:bg-green-900/30',
    icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    borderLeft: 'border-l-green-500',
  },
  cancelado: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-800',
    badge: 'bg-red-100 dark:bg-red-900/30',
    icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    borderLeft: 'border-l-red-500',
  },
};

export const CHART_COLORS = [
  'hsl(220, 91%, 50%)',  // Azul primário
  'hsl(38, 92%, 50%)',   // Laranja
  'hsl(142, 76%, 36%)',  // Verde
  'hsl(0, 84%, 60%)',    // Vermelho
  'hsl(271, 81%, 56%)',  // Roxo
];

export const STATUS_LABELS = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  pago: 'Pago',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};
