import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNextMeetup, getCheckins, checkIn, undoCheckIn, getPhotos, getMeetupAverageRating, submitRating, getMyRating } from '../lib/dataService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import StarRating from '../components/common/StarRating';
import './TodayMeetup.css';

export default function TodayMeetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meetup, setMeetup] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetup();
  }, []);

  async function loadMeetup() {
    try {
      const m = await getNextMeetup();
      setMeetup(m);
      if (m) {
        const [c, p, avg, my] = await Promise.all([
          getCheckins(m.id),
          getPhotos(m.id),
          getMeetupAverageRating(m.id),
          user ? getMyRating(m.id, user.id) : null,
        ]);
        setCheckins(c);
        setPhotos(p);
        setAverageRating(avg);
        if (my) {
          setMyRating(my);
          setRatings({ coffee: my.coffee, food: my.food, atmosphere: my.atmosphere, service: my.service, value: my.value });
          setComment(my.comment || '');
          setSubmitted(true);
        }
      }
    } catch (err) {
      console.error('Error loading meetup:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="today-page">
        <div className="today-header">
          <button className="back-btn" onClick={() => navigate('/home')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="today-title">Today's Meetup</h1>
          <div style={{ width: 24 }} />
        </div>
        <Card className="empty-meetup-card" variant="warm"><p>Loading...</p></Card>
      </div>
    );
  }

  if (!meetup) {
    return (
      <div className="today-page">
        <div className="today-header">
          <button className="back-btn" onClick={() => navigate('/home')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="today-title">Today's Meetup</h1>
          <div style={{ width: 24 }} />
        </div>
        <Card className="empty-meetup-card" variant="warm">
          <div className="empty-meetup-illustration">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="36" fill="#F0EAE2" />
              <rect x="20" y="22" width="40" height="36" rx="4" fill="#DDCFBC" />
              <line x1="28" y1="30" x2="52" y2="30" stroke="#C4B5A8" strokeWidth="2" strokeLinecap="round" />
              <line x1="28" y1="37" x2="48" y2="37" stroke="#C4B5A8" strokeWidth="2" strokeLinecap="round" />
              <line x1="28" y1="44" x2="44" y2="44" stroke="#C4B5A8" strokeWidth="2" strokeLinecap="round" />
              <circle cx="55" cy="58" r="10" fill="white" opacity="0.8" />
              <text x="51" y="62" fontSize="11" fill="#4A3728">📅</text>
            </svg>
          </div>
          <h2 className="empty-meetup-title">Nenhum café agendado</h2>
          <p className="empty-meetup-text">Você ainda não marcou seu próximo café. Reúna o grupo e escolha uma data!</p>
          <Button variant="primary" size="md" fullWidth onClick={() => navigate('/schedule')}>Agendar um café</Button>
        </Card>
      </div>
    );
  }

  const handleCheckIn = async () => {
    if (!user) return;
    const alreadyChecked = checkins.some((c) => c.user_id === user.id);
    try {
      if (alreadyChecked) {
        await undoCheckIn(meetup.id, user.id);
        setCheckins((prev) => prev.filter((c) => c.user_id !== user.id));
      } else {
        const newCheckin = await checkIn(meetup.id, user.id);
        setCheckins((prev) => [...prev, newCheckin]);
      }
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  const isCheckedIn = user && checkins.some((c) => c.user_id === user.id);

  const handleRatingChange = (category, value) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmitRating = async () => {
    if (!user) return;
    try {
      await submitRating(meetup.id, user.id, { ...ratings, comment });
      setSubmitted(true);
      setShowRating(false);
      const avg = await getMeetupAverageRating(meetup.id);
      setAverageRating(avg);
    } catch (err) {
      console.error('Rating error:', err);
    }
  };

  const allRated = Object.keys(ratings).length >= 5;
  const now = new Date();
  const meetupDateTime = meetup ? new Date(meetup.date + 'T' + (meetup.time || '12:00')) : null;
  const eventStarted = meetupDateTime && now >= meetupDateTime;

  const formatMeetupDate = () => {
    const date = new Date(meetup.date + 'T' + (meetup.time || '12:00'));
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Sao_Paulo' });
  };

  return (
    <div className="today-page">
      <div className="today-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="today-title">{meetup.name}</h1>
        <div style={{ width: 24 }} />
      </div>

      <p className="today-datetime">{formatMeetupDate()} · {meetup.time?.slice(0, 5)}</p>

      {/* Location */}
      <Card className="location-card">
        <div className="location-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="location-text">{meetup.venue}, {meetup.address}</span>
        </div>
      </Card>

      {/* Notes */}
      {meetup.notes && (
        <Card className="notes-card" variant="sage">
          <p className="notes-text">{meetup.notes}</p>
        </Card>
      )}

      {/* Check-in */}
      <div className="section">
        <h3 className="section-title">Check-in</h3>
        <div className="checkin-count">{checkins.length} confirmados</div>
        <div className="checkin-list">
          {checkins
            .filter((c) => c.user_id !== user?.id)
            .map((c) => (
              <div key={c.user_id} className="checkin-item checked">
                <div className="checkin-avatar checkin-avatar-done" style={{ backgroundColor: c.profiles?.color || '#E07B4C' }}>
                  {c.profiles?.initial || '?'}
                </div>
                <div className="checkin-info">
                  <span className="checkin-name">{c.profiles?.name || 'Amigo'}</span>
                  <span className="checkin-status status-done">Confirmado</span>
                </div>
                <span className="checkin-check">✓</span>
              </div>
            ))}
          {user && (
            <div
              className={`checkin-item ${isCheckedIn ? 'checked' : ''} is-you`}
              onClick={handleCheckIn}
            >
              <div className={`checkin-avatar ${isCheckedIn ? 'checkin-avatar-done' : ''}`} style={{ backgroundColor: '#E07B4C' }}>
                {profile?.initial || profile?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="checkin-info">
                <span className="checkin-name">{isCheckedIn ? 'Você' : 'Você'}</span>
                <span className={`checkin-status ${isCheckedIn ? 'status-done' : 'status-tap'}`}>
                  {isCheckedIn ? 'Confirmado' : 'Toque para confirmar'}
                </span>
              </div>
              {isCheckedIn && <span className="checkin-check">✓</span>}
            </div>
          )}
        </div>
      </div>

      {/* Memory Album */}
      <div className="section">
        <h3 className="section-title">Álbum de memórias</h3>
        <div className="memory-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="memory-photo" style={{ backgroundImage: `url(${photo.url})`, backgroundSize: 'cover' }}>
            </div>
          ))}
          <button className="memory-add-btn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Average Rating Display */}
      {averageRating && (
        <div className="section">
          <h3 className="section-title">Média das avaliações</h3>
          <Card variant="warm">
            <div className="detail-overall-rating">
              <StarRating rating={averageRating.overall} size="lg" showValue />
              <span className="detail-overall-label">Overall</span>
            </div>
          </Card>
        </div>
      )}

      {/* Rate Button — only after event starts */}
      <div className="today-actions">
        {eventStarted ? (
          <Button variant="secondary" size="md" fullWidth onClick={() => setShowRating(!showRating)}>
            {submitted ? '✓ Avaliação enviada' : 'Avaliar esta cafeteria'}
          </Button>
        ) : (
          <p className="rating-locked">⏳ Avaliação disponível após o café</p>
        )}
      </div>

      {/* Rating Form */}
      {showRating && !submitted && (
        <Card className="rating-form animate-slide-up">
          <h4 className="rating-form-title">Como foi sua experiência?</h4>
          {[
            { key: 'coffee', label: 'Qualidade do café' },
            { key: 'food', label: 'Qualidade da comida' },
            { key: 'atmosphere', label: 'Ambiente' },
            { key: 'service', label: 'Atendimento' },
            { key: 'value', label: 'Custo-benefício' },
          ].map(({ key, label }) => (
            <div key={key} className="rating-row">
              <span className="rating-row-label">{label}</span>
              <StarRating rating={ratings[key] || 0} interactive onChange={(val) => handleRatingChange(key, val)} size="sm" />
            </div>
          ))}
          <div className="rating-comment">
            <label htmlFor="comment">Comentários e observações</label>
            <textarea id="comment" placeholder="Compartilhe o que achou..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
          </div>
          <Button variant="primary" size="md" fullWidth onClick={handleSubmitRating} disabled={!allRated}>Enviar avaliação</Button>
        </Card>
      )}
    </div>
  );
}
