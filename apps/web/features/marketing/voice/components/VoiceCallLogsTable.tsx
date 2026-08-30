"use client";

import React, { useState } from "react";
import {
  Phone,
  Play,
  Pause,
  FileText,
  Flame,
  CheckCircle2,
  AlertCircle,
  Clock,
  Heart,
  Volume2,
  Search,
  ExternalLink,
  ChevronRight,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { VoiceCallLogItem, VoiceRecipientItem } from "@/features/marketing/types";

export interface VoiceCallLogsTableProps {
  recipients: VoiceRecipientItem[];
  campaignTitle?: string;
  onPromote?: (recipientId: string) => Promise<void>;
}

export function VoiceCallLogsTable({
  recipients = [],
  campaignTitle = "Voice Campaign",
  onPromote,
}: VoiceCallLogsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("ALL");
  const [activeTranscriptRecipient, setActiveTranscriptRecipient] = useState<VoiceRecipientItem | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const filteredRecipients = recipients.filter((r) => {
    const matchesSearch =
      r.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.summary && r.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSentiment =
      selectedSentiment === "ALL" || r.sentiment === selectedSentiment;

    return matchesSearch && matchesSentiment;
  });

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case "POSITIVE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <Flame className="w-3 h-3 text-emerald-500 fill-emerald-500" />
            Positive
          </span>
        );
      case "NEGATIVE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Negative
          </span>
        );
      case "NEUTRAL":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
            Neutral
          </span>
        );
    }
  };

  const getDispositionBadge = (disposition?: string, status?: string) => {
    if (disposition === "COMPLETED") {
      return <Badge variant="success" className="text-[10px]">Completed</Badge>;
    }
    if (disposition === "BUSY") {
      return <Badge variant="warning" className="text-[10px]">Line Busy</Badge>;
    }
    if (disposition === "NO_ANSWER") {
      return <Badge variant="warning" className="text-[10px]">No Answer</Badge>;
    }
    if (status === "QUEUED") {
      return <Badge variant="default" className="text-[10px]">Queued</Badge>;
    }
    return <Badge variant="default" className="text-[10px]">{disposition || status || "Pending"}</Badge>;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Phone className="w-4 h-4 text-indigo-600" />
            <span>Call Recordings, Transcripts & Disposition Audit</span>
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
            Detailed conversational logs and extracted customer sentiment per recipient.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone or name..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {["ALL", "POSITIVE", "NEUTRAL", "NEGATIVE"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSentiment(s)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all uppercase ${selectedSentiment === s
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-[10px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3 px-5">Recipient / Lead</th>
              <th className="py-3 px-4">Disposition</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">AI Sentiment</th>
              <th className="py-3 px-5">Call Summary</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredRecipients.map((recipient) => (
              <tr key={recipient.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[var(--text-primary)]">
                        {recipient.name || "Client"}
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)] font-mono">
                        {recipient.phone}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  {getDispositionBadge(recipient.disposition, recipient.status)}
                </td>

                <td className="py-3.5 px-4">
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {formatDuration(recipient.callDurationSec)}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  {getSentimentBadge(recipient.sentiment)}
                </td>

                <td className="py-3.5 px-5 max-w-xs">
                  <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                    {recipient.summary || "Conversation audio recorded and archived."}
                  </p>
                </td>

                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onPromote && !recipient.leadId && (
                      <button
                        type="button"
                        onClick={() => onPromote(recipient.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors border border-emerald-200/60"
                        title="Promote CSV Contact to CRM Lead"
                      >
                        <User className="w-3 h-3" />
                        <span>+ CRM Lead</span>
                      </button>
                    )}

                    {recipient.transcript && (
                      <button
                        type="button"
                        onClick={() => setActiveTranscriptRecipient(recipient)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Transcript</span>
                      </button>
                    )}

                    {recipient.recordingUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setPlayingAudioId(
                            playingAudioId === recipient.id ? null : recipient.id,
                          )
                        }
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                        title="Listen to Recording"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredRecipients.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Phone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">No call logs found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transcript Drawer Modal */}
      {activeTranscriptRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Call Transcript & AI Extract</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {activeTranscriptRecipient.name || "Client"} · {activeTranscriptRecipient.phone}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTranscriptRecipient(null)}
              >
                Close
              </Button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {activeTranscriptRecipient.summary && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <span className="text-[10px] font-extrabold text-indigo-900 uppercase">
                    AI Summary & Next Step
                  </span>
                  <p className="text-xs text-indigo-800 font-semibold mt-1">
                    {activeTranscriptRecipient.summary}
                  </p>
                </div>
              )}

              <div>
                <h5 className="text-xs font-extrabold text-slate-700 uppercase mb-2">
                  Full Conversation Dialogue
                </h5>
                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {activeTranscriptRecipient.transcript || "No transcript available."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
