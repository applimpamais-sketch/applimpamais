import { Outlet } from 'react-router-dom';
import ClienteSidebar from './ClienteSidebar';
import { useTenantContext } from '@/hooks/useTenantContext';

export default function ClienteLayout() {
  const { tenant } = useTenantContext();

  // Aplicar cores customizadas do tenant via CSS variables
  const corPrimaria = tenant?.cores_personalizadas?.primaria;
  const corSecundaria = tenant?.cores_personalizadas?.secundaria;
  
  const customStyles = corPrimaria ? {
    '--tenant-primary': corPrimaria,
    '--tenant-secondary': corSecundaria || corPrimaria,
  } as React.CSSProperties : {};

  return (
    <div className="flex h-screen bg-background" style={customStyles}>
      <ClienteSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
