import { Outlet } from 'react-router-dom';
import ProtectedParceiroRoute from './ProtectedParceiroRoute';
import ParceiroLayout from './ParceiroLayout';

export default function ParceiroProtectedLayout() {
  return (
    <ProtectedParceiroRoute>
      <ParceiroLayout>
        <Outlet />
      </ParceiroLayout>
    </ProtectedParceiroRoute>
  );
}
