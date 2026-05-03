import { Outlet } from 'react-router-dom';
import TecnicoHeader from './TecnicoHeader';
import TecnicoBottomNav from './TecnicoBottomNav';

export default function TecnicoLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TecnicoHeader />
      <main className="container mx-auto py-6 px-4 pb-28 md:pb-6">
        <Outlet />
      </main>
      <TecnicoBottomNav />
    </div>
  );
}
