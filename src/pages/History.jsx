import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPastMeetups, getMeetupAverageRating } from '../lib/dataService';
import Card from '../components/common/Card';
import StarRating from '../components/common/StarRating';
import './History.css';

export default function History() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [pastMeetups, setPastMeetups] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetups();
  }, []);

  async function loadMeetups() {
    try {
      const meetups = await getPastMeetups();
      setPastMeetups(meetups);
      // Load ratings for each meetup
      const ratingMap = {};
      for (const m of meetups) {
        const avg = await getMeetupAverageRating(m.id);
        if (avg) ratingMap[m.id] = avg;
      }
      setRatings(ratingMap);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }

  const years = ['All', ...new Set(pastMeetups.map((m) => m.year))].sort((a, b) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    return b - a;
  });

  const filtered = pastMeetups.filter((m) => {
    const matchesSearch = m.venue.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || m.year === parseInt(filter);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="history-page">
      <h1 className="page-title">Cafés passados</h1>

      {/* Search */}
      <div className="history-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por cafeteria"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="history-search-input"
        />
      </div>

      {/* Filter Pills */}
      <div className="filter-pills">
        {years.map((year) => (
          <button
            key={year}
            className={`filter-pill ${filter === String(year) ? 'active' : ''}`}
            onClick={() => setFilter(String(year))}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Meetup Cards */}
      <div className="history-list stagger-children">
        {loading ? (
          <div className="history-empty"><p>Loading...</p></div>
        ) : filtered.length === 0 ? (
          <div className="history-empty">
            <div className="empty-blob">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#F0EAE2" />
                <circle cx="22" cy="28" r="5" fill="#DDCFBC" />
                <circle cx="42" cy="28" r="5" fill="#DDCFBC" />
                <path d="M22 40C22 40 28 44 34 40" stroke="#C4B5A8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <p className="empty-text">Nenhum café encontrado</p>
            <p className="empty-subtext">Tente outra busca ou filtro</p>
          </div>
        ) : (
          filtered.map((meetup) => (
            <Card
              key={meetup.id}
              className="history-card"
              onClick={() => navigate(`/meetup/${meetup.id}`)}
            >
              <div className="history-card-cover" style={{ background: meetup.coverGradient }}>
                <div className="cover-overlay">
                  <span className="cover-initial">{meetup.name.charAt(0)}</span>
                </div>
              </div>
              <div className="history-card-body">
                <h3 className="history-card-name">{meetup.name}</h3>
                <p className="history-card-date">{formatDate(meetup.date)}</p>
                <div className="history-card-rating">
                  <StarRating rating={ratings[meetup.id]?.overall || 0} size="sm" />
                  <span className="rating-number">{ratings[meetup.id]?.overall?.toFixed(1) || '—'}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
