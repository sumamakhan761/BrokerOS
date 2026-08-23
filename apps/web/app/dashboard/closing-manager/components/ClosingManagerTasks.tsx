"use client";
import React, { useState } from "react";
import { ClipboardList, FileText, Banknote, Handshake, PhoneForwarded, ChevronRight, Key } from "lucide-react";
import Link from "next/link";

export function ClosingManagerTasks({ dashData }: { dashData: any }) {
  const [activeTab, setActiveTab] = useState<"DOCUMENTS" | "LOANS" | "AGREEMENTS" | "HANDOVERS" | "FOLLOW_UPS">("DOCUMENTS");

  const lists = dashData?.lists || {};
  const documents = lists.documentPending || [];
  const loans = lists.loanPending || [];
  const agreements = lists.agreementPending || [];
  const handovers = lists.handoverPending || [];
  const followUps = lists.todayFollowups || [];

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      marginTop: 32,
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
          <ClipboardList size={18} style={{ color: "var(--brand-500)" }} /> Pending Tasks & Follow-ups
        </h3>
        <p style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text-muted)",
          marginTop: 4,
          marginBottom: 0
        }}>Manage pending bookings and today's follow-ups</p>
      </div>

      <div style={{
        display: "flex",
        padding: "20px 24px 0",
        gap: 24,
        borderBottom: "1px solid var(--border-subtle)",
        overflowX: "auto",
      }} className="no-scrollbar">
        {[
          { id: "DOCUMENTS", label: `Documents (${documents.length})`, color: "var(--brand-600)" },
          { id: "LOANS", label: `Loans (${loans.length})`, color: "#2563eb" },
          { id: "AGREEMENTS", label: `Agreements (${agreements.length})`, color: "#9333ea" },
          { id: "HANDOVERS", label: `Handovers (${handovers.length})`, color: "#d97706" },
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

      <div style={{ flex: 1, overflowY: "auto", padding: 24, maxHeight: 500 }}>
        {activeTab === "DOCUMENTS" && (
          <ListBookings items={documents} emptyMsg="No documents pending." iconColor="#6366f1" iconBg="#eef2ff" Icon={FileText} />
        )}
        {activeTab === "LOANS" && (
          <ListBookings items={loans} emptyMsg="No loans pending." iconColor="#3b82f6" iconBg="#eff6ff" Icon={Banknote} />
        )}
        {activeTab === "AGREEMENTS" && (
          <ListBookings items={agreements} emptyMsg="No agreements pending." iconColor="#a855f7" iconBg="#faf5ff" Icon={Handshake} />
        )}
        {activeTab === "HANDOVERS" && (
          <ListBookings items={handovers} emptyMsg="No handovers pending." iconColor="#f59e0b" iconBg="#fffbeb" Icon={Key} />
        )}
        {activeTab === "FOLLOW_UPS" && (
          <ListFollowUps items={followUps} emptyMsg="No follow-ups scheduled for today." />
        )}
      </div>
    </div>
  );
}

function ListBookings({ items, emptyMsg, iconColor, iconBg, Icon }: { items: any[], emptyMsg: string, iconColor: string, iconBg: string, Icon: any }) {
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
        <Icon size={32} style={{ color: "var(--bg-subtle)", opacity: 0.8 }} />
        {emptyMsg}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((booking) => (
        <Link 
          key={booking.id} 
          href={booking.customer?.leadId ? `/dashboard/closing-manager/lead-management/${booking.customer.leadId}` : "#"}
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
              <Icon size={18} style={{ color: iconColor }} />
            </div>
            <div>
              <div style={{
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}>
                {booking.customer?.firstName} {booking.customer?.lastName}
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
                  {booking.status.replace(/_/g, ' ')}
                </span>
                <span>•</span>
                <span>Unit: {booking.unit?.unitNumber || "N/A"}</span>
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
          key={fup.id} 
          href={fup.customer?.leadId ? `/dashboard/closing-manager/lead-management/${fup.customer.leadId}` : "#"}
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
              }}>
                {fup.customer?.firstName} {fup.customer?.lastName}
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
