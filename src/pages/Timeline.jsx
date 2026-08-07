import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNextMeetup, getPastMeetups, getMeetupAverageRating } from '../lib/dataService';
import Card from '../components/common/Card';
import StarRating from '../components/common/StarRating';
import Button from '../components/common/Button';
import './Timeline.css';

export default function Timeline() {
  const navigate = useNavigate();
  const [timelineItems, setTimelineItems] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [next, past] = await Promise.all([getNextMeetup(), getPastMeetups()]);
      const items = [
        ...(next ? [{ ...next, type: 'upcoming' }] : []),
        ...past.map((m) => ({ ...m, type: 'past' })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setTimelineItems(items);

      // Load ratings
      const ratingMap = {};
      for (const item of items) {
        if (item.type === 'past') {
          const avg = await getMeetupAverageRating(item.id);
          if (avg) ratingMap[item.id] = avg;
        }
      }
      setRatings(ratingMap);
    } catch (err) {
      console.error('Error loading timeline:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="timeline-page">
        <h1 className="page-title">Linha do Tempo</h1>
        <Card className="empty-meetup-card" variant="warm"><p>Loading...</p></Card>
      </div>
    );
  }

  // Empty state
  if (timelineItems.length === 0) {
    return (
      <div className="timeline-page">
        <h1 className="page-title">Linha do Tempo</h1>
        <Card className="empty-meetup-card" variant="warm">
          <div className="empty-meetup-illustration">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="36" fill="#F0EAE2" />
              <line x1="28" y1="20" x2="28" y2="60" stroke="#DDCFBC" strokeWidth="3" strokeLinecap="round" />
              <circle cx="28" cy="30" r="6" fill="#E07B4C" opacity="0.6" />
              <circle cx="28" cy="48" r="5" fill="#C4B5A8" />
              <rect x="40" y="24" width="18" height="12" rx="4" fill="#DDCFBC" />
              <rect x="40" y="42" width="22" height="12" rx="4" fill="#DDCFBC" />
            </svg>
          </div>
          <h2 className="empty-meetup-title">Nenhum café ainda</h2>
          <p className="empty-meetup-text">
            Sua linha do tempo de cafés aparecerá aqui quando você começar a agendar. Cada xícara conta uma história!
          </p>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => navigate('/schedule')}
          >
            Começar minha linha do tempo
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="timeline-page">
      <h1 className="page-title">Linha do Tempo</h1>

      <div className="timeline-container">
        {/* Vertical Line */}
        <div className="timeline-line" />

        {/* Timeline Items */}
        <div className="timeline-items">
          {timelineItems.map((item, index) => (
            <div
              key={item.id}
              className={`timeline-item ${item.type === 'upcoming' ? 'timeline-upcoming' : ''}`}
            >
              {/* Dot */}
              <div className={`timeline-dot ${item.type === 'upcoming' ? 'dot-upcoming' : 'dot-past'}`}>
                {item.type === 'upcoming' ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <div className="dot-inner" />
                )}
              </div>

              {/* Card */}
              <Card
                className={`timeline-card ${item.type === 'upcoming' ? 'card-upcoming' : ''}`}
                gradient={item.type === 'past' ? undefined : item.coverGradient}
                onClick={() => {
                  if (item.type === 'upcoming') {
                    navigate('/today');
                  } else {
                    navigate(`/meetup/${item.id}`);
                  }
                }}
              >
                {/* Cover gradient for past meetups */}
                {item.type === 'past' && (
                  <div className="timeline-card-cover" style={{ background: item.coverGradient }}>
                    <span className="timeline-cover-letter">{item.name.charAt(0)}</span>
                  </div>
                )}

                <div className={`timeline-card-body ${item.type === 'upcoming' ? 'body-light' : ''}`}>
                  {item.type === 'upcoming' && (
                    <span className="upcoming-badge">Em breve</span>
                  )}
                  <h3 className={`timeline-card-name ${item.type === 'upcoming' ? 'name-light' : ''}`}>
                    {item.name}
                  </h3>
                  <p className={`timeline-card-date ${item.type === 'upcoming' ? 'date-light' : ''}`}>
                    {formatDate(item.date)}
                  </p>
                  {item.type === 'past' && ratings[item.id]?.overall && (
                    <div className="timeline-card-rating">
                      <StarRating rating={ratings[item.id].overall} size="sm" />
                      <span className="rating-num">{ratings[item.id].overall.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
