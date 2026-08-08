import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="app-frame">
      <div className="app-content">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
