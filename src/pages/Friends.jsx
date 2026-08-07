import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFriends, getAllProfiles, addFriend } from '../lib/dataService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './Friends.css';

export default function Friends() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [friends, setFriends] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      const [friendsData, profilesData] = await Promise.all([
        getFriends(user.id),
        getAllProfiles(),
      ]);
      setFriends(friendsData || []);
      setAllProfiles(profilesData || []);
    } catch (err) {
      console.error('Erro ao carregar amigos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFriend(friendId) {
    if (!user) return;
    setAdding(true);
    try {
      await addFriend(user.id, friendId);
      await loadData();
      setSearchEmail('');
    } catch (err) {
      console.error('Erro ao adicionar amigo:', err);
    } finally {
      setAdding(false);
    }
  }

  // Filter profiles: not the current user, not already friends
  const filteredProfiles = allProfiles.filter((p) => {
    if (p.id === user?.id) return false;
    if (friends.some((f) => f.id === p.id)) return false;
    if (searchEmail && !p.name?.toLowerCase().includes(searchEmail.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="friends-page">
        <h1 className="page-title">Amigos</h1>
        <Card variant="warm"><p>Carregando...</p></Card>
      </div>
    );
  }

  return (
    <div className="friends-page">
      <h1 className="page-title">Amigos</h1>

      {/* My Friends */}
      <div className="friends-section">
        <h3 className="section-title">
          Minha rede ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <Card className="empty-friends-card" variant="warm">
            <div className="empty-friends-icon">🕸️</div>
            <p className="empty-friends-text">
              Sua rede está vazia. Agende um café e compartilhe o link de convite para adicionar amigos!
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate('/schedule')}>
              Agendar café
            </Button>
          </Card>
        ) : (
          <div className="friends-list">
            {friends.map((friend) => (
              <div key={friend.id} className="friend-card">
                <div className="friend-avatar" style={{ backgroundColor: friend.color || '#E07B4C' }}>
                  {friend.initial || friend.name?.charAt(0) || '?'}
                </div>
                <div className="friend-info">
                  <span className="friend-name">{friend.name}</span>
                  <span className="friend-status">Conectado</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Friend */}
      <div className="friends-section">
        <h3 className="section-title">Adicionar amigo</h3>
        <div className="friend-search">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="friend-search-input"
          />
        </div>

        {searchEmail && filteredProfiles.length > 0 && (
          <div className="friends-list">
            {filteredProfiles.slice(0, 10).map((p) => (
              <div key={p.id} className="friend-card">
                <div className="friend-avatar" style={{ backgroundColor: p.color || '#E07B4C' }}>
                  {p.initial || p.name?.charAt(0) || '?'}
                </div>
                <div className="friend-info">
                  <span className="friend-name">{p.name}</span>
                </div>
                <button
                  className="friend-add-btn"
                  onClick={() => handleAddFriend(p.id)}
                  disabled={adding}
                >
                  + Adicionar
                </button>
              </div>
            ))}
          </div>
        )}

        {searchEmail && filteredProfiles.length === 0 && (
          <p className="friend-no-results">Nenhum perfil encontrado.</p>
        )}
      </div>
    </div>
  );
}
