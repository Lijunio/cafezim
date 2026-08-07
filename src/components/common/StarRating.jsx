import './StarRating.css';

export default function StarRating({ rating = 0, maxStars = 5, size = 'md', showValue = false, interactive = false, onChange }) {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const filled = rating >= i;
    const halfFilled = !filled && rating >= i - 0.5;

    stars.push(
      <button
        key={i}
        className={`star ${filled ? 'star-filled' : ''} ${halfFilled ? 'star-half' : ''} star-${size} ${interactive ? 'star-interactive' : ''}`}
        onClick={interactive && onChange ? () => onChange(i) : undefined}
        type="button"
        tabIndex={interactive ? 0 : -1}
        aria-label={`${i} star${i > 1 ? 's' : ''}`}
      >
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="star-rating">
      <div className="star-rating-stars">{stars}</div>
      {showValue && <span className="star-rating-value">{rating.toFixed(1)}</span>}
    </div>
  );
}
