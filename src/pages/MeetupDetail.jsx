import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../components/common/Avatar';
import Card from '../components/common/Card';
import StarRating from '../components/common/StarRating';
import { pastMeetups, users, memoryPhotos } from '../data/mockData';
import './MeetupDetail.css';

export default function MeetupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const meetup = pastMeetups.find((m) => m.id === id);

  if (!meetup) {
    return (
      <div className="meetup-detail-page">
        <div className="detail-empty">
          <h2>Meetup not found</h2>
          <button onClick={() => navigate('/history')}>Go back</button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const categoryLabels = {
    coffee: 'Coffee quality',
    food: 'Food quality',
    atmosphere: 'Atmosphere',
    service: 'Service',
    value: 'Value for money',
  };

  return (
    <div className="meetup-detail-page">
      {/* Header with cover */}
      <div className="detail-cover" style={{ background: meetup.coverGradient }}>
        <button className="detail-back" onClick={() => navigate('/history')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-cover-content">
          <span className="detail-cover-letter">{meetup.name.charAt(0)}</span>
          <h1 className="detail-cover-name">{meetup.name}</h1>
        </div>
      </div>

      <div className="detail-body">
        {/* Date & Time */}
        <Card className="detail-info-card">
          <div className="detail-info-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(meetup.date)} · {meetup.time}</span>
          </div>
          <div className="detail-info-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{meetup.venue}, {meetup.address}</span>
          </div>
        </Card>

        {/* Attendees */}
        <div className="detail-section">
          <h3 className="detail-section-title">Attendees</h3>
          <div className="detail-attendees">
            {users
              .filter((u) => meetup.attendees.includes(u.id))
              .map((user) => (
                <div key={user.id} className="detail-attendee">
                  <Avatar user={user} size="md" checkedIn={meetup.checkedIn.includes(user.id)} showStatus />
                  <span className="detail-attendee-name">{user.name}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="detail-section">
          <h3 className="detail-section-title">Photo & Video Gallery</h3>
          <div className="memory-grid">
            {memoryPhotos.map((photo) => (
              <div
                key={photo.id}
                className="memory-photo"
                style={{ background: photo.gradient }}
              >
                <span className="memory-photo-icon">📸</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div className="detail-section">
          <h3 className="detail-section-title">Ratings</h3>
          <Card variant="warm">
            <div className="detail-overall-rating">
              <StarRating rating={meetup.rating} size="lg" showValue />
              <span className="detail-overall-label">Overall</span>
            </div>
            <div className="detail-category-ratings">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="detail-category-row">
                  <span className="detail-category-label">{label}</span>
                  <StarRating rating={meetup.categoryRatings[key]} size="sm" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Comments */}
        {meetup.comments.length > 0 && (
          <div className="detail-section">
            <h3 className="detail-section-title">Comments</h3>
            <div className="detail-comments">
              {meetup.comments.map((c, i) => {
                const commentUser = users.find((u) => u.id === c.user);
                return (
                  <Card key={i} variant="warm" className="detail-comment-card">
                    <div className="detail-comment-header">
                      <Avatar user={commentUser || users[0]} size="sm" />
                      <span className="detail-comment-author">{commentUser?.name || 'Unknown'}</span>
                    </div>
                    <p className="detail-comment-text">{c.text}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
