import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNextMeetup, getCheckins, getAllProfiles, getStats } from '../lib/dataService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [nextMeetup, setNextMeetup] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [stats, setStats] = useState({ totalMeetups: 0, averageRating: 0, favoriteSpot: null, mostFrequented: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user, profile]);

  async function loadData() {
    try {
      const [meetup, profilesData, statsData] = await Promise.all([
        getNextMeetup(),
        getAllProfiles(),
        getStats(profile?.id || user?.id),
      ]);
      setNextMeetup(meetup);
      setProfiles(profilesData);
      setStats(statsData);
      if (meetup) {
        const checkinsData = await getCheckins(meetup.id);
        setCheckins(checkinsData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  const hasMeetup = nextMeetup !== null;

  const daysLeft = hasMeetup ? (() => {
    const today = new Date();
    const meetupDate = new Date(nextMeetup.date);
    const diffTime = meetupDate - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  })() : 0;

  const formattedDate = hasMeetup ? (() => {
    const date = new Date(nextMeetup.date + 'T' + (nextMeetup.time || '12:00'));
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Sao_Paulo' });
  })() : '';

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-header">
          <h1 className="home-brand">Cafezim</h1>
        </div>
        <Card className="empty-meetup-card" variant="warm">
          <p>Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-brand">Cafezim</h1>
        <div className="home-user-badge">
          <div className="avatar-placeholder">{profile?.initial || profile?.name?.charAt(0)?.toUpperCase() || '?'}</div>
        </div>
      </div>

      {hasMeetup ? (
        <Card className="next-meetup-card" variant="warm">
          <div className="next-meetup-label">PRÓXIMO CAFÉ</div>
          <h2 className="next-meetup-name">{nextMeetup.name}</h2>
          <div className="next-meetup-datetime">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formattedDate} · {nextMeetup.time?.slice(0, 5)}</span>
          </div>
          <div className="next-meetup-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{nextMeetup.venue}, {nextMeetup.address}</span>
          </div>

          <div className="next-meetup-footer">
            <div className="next-meetup-avatars">
              {profiles.slice(0, 4).map((p) => (
                <div key={p.id} className="avatar-stack-item">
                  <div className="avatar-placeholder-sm" style={{ backgroundColor: p.color }}>
                    {p.initial}
                  </div>
                </div>
              ))}
            </div>
            <div className="next-meetup-countdown">
              {daysLeft} dia{daysLeft !== 1 ? 's' : ''}
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate('/today')}>
              Ver evento
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="empty-meetup-card" variant="warm">
          <div className="empty-meetup-illustration">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="36" fill="#F0EAE2" />
              <path d="M25 50C25 42 33 35 40 35C47 35 55 42 55 50C55 62 40 72 40 72C40 72 25 62 25 50Z" fill="#DDCFBC" />
              <ellipse cx="37" cy="37" rx="4" ry="5" fill="#C4B5A8" />
              <ellipse cx="47" cy="37" rx="4" ry="5" fill="#C4B5A8" />
              <path d="M33 44C33 44 36 47 40 47C44 47 47 44 47 44" stroke="#B0A49A" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="58" cy="55" r="10" fill="white" opacity="0.8" />
              <text x="54" y="59" fontSize="11" fill="#4A3728">☕</text>
            </svg>
          </div>
          <h2 className="empty-meetup-title">Nenhum café agendado!</h2>
          <p className="empty-meetup-text">
            Reúna seus amigos e agende o primeiro café. Tudo começa com uma boa xícara.
          </p>
          <Button variant="primary" size="md" fullWidth onClick={() => navigate('/schedule')}>
            Agendar primeiro café
          </Button>
        </Card>
      )}

      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => navigate('/schedule')}>Agendar</button>
        <button className="quick-action-btn" onClick={() => navigate('/timeline')}>Linha do Tempo</button>
        <button className="quick-action-btn" onClick={() => navigate('/history')}>Histórico</button>
      </div>

      {stats.totalMeetups > 0 ? (
        <Card className="stats-banner" variant="sage">
          <div className="stats-content">
            <div className="stats-icon">☕</div>
            <div className="stats-text">
              <p className="stats-highlight">Melhor café: <strong>{stats.favoriteSpot || '—'}</strong></p>
              <p className="stats-secondary">Mais frequentado: <strong>{stats.mostFrequented || '—'}</strong></p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="stats-banner stats-banner-empty" variant="warm">
          <div className="stats-content">
            <div className="stats-icon">🌱</div>
            <div className="stats-text">
              <p className="stats-highlight">Sua jornada de cafés começa aqui</p>
              <p className="stats-secondary">Estatísticas aparecerão após seu primeiro café</p>
            </div>
          </div>
        </Card>
      )}

      <div className="stats-row">
        <Card className="stat-mini-card">
          <div className="stat-mini-number">{stats.totalMeetups}</div>
          <div className="stat-mini-label">Cafés</div>
        </Card>
        <Card className="stat-mini-card">
          <div className="stat-mini-number">{stats.averageRating > 0 ? stats.averageRating : '—'}</div>
          <div className="stat-mini-label">Média</div>
        </Card>
      </div>
    </div>
  );
}
