import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  Phone,
  MapPin,
  ClipboardList,
  CheckCircle,
  User,
  History,
  Sparkles,
} from "lucide-react";

interface CallRecordingsCardProps {
  lead: any;
}

export function CallRecordingsCard({ lead }: CallRecordingsCardProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  // Gather all events from the lead object
  const events: any[] = [];

  if (lead.createdAt) {
    events.push({
      id: "created-" + lead.id,
      type: "CREATED",
      date: new Date(lead.createdAt),
      title: "Lead Created & Ingested",
      description: "Lead was registered into BrokerOS CRM.",
      icon: User,
      dotColor: "text-emerald-700",
      dotBg: "bg-emerald-50",
      dotBorder: "border-emerald-200",
    });
  }

  if (lead.callRecords) {
    lead.callRecords.forEach((call: any) => {
      events.push({
        id: "call-" + call.id,
        type: "CALL",
        date: new Date(call.startedAt),
        title: "Telephony Call Record",
        description: call.aiSummary || "Telephony call logged.",
        data: call,
        icon: Phone,
        dotColor: "text-sky-700",
        dotBg: "bg-sky-50",
        dotBorder: "border-sky-200",
      });
    });
  }

  if (lead.siteVisits) {
    lead.siteVisits.forEach((sv: any) => {
      events.push({
        id: "sv-" + sv.id,
        type: "SITE_VISIT",
        date: new Date(sv.scheduledDate),
        title: `Site Visit — ${sv.status}`,
        description: sv.project
          ? `Scheduled for project: ${sv.project.name}`
          : "Site visit logged.",
        data: sv,
        icon: MapPin,
        dotColor: "text-purple-700",
        dotBg: "bg-purple-50",
        dotBorder: "border-purple-200",
      });
    });
  }

  if (lead.followUps) {
    lead.followUps.forEach((fu: any) => {
      events.push({
        id: "fu-" + fu.id,
        type: "FOLLOW_UP",
        date: new Date(fu.scheduledDate),
        title: `Follow-up — ${fu.status}`,
        description: fu.notes || "Follow-up schedule created.",
        data: fu,
        icon: ClipboardList,
        dotColor: "text-amber-800",
        dotBg: "bg-amber-50",
        dotBorder: "border-amber-200",
      });
    });
  }

  if (lead.customer?.bookings) {
    lead.customer.bookings.forEach((booking: any) => {
      events.push({
        id: "booking-" + booking.id,
        type: "BOOKING",
        date: new Date(booking.createdAt),
        title: `Unit Booking Confirmed — ${booking.status}`,
        description: booking.unit
          ? `Unit confirmed: ${booking.unit.unitNumber}`
          : "Booking created.",
        data: booking,
        icon: CheckCircle,
        dotColor: "text-rose-700",
        dotBg: "bg-rose-50",
        dotBorder: "border-rose-200",
      });
    });
  }

  // Sort events descending
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Card className="p-0 flex flex-col mb-8 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="p-4 px-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/80">
        <History size={16} className="text-[var(--brand-600)]" />
        <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-tight m-0">
          Activity History & Telephony Recordings
        </h3>
      </div>

      <div className="p-6 pl-8">
        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <History size={20} />
            </div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] m-0">
              No activity logs recorded
            </p>
            <p className="text-[11px] text-[var(--text-muted)] m-0">
              Calls, scheduled site visits, and updates will be logged here.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 flex flex-col gap-6 pl-6 pb-2 ml-3">
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
  const Icon = event.icon;

  return (
    <div className="relative group">
      {/* Timeline Dot Indicator */}
      <div
        className={`absolute -left-[37px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center ${event.dotBg} border-2 ${event.dotBorder} shadow-xs ${event.dotColor} shrink-0`}
      >
        <Icon size={14} />
      </div>

      {/* Event Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-purple-200 shadow-2xs hover:shadow-xs transition-all space-y-2">
        {/* Title and Date */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-[var(--text-primary)] m-0">
            {event.title}
          </h4>
          <span className="text-[11px] font-semibold text-[var(--text-muted)] bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md tabular-nums">
            {event.date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Call Specific Audio Player & AI Note */}
        {event.type === "CALL" ? (
          <div className="space-y-2.5 pt-1">
            {event.data.recordingUrl ? (
              <audio
                controls
                src={
                  event.data.recordingUrl.startsWith("/")
                    ? `${apiUrl}${event.data.recordingUrl}`
                    : event.data.recordingUrl
                }
                className="h-8 w-full max-w-sm rounded-lg"
              />
            ) : (
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
                Unrecorded / Missed
              </span>
            )}

            {event.data.aiSummary && (
              <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-3 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-1">
                  <Sparkles size={11} className="text-purple-700" />
                  <span>AI Conversation Transcript Summary</span>
                </div>
                <p className="text-xs text-purple-950 whitespace-pre-wrap leading-relaxed m-0">
                  {event.data.aiSummary}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed m-0">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}
