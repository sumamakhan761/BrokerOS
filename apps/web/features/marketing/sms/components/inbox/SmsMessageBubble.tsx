// ============================================================================
// BrokerOS — SMS Message Bubble Component
// ============================================================================

import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle, Sparkles } from 'lucide-react';
import type { SmsMessage } from '../../types/inbox';

interface SmsMessageBubbleProps {
  message: SmsMessage;
}

export const SmsMessageBubble: React.FC<SmsMessageBubbleProps> = ({ message }) => {
  const isOutbound = message.direction === 'OUTBOUND';

  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex w-full ${isOutbound ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-xs transition-all relative ${
          isOutbound
            ? 'bg-slate-900 text-slate-100 rounded-tr-xs'
            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
        }`}
      >
        {/* Header (Sender label & AI indicator) */}
        <div className="flex items-center gap-2 mb-1">
          {message.isAiGenerated && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI Concierge</span>
            </span>
          )}
          {message.senderName && (
            <span
              className={`text-[10px] font-bold ${
                isOutbound ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {message.senderName}
            </span>
          )}
        </div>

        {/* Message Body */}
        <p className="text-xs whitespace-pre-wrap leading-relaxed break-words font-medium">
          {message.bodyText}
        </p>

        {/* Footer (Timestamp, Segments, Delivery Status) */}
        <div
          className={`flex items-center justify-end gap-1.5 mt-2 text-[10px] ${
            isOutbound ? 'text-slate-400' : 'text-slate-400'
          }`}
        >
          {message.segmentsCount && message.segmentsCount > 0 && (
            <span className="font-mono text-[9px] px-1 bg-white/10 rounded font-bold">
              {message.segmentsCount} seg{message.segmentsCount > 1 ? 's' : ''}
            </span>
          )}

          <span>{formatTime(message.createdAt)}</span>

          {/* Delivery Status Indicator */}
          {isOutbound && (
            <span className="ml-0.5">
              {message.status === 'DELIVERED' ? (
                <span title="Delivered to handset">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                </span>
              ) : message.status === 'SENT' ? (
                <span title="Dispatched from carrier gateway">
                  <Check className="w-3.5 h-3.5 text-slate-300" />
                </span>
              ) : message.status === 'FAILED' ? (
                <span title={message.failureReason || 'Failed'}>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                </span>
              ) : (
                <span title="Queued">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
