import React from 'react';
import { Card } from '@/components/ui/Card';
import { Phone, MapPin, ClipboardList, CheckCircle, User, History } from 'lucide-react';

interface CallRecordingsCardProps {
  lead: any;
}

export function CallRecordingsCard({ lead }: CallRecordingsCardProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

  // Gather all events from the lead object
  const events: any[] = [];

  if (lead.createdAt) {
    events.push({
      id: 'created-' + lead.id,
      type: 'CREATED',
      date: new Date(lead.createdAt),
      title: 'Lead Created',
      description: `Lead was added to the CRM.`,
      icon: User,
      dotColor: 'var(--success-fg)',
      dotBg: 'var(--success-bg)',
      dotBorder: '#86efac',
    });
  }

  if (lead.callRecords) {
    lead.callRecords.forEach((call: any) => {
      events.push({
        id: 'call-' + call.id,
        type: 'CALL',
        date: new Date(call.startedAt),
        title: 'Outgoing Call',
        description: call.aiSummary || 'No summary available.',
        data: call,
        icon: Phone,
        dotColor: 'var(--info-fg)',
        dotBg: 'var(--info-bg)',
        dotBorder: '#7dd3fc',
      });
    });
  }

  if (lead.siteVisits) {
    lead.siteVisits.forEach((sv: any) => {
      events.push({
        id: 'sv-' + sv.id,
        type: 'SITE_VISIT',
        date: new Date(sv.scheduledDate),
        title: `Site Visit — ${sv.status}`,
        description: sv.project ? `Scheduled for project: ${sv.project.name}` : 'Site visit scheduled.',
        data: sv,
        icon: MapPin,
        dotColor: '#6d28d9',
        dotBg: '#faf5ff',
        dotBorder: '#ddd6fe',
      });
    });
  }

  if (lead.followUps) {
    lead.followUps.forEach((fu: any) => {
      events.push({
        id: 'fu-' + fu.id,
        type: 'FOLLOW_UP',
        date: new Date(fu.scheduledDate),
        title: `Follow-up — ${fu.status}`,
        description: fu.notes || 'Follow-up scheduled.',
        data: fu,
        icon: ClipboardList,
        dotColor: 'var(--warning-fg)',
        dotBg: 'var(--warning-bg)',
        dotBorder: '#fcd34d',
      });
    });
  }

  if (lead.customer?.bookings) {
    lead.customer.bookings.forEach((booking: any) => {
      events.push({
        id: 'booking-' + booking.id,
        type: 'BOOKING',
        date: new Date(booking.createdAt),
        title: `Booking — ${booking.status}`,
        description: booking.unit ? `Unit booked: ${booking.unit.unitNumber}` : 'Booking created.',
        data: booking,
        icon: CheckCircle,
        dotColor: '#be185d',
        dotBg: '#fdf2f8',
        dotBorder: '#f9a8d4',
      });
    });
  }

  // Sort events by date descending
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Card className="p-0 flex flex-col mb-8 shadow-sm">
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
      }}>
        <History style={{ width: 16, height: 16, color: 'var(--brand-600)' }} />
        <h3 style={{
          margin: 0,
          fontSize: 'var(--text-base)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          History &amp; Timeline
        </h3>
      </div>

      <div style={{ padding: '24px 24px 24px 32px' }}>
        {events.length === 0 ? (
          /* Empty state */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            padding: '32px 0',
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <History style={{ width: 24, height: 24, color: 'var(--text-muted)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                No history yet
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Events like calls, site visits, and notes will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            position: 'relative',
            borderLeft: '2px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            paddingBottom: 8,
          }}>
            {events.map((event) => (
              <TimelineEvent key={event.id} event={event} apiUrl={apiUrl} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function TimelineEvent({ event, apiUrl }: { event: any; apiUrl: string }) {
  const [hovered, setHovered] = React.useState(false);
  const Icon = event.icon;

  return (
    <div
      style={{ position: 'relative', paddingLeft: 28 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Timeline dot */}
      <div style={{
        position: 'absolute',
        left: -20,
        top: 10,
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: event.dotBg,
        border: `2px solid ${event.dotBorder}`,
        boxShadow: 'var(--shadow-sm)',
        color: event.dotColor,
        flexShrink: 0,
      }}>
        <Icon style={{ width: 16, height: 16 }} />
      </div>

      {/* Event content card */}
      <div style={{
        background: 'var(--bg-surface)',
        padding: '14px 16px',
        borderRadius: 'var(--radius-lg)',
        border: hovered ? '1px solid var(--border-default)' : '1px solid var(--border-subtle)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-xs)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all var(--duration-base) var(--ease-out-expo)',
      }}>
        {/* Title + date row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 8,
        }}>
          <h4 style={{
            margin: 0,
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            {event.title}
          </h4>
          <span style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            color: 'var(--text-muted)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-md)',
            whiteSpace: 'nowrap',
          }}>
            {event.date.toLocaleString()}
          </span>
        </div>

        {/* Content */}
        {event.type === 'CALL' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {event.data.recordingUrl ? (
              <audio
                controls
                src={event.data.recordingUrl.startsWith('/') ? `${apiUrl}${event.data.recordingUrl}` : event.data.recordingUrl}
                style={{ height: 36, width: '100%', maxWidth: 320, marginTop: 4, borderRadius: 'var(--radius-md)' }}
              />
            ) : (
              <span style={{
                display: 'inline-block',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                padding: '3px 8px',
                background: 'var(--danger-bg)',
                color: 'var(--danger-fg)',
                border: '1px solid #fca5a5',
                borderRadius: 'var(--radius-md)',
                width: 'fit-content',
              }}>
                Missed / Unrecorded
              </span>
            )}
            {event.data.aiSummary && (
              <div style={{
                background: 'var(--brand-50)',
                border: '1px solid var(--brand-200)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
              }}>
                <p style={{
                  margin: '0 0 4px',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--brand-600)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <svg style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Summary
                </p>
                <p style={{
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.55,
                }}>
                  {event.data.aiSummary}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p style={{
            margin: 0,
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
          }}>
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}
