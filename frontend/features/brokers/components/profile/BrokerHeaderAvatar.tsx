import React from 'react';

interface BrokerHeaderAvatarProps {
  broker: any;
}

export function BrokerHeaderAvatar({ broker }: BrokerHeaderAvatarProps) {
  const initials = broker.name
    ? broker.name
        .split(' ')
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: broker.profilePhotoUrl
            ? 'transparent'
            : 'linear-gradient(135deg, var(--brand-500) 0%, #a855f7 100%)',
          border: '3px solid var(--bg-surface)',
          boxShadow: '0 0 0 2px var(--brand-200), var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {broker.profilePhotoUrl ? (
          <img
            src={broker.profilePhotoUrl}
            alt="Broker Avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}
