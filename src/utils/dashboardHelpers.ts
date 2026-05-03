import React from 'react';
import { Armchair, Sofa, Package, Sparkles, Home } from 'lucide-react';

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatPercentage(value: number): string {
  const formatted = Math.abs(value).toFixed(1);
  return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
}

export function getStatusVariant(status: string) {
  const variants: Record<string, any> = {
    pendente: 'warning',
    confirmado: 'default',
    concluido: 'success',
    cancelado: 'destructive',
  };
  return variants[status] || 'default';
}

export function getServiceIcon(serviceName: string | undefined | null): React.ReactNode | string {
  if (!serviceName) return '✨';
  const name = serviceName.toLowerCase();
  const iconClass = "h-5 w-5 text-muted-foreground";
  
  // Para uso em TopRankingCard, retornar emoji
  if (name.includes('sofá') || name.includes('sofa')) return '🛋️';
  if (name.includes('colchão') || name.includes('colchao')) return '🛏️';
  if (name.includes('cadeira')) return '🪑';
  if (name.includes('tapete')) return '🧶';
  if (name.includes('cortina')) return '🪟';
  if (name.includes('carpete')) return '📐';
  if (name.includes('estofado')) return '🛋️';
  if (name.includes('box')) return '🛏️';
  if (name.includes('puff')) return '💺';
  if (name.includes('carrinho')) return '👶';
  if (name.includes('carro') || name.includes('veículo') || name.includes('veiculo')) return '🚗';
  if (name.includes('kit')) return '📦';
  if (name.includes('combo')) return '🎁';
  if (name.includes('poltrona')) return '🪑';
  if (name.includes('limpeza')) return '✨';
  
  return '✨';
}
