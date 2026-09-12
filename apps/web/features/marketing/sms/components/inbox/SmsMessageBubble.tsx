// ============================================================================
// BrokerOS — SMS Message Bubble Component
// ============================================================================

import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle, Sparkles, User, Bot } from 'lucide-react';
import type { SmsMessage } from '../../types/inbox';

interface SmsMessageBubbleProps {
  message: SmsMessage;
}

export const SmsMessageBubble: React.FC<SmsMessageBubbleProps> = ({ message }) => {
  const isOutbound = message.direction === 'OUTBOUND';
  const isBot = message.senderType === 'bot' || message.isAiGenerated;

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

  const renderStatus = () => {
    if (!isOutbound) return null;

    switch (message.status) {
      case 'DELIVERED':
        return (
          <span title="Delivered to handset">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          </span>
        );
      case 'SENT':
        return (
          <span title="Dispatched from carrier gateway">
            <Check className="w-3.5 h-3.5 opacity-80" />
          </span>
        );
      case 'FAILED':
        return (
          <span title={message.failureReason || 'SMS delivery failed'}>
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </span>
        );
      case 'PENDING':
      default:
        return <Clock className="w-3.5 h-3.5 opacity-60 animate-pulse" />;
    }
  };

  return (
    <div className={`flex w-full my-2.5 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-xs text-sm relative transition-all ${
          isOutbound
            ? isBot
              ? 'bg-purple-600/90 text-white rounded-br-xs border border-purple-500/30'
              : 'bg-amber-500 text-slate-950 font-medium rounded-br-xs border border-amber-400/40 shadow-sm'
            : 'bg-bg-surface text-text-primary rounded-bl-xs border border-border-default'
        }`}
      >
        {/* Sender Attribution Header */}
        <div className={`flex items-center justify-between gap-2 mb-1.5 pb-1 border-b ${
          isOutbound
            ? isBot
              ? 'border-white/10'
              : 'border-slate-950/10'
            : 'border-border-subtle'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            {isOutbound ? (
              isBot ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-purple-200" />
                  <span>AI Automated Reply</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-900/70" />
                  <span>{message.senderName || 'Sales Agent'}</span>
                </>
              )
            ) : (
              <span className="text-text-primary font-semibold">{message.senderName || message.fromPhone}</span>
            )}
          </div>

          <span className={`text-[10px] ${
            isOutbound
              ? isBot
                ? 'text-white/70'
                : 'text-slate-950/60 font-mono'
              : 'text-text-tertiary'
          }`}>
            {formatTime(message.sentAt || message.createdAt)}
          </span>
        </div>

        {/* Message Body */}
        <p className="text-xs whitespace-pre-wrap leading-relaxed break-words">
          {message.bodyText}
        </p>

        {/* Telemetry & Outbound Status Receipts */}
        <div className={`flex items-center justify-end gap-1.5 mt-2 text-[10px] ${
          isOutbound
            ? isBot
              ? 'text-white/75'
              : 'text-slate-950/70'
            : 'text-text-tertiary'
        }`}>
          {message.segmentsCount && message.segmentsCount > 0 && (
            <span className={`font-mono text-[9px] px-1 py-0.5 rounded font-bold ${
              isOutbound
                ? isBot
                  ? 'bg-black/20 text-white'
                  : 'bg-black/10 text-slate-950'
                : 'bg-bg-subtle text-text-secondary border border-border-subtle'
            }`}>
              {message.segmentsCount} seg{message.segmentsCount > 1 ? 's' : ''}
            </span>
          )}

          {isOutbound && renderStatus()}
        </div>
      </div>
    </div>
  );
};
