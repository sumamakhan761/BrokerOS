import React, { useState } from "react";
import { DashboardData } from "../types";
import { ClipboardList, MapPin, PhoneForwarded, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export function SalesExecTasks({ dashData }: { dashData: DashboardData }) {
  const [activeTab, setActiveTab] = useState<"TODAY_SV" | "BACKLOG_SV" | "FOLLOW_UPS">("TODAY_SV");

  const todaySVs = dashData.todaySiteVisitList;
  const backlogSVs = dashData.backlogSiteVisitList;
  const followUps = [...dashData.missedFollowUpBacklog, ...dashData.todayFollowUpList];

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
          <ClipboardList size={18} style={{ color: "var(--brand-500)" }} /> Daily Tasks & Backlog
        </h3>
        <p style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text-muted)",
          marginTop: 4,
          marginBottom: 0
        }}>Manage your site visits and follow-ups</p>
      </div>

      <div style={{
        display: "flex",
        padding: "20px 24px 0",
        gap: 24,
        borderBottom: "1px solid var(--border-subtle)",
        overflowX: "auto",
      }} className="no-scrollbar">
        {[
          { id: "TODAY_SV", label: `Today's SVs (${todaySVs.length})`, color: "var(--brand-600)" },
          { id: "BACKLOG_SV", label: `SV Backlog (${backlogSVs.length})`, color: "#e11d48" },
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
        {activeTab === "TODAY_SV" && (
          <ListSVs items={todaySVs} emptyMsg="No site visits scheduled for today." iconColor="var(--brand-600)" iconBg="var(--brand-50)" />
        )}
        {activeTab === "BACKLOG_SV" && (
          <ListSVs items={backlogSVs} emptyMsg="No backlog site visits. Great job!" isBacklog iconColor="#e11d48" iconBg="#fff1f2" />
        )}
        {activeTab === "FOLLOW_UPS" && (
          <ListFollowUps items={followUps} emptyMsg="No follow-ups scheduled for today." />
        )}
      </div>
    </div>
  );
}

function ListSVs({ items, emptyMsg, isBacklog = false, iconColor, iconBg }: { items: any[], emptyMsg: string, isBacklog?: boolean, iconColor: string, iconBg: string }) {
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
        <MapPin size={32} style={{ color: "var(--bg-subtle)", opacity: 0.8 }} />
        {emptyMsg}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((sv) => (
        <Link
          href={`/dashboard/sales-executive/lead-management/${sv.lead.id}`}
          key={sv.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            textDecoration: "none",
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
              <MapPin size={18} style={{ color: iconColor }} />
            </div>
            <div>
              <div style={{
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                {sv.lead.firstName} {sv.lead.lastName}
                {isBacklog && (
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#e11d48",
                    background: "#fff1f2",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    <AlertCircle size={12} /> Missed
                  </span>
                )}
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
                  {sv.project?.name || 'Unknown Project'}
                </span>
                <span>•</span>
                <span>{new Date(sv.scheduledDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
          }}>
            <ChevronRight size={18} />
          </div>
        </Link>
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
        <Link
          href={`/dashboard/sales-executive/lead-management/${fup.lead.id}`}
          key={fup.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            textDecoration: "none",
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
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                {fup.lead.firstName} {fup.lead.lastName}
                {fup.status === 'MISSED' && (
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#e11d48",
                    background: "#fff1f2",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    <AlertCircle size={12} /> Missed
                  </span>
                )}
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
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
          }}>
             <ChevronRight size={18} />
          </div>
        </Link>
      ))}
    </div>
  );
}
