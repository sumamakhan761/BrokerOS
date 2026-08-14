import React from 'react';
import { Phone } from 'lucide-react';

interface LeadHeaderEditProps {
  formData: any;
  setFormData: (data: any) => void;
  leadPhone: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 40,
  padding: '0 12px',
  background: 'var(--bg-subtle)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color var(--duration-fast)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 5,
};

export function LeadHeaderEdit({ formData, setFormData, leadPhone }: LeadHeaderEditProps) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).style.borderColor = 'var(--brand-400)';
    (e.target as HTMLInputElement).style.background = 'var(--bg-surface)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).style.borderColor = 'var(--border-default)';
    (e.target as HTMLInputElement).style.background = 'var(--bg-subtle)';
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
      animation: 'enter 300ms var(--ease-out-expo) both',
      marginRight: 48,
    }}>
      <div>
        <label style={labelStyle}>First Name</label>
        <input
          style={inputStyle}
          value={formData.firstName}
          onChange={e => setFormData({ ...formData, firstName: e.target.value })}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="First name"
        />
      </div>
      <div>
        <label style={labelStyle}>Last Name</label>
        <input
          style={inputStyle}
          value={formData.lastName}
          onChange={e => setFormData({ ...formData, lastName: e.target.value })}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Last name"
        />
      </div>
      <div>
        <label style={labelStyle}>Email Address</label>
        <input
          type="email"
          style={inputStyle}
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="email@example.com"
        />
      </div>
      <div>
        <label style={labelStyle}>Preferred Location</label>
        <input
          style={inputStyle}
          value={formData.preferredLocation}
          onChange={e => setFormData({ ...formData, preferredLocation: e.target.value })}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="e.g. Bandra"
        />
      </div>

      {/* Read-only phone */}
      <div style={{ gridColumn: '1 / -1' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <Phone size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{leadPhone}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>— phone cannot be changed</span>
        </div>
      </div>
    </div>
  );
}
