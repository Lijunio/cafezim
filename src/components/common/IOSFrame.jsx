import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import './IOSFrame.css';

export default function IOSFrame() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  return (
    <div className="app-frame">
      <div className="ios-status-bar">
        <span className="time">{hours}:{minutes}</span>
        <span className="icons">
          <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
            <rect x="0" y="5" width="2" height="6" rx="0.5" />
            <rect x="3" y="3.5" width="2" height="7.5" rx="0.5" />
            <rect x="6" y="2" width="2" height="9" rx="0.5" />
            <rect x="9" y="0" width="2" height="11" rx="0.5" />
          </svg>
          <svg width="24" height="11" viewBox="0 0 24 11" fill="currentColor">
            <rect x="0" y="0" width="21" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="2" y="2" width="15" height="7" rx="1" fill="currentColor" />
            <rect x="22.5" y="3" width="1.5" height="5" rx="0.75" fill="currentColor" />
          </svg>
        </span>
      </div>
      <div className="app-content">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
