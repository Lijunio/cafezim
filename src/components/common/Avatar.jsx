import './Avatar.css';

export default function Avatar({ user, size = 'md', showStatus = false, checkedIn = false }) {
  const sizes = {
    sm: 32,
    md: 44,
    lg: 56,
    xl: 72,
  };

  const pixelSize = sizes[size] || sizes.md;

  return (
    <div className="avatar-wrapper" style={{ width: pixelSize, height: pixelSize }}>
      <div
        className={`avatar ${checkedIn ? 'avatar-checked' : ''} avatar-${size}`}
        style={{
          backgroundColor: user.color || '#E07B4C',
          width: pixelSize,
          height: pixelSize,
        }}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="avatar-img" />
        ) : (
          <span className="avatar-initial">{user.initial}</span>
        )}
      </div>
      {showStatus && (
        <span className={`avatar-status ${checkedIn ? 'status-checked' : 'status-pending'}`}>
          {checkedIn ? '✓' : ''}
        </span>
      )}
    </div>
  );
}
