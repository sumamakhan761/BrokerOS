import React, { useState } from "react";
import { ClipboardList, Calendar, PhoneForwarded, ChevronRight } from "lucide-react";

export function SourcingManagerTasks({ dashData }: { dashData: any }) {
  const [activeTab, setActiveTab] = useState<"MEETINGS" | "FOLLOW_UPS">("MEETINGS");

  const todayMeetings = dashData.todayMeetingList || [];
  const followUps = dashData.todayFollowUpList || [];

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden"
    }}>
      <div style={{ padding: "24px 24px 0" }}>
        <h3 style={{
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: 0
        }}>
          <ClipboardList size={18} style={{ color: "var(--brand-500)" }} /> Daily Tasks
        </h3>
        <p style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text-muted)",
          marginTop: 4,
          marginBottom: 0
        }}>Manage your meetings and follow-ups with brokers</p>
      </div>

      <div style={{
        display: "flex",
        padding: "20px 24px 0",
        gap: 24,
        borderBottom: "1px solid var(--border-subtle)",
        overflowX: "auto",
      }} className="no-scrollbar">
        {[
          { id: "MEETINGS", label: `Meetings (${todayMeetings.length})`, color: "var(--brand-600)" },
          { id: "FOLLOW_UPS", label: `Follow-ups (${followUps.length})`, color: "#059669" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              paddingBottom: 12,
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              whiteSpace: "nowrap",
              color: activeTab === tab.id ? tab.color : "var(--text-tertiary)",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : "3px solid transparent",
              cursor: "pointer",
              transition: "color 150ms ease"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 24, maxHeight: 400 }}>
        {activeTab === "MEETINGS" && (
          <ListMeetings items={todayMeetings} emptyMsg="No meetings scheduled for today." iconColor="var(--brand-600)" iconBg="var(--brand-50)" />
        )}
        {activeTab === "FOLLOW_UPS" && (
          <ListFollowUps items={followUps} emptyMsg="No follow-ups scheduled for today." />
        )}
      </div>
    </div>
  );
}

function ListMeetings({ items, emptyMsg, iconColor, iconBg }: { items: any[], emptyMsg: string, iconColor: string, iconBg: string }) {
  if (items.length === 0) {
    return (
      <div style={{
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        color: "var(--text-muted)",
        textAlign: "center",
        padding: "32px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8
      }}>
        <Calendar size={32} style={{ color: "var(--bg-subtle)", opacity: 0.8 }} />
        {emptyMsg}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((meeting) => (
        <div key={meeting.id} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          transition: "background 150ms ease, box-shadow 150ms ease"
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <Calendar size={18} style={{ color: iconColor }} />
            </div>
            <div>
              <div style={{
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}>
                Broker: {meeting.broker?.name || "Unknown"}
              </div>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <span style={{
                  background: "var(--bg-subtle)",
                  color: "var(--text-secondary)",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Scheduled
                </span>
                <span>•</span>
                <span>{new Date(meeting.scheduledDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>
          <button style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            background: "transparent",
            border: "none",
            cursor: "pointer"
          }}>
            <ChevronRight size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

function ListFollowUps({ items, emptyMsg }: { items: any[], emptyMsg: string }) {
  if (items.length === 0) {
    return (
      <div style={{
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        color: "var(--text-muted)",
        textAlign: "center",
        padding: "32px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8
      }}>
        <PhoneForwarded size={32} style={{ color: "var(--bg-subtle)", opacity: 0.8 }} />
        {emptyMsg}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((fup) => (
        <div key={fup.id} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          transition: "background 150ms ease"
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <PhoneForwarded size={18} style={{ color: "#10b981" }} />
            </div>
            <div>
              <div style={{
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}>
                Broker: {fup.broker?.name || "Unknown"}
              </div>
              <div style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--text-muted)",
                marginTop: 4,
              }}>
                Scheduled: {new Date(fup.scheduledDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            </div>
          </div>
          <button style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            background: "transparent",
            border: "none",
            cursor: "pointer"
          }}>
            <ChevronRight size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
