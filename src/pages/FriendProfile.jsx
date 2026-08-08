import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfile, getStats } from '../lib/dataService';
import Card from '../components/common/Card';
import StarRating from '../components/common/StarRating';
import './FriendProfile.css';

export default function FriendProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    try {
      const [profileData, statsData] = await Promise.all([
        getProfile(id),
        getStats(id),
      ]);
      setProfile(profileData);
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="friend-profile-page">
        <div className="fp-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        </div>
        <Card variant="warm"><p>Carregando...</p></Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="friend-profile-page">
        <div className="fp-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        </div>
        <Card variant="warm"><p>Perfil não encontrado.</p></Card>
      </div>
    );
  }

  return (
    <div className="friend-profile-page">
      <div className="fp-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      </div>

      {/* Avatar + Name */}
      <div className="fp-avatar-section">
        <div className="fp-avatar" style={{ backgroundColor: profile.color || '#E07B4C' }}>
          {profile.initial || profile.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <h2 className="fp-name">{profile.name}</h2>
      </div>

      {/* Stats */}
      <div className="fp-stats-row">
        <Card className="stat-mini-card">
          <div className="stat-mini-number">{stats?.totalMeetups || 0}</div>
          <div className="stat-mini-label">Cafés</div>
        </Card>
        <Card className="stat-mini-card">
          <div className="stat-mini-number">{stats?.averageRating > 0 ? stats.averageRating : '—'}</div>
          <div className="stat-mini-label">Média</div>
        </Card>
      </div>

      {/* Highlights */}
      <Card className="fp-highlight" variant="sage">
        <p><strong>☕ Melhor café:</strong> {stats?.favoriteSpot || '—'}</p>
        <p><strong>📍 Mais frequentado:</strong> {stats?.mostFrequented || '—'}</p>
      </Card>
    </div>
  );
}
