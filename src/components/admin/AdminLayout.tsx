import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import MobileNav from './MobileNav';
import { PushNotificationManager } from './PushNotificationManager';
import { MobileOptimizations } from './MobileOptimizations';
import { OneSignalInit } from './OneSignalInit';
import OnboardingProvider from '@/components/onboarding/OnboardingProvider';

export default function AdminLayout() {
  return (
    <OnboardingProvider>
      {/* Componentes exclusivos da área admin */}
      <PushNotificationManager />
      <MobileOptimizations />
      <OneSignalInit />
      
      <div className="flex h-screen overflow-hidden w-full bg-gradient-to-br from-background via-background to-muted/20">
        {/* Sidebar Desktop */}
        <Sidebar className="hidden md:flex" />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-muted/5 to-muted/10">
            <Outlet />
          </main>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileNav className="md:hidden" />
      </div>
    </OnboardingProvider>
  );
}
