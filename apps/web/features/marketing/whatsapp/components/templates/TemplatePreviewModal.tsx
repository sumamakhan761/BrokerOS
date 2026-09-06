'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { WhatsAppTemplate } from '../../types';

interface TemplatePreviewModalProps {
  selectedTemplate: WhatsAppTemplate | null;
  onClose: () => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  selectedTemplate,
  onClose,
}) => {
  if (!selectedTemplate) return null;

  const renderStatus = (status: WhatsAppTemplate['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>In Review</span>
          </span>
        );
      case 'REJECTED':
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border-default">
          <div>
            <h3 className="font-semibold text-text-primary text-sm font-mono">
              {selectedTemplate.name}
            </h3>
            <span className="text-[10px] text-text-tertiary uppercase">
              {selectedTemplate.category} · {selectedTemplate.language}
            </span>
          </div>
          {renderStatus(selectedTemplate.status)}
        </div>

        {/* Simulated WhatsApp Bubble Preview */}
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2">
          {selectedTemplate.headerText && (
            <p className="font-bold text-xs text-text-primary">
              {selectedTemplate.headerText}
            </p>
          )}
          <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
            {selectedTemplate.bodyText}
          </p>
          {selectedTemplate.footerText && (
            <p className="text-[10px] text-text-tertiary">
              {selectedTemplate.footerText}
            </p>
          )}
          {Array.isArray(selectedTemplate.buttons) && selectedTemplate.buttons.length > 0 && (
            <div className="pt-2 border-t border-emerald-500/20 space-y-1">
              {selectedTemplate.buttons.map((btn: any, idx: number) => (
                <div
                  key={idx}
                  className="w-full text-center py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium text-xs border border-emerald-500/30"
                >
                  {btn.text || btn}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-bg-subtle hover:bg-bg-muted border border-border-default rounded-xl text-xs font-semibold text-text-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
