import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNav.css';

const navItems = [
  { path: '/home', label: 'Início', icon: 'home' },
  { path: '/schedule', label: 'Agendar', icon: 'schedule' },
  { path: '/friends', label: 'Amigos', icon: 'friends' },
  { path: '/history', label: 'Histórico', icon: 'history' },
  { path: '/timeline', label: 'Linha do Tempo', icon: 'timeline' },
];

function Icon({ name, active }) {
  const icons = {
    home: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#E07B4C' : '#B0A49A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    schedule: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#E07B4C' : '#B0A49A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="8" cy="15" r="1.5" fill={active ? '#E07B4C' : '#B0A49A'} stroke="none" />
        <circle cx="16" cy="15" r="1.5" fill={active ? '#E07B4C' : '#B0A49A'} stroke="none" />
      </svg>
    ),
    today: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#E07B4C' : '#B0A49A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    history: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#E07B4C' : '#B0A49A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 8 14" />
        <polyline points="14 2 14 6" />
        <line x1="2" y1="14" x2="6" y2="14" />
      </svg>
    ),
    timeline: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#E07B4C' : '#B0A49A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="8" y1="18" x2="20" y2="18" />
        <circle cx="4" cy="6" r="2" fill={active ? '#E07B4C' : '#B0A49A'} stroke="none" />
        <circle cx="4" cy="12" r="2" fill={active ? '#E07B4C' : '#B0A49A'} stroke="none" />
        <circle cx="4" cy="18" r="2" fill={active ? '#E07B4C' : '#B0A49A'} stroke="none" />
      </svg>
    ),
    friends: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#E07B4C' : '#B0A49A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/today' && location.pathname.startsWith('/meetup')) ||
            (item.path === '/friends' && location.pathname === '/friends');
          return (
            <button
              key={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon name={item.icon} active={isActive} />
              <span className="bottom-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="ios-home-indicator">
        <div className="bar" />
      </div>
    </nav>
  );
}
