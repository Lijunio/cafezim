import './Card.css';

export default function Card({ children, className = '', variant = 'default', gradient, onClick, padding = true }) {
  const style = gradient ? { background: gradient } : {};

  return (
    <div
      className={`card card-${variant} ${padding ? 'card-padded' : ''} ${onClick ? 'card-clickable' : ''} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
