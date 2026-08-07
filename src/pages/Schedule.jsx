import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createMeetup, createInvitation, getFriends } from '../lib/dataService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import './Schedule.css';

export default function Schedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    shop: '',
    address: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (user) {
      getFriends(user.id).then(setFriends).catch(() => {});
    }
  }, [user]);

  const toggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Faça login primeiro.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const meetup = await createMeetup({
        name: formData.shop,
        date: formData.date,
        time: formData.time || '10:00',
        venue: formData.shop,
        address: formData.address,
        notes: formData.notes || null,
        created_by: user.id,
      });

      // Try to generate invitation link (table may not exist yet)
      try {
        const invitation = await createInvitation(meetup.id, user.id);
        const link = `${window.location.origin}/invite/${invitation.token}`;
        setInviteLink(link);
      } catch (inviteErr) {
        console.warn('Invitations table not ready:', inviteErr.message);
        // Still navigate to home - meetup was created
        navigate('/home');
        return;
      }
      setSubmitting(false);
    } catch (err) {
      console.error('Erro ao criar café:', err);
      setError(err.message || 'Erro ao criar o café');
      setSubmitting(false);
    }
  };

  const isFormValid = formData.date && formData.time && formData.shop && formData.address;

  // If invite link was generated, show success screen
  if (inviteLink) {
    return (
      <div className="schedule-page">
        <h1 className="page-title">Café agendado! ☕</h1>
        <Card className="invite-success-card" variant="warm">
          <div className="invite-success-icon">🎉</div>
          <h3>Convite gerado com sucesso!</h3>
          <p className="invite-success-text">
            Compartilhe este link com seus amigos para convidá-los:
          </p>
          <div className="invite-link-box">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="invite-link-input"
              onClick={(e) => e.target.select()}
            />
            <button
              className="invite-copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
              }}
            >
              Copiar
            </button>
          </div>
          <div className="invite-actions">
            <Button variant="primary" size="md" onClick={() => navigate('/home')}>
              Ir para o início
            </Button>
            <Button variant="secondary" size="md" onClick={() => {
              setInviteLink('');
              setFormData({ date: '', time: '', shop: '', address: '', notes: '' });
            }}>
              Agendar outro
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      <h1 className="page-title">Agendar um café</h1>

      <form onSubmit={handleSubmit} className="schedule-form stagger-children">
        {/* Date */}
        <div className="form-group">
          <label htmlFor="date">Data</label>
          <input
            id="date"
            type="date"
            placeholder="dd/mm/aaaa"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
          />
        </div>

        {/* Time */}
        <div className="form-group">
          <label htmlFor="time">Horário</label>
          <input
            id="time"
            type="time"
            placeholder="--:--"
            value={formData.time}
            onChange={(e) => handleChange('time', e.target.value)}
            required
          />
        </div>

        {/* Coffee Shop */}
        <div className="form-group">
          <label htmlFor="shop">Cafeteria</label>
          <input
            id="shop"
            type="text"
            placeholder="ex: Café com Letras"
            value={formData.shop}
            onChange={(e) => handleChange('shop', e.target.value)}
            required
          />
        </div>

        {/* Address */}
        <div className="form-group">
          <label htmlFor="address">Endereço</label>
          <input
            id="address"
            type="text"
            placeholder="Rua, cidade"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            required
          />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Observações (opcional)</label>
          <textarea
            id="notes"
            placeholder="Algo que o grupo deva saber?"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        {/* Friends selection */}
        {friends.length > 0 && (
          <div className="form-group">
            <label>Quem vai tomar um cafezim com você?</label>
            <div className="invite-chips">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  className={`invite-chip ${selectedFriends.includes(friend.id) ? 'invited' : ''}`}
                  onClick={() => toggleFriend(friend.id)}
                >
                  <div className="invite-chip-avatar" style={{ backgroundColor: friend.color || '#E07B4C' }}>
                    {friend.initial || friend.name?.charAt(0) || '?'}
                  </div>
                  <span>{friend.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Invite new friends */}
        <div className="form-group">
          <p className="invite-new-text">
            Seu amigo ainda não faz parte da comunidade? Convide-o copiando o link após agendar.
          </p>
        </div>

        {/* Reminder Notice */}
        <Card className="reminder-notice" variant="warm">
          <div className="reminder-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="reminder-text">
              Vamos lembrar todo mundo uma semana antes, um dia antes e uma hora antes do café.
            </p>
          </div>
        </Card>

        {/* Submit */}
        {error && <p className="auth-error">{error}</p>}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isFormValid || submitting}
        >
          {submitting ? 'Agendando...' : 'Agendar café'}
        </Button>
      </form>
    </div>
  );
}
