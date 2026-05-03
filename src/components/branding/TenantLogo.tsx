import { LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenantLogoProps {
  logoUrl?: string | null;
  companyName?: string | null;
  fallback?: React.ReactNode;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

/**
 * Componente reutilizável para exibir logo do tenant ou fallback genérico.
 * Usado em páginas de auth (sem sessão) e componentes logados.
 */
export function TenantLogo({ 
  logoUrl, 
  companyName, 
  fallback, 
  className,
  showText = false,
  textClassName
}: TenantLogoProps) {
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={companyName || 'Logo'} 
        className={cn("object-contain", className)}
        onError={(e) => {
          // Se a imagem falhar, ocultar
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Fallback genérico com ícone
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LayoutDashboard className="h-10 w-10 text-primary" />
      {showText && (
        <span className={cn("font-bold text-lg", textClassName)}>Dashboard</span>
      )}
    </div>
  );
}

export default TenantLogo;
