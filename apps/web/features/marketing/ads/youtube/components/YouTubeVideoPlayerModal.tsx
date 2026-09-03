'use client';

import React from 'react';
import { X, Play, ExternalLink, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { YouTubeIcon } from './YouTubeIcon';

interface YouTubeVideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  videoId?: string;
  format?: string;
  views?: number;
  spend?: number;
}

export function YouTubeVideoPlayerModal({
  isOpen,
  onClose,
  campaignName,
  videoId = 'dQw4w9WgXcQ', // default demo fallback
  format = 'IN_STREAM_SKIPPABLE',
  views = 0,
  spend = 0,
}: YouTubeVideoPlayerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shadow-xs">
              <YouTubeIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] truncate max-w-xs sm:max-w-md">
                  {campaignName}
                </h3>
                <Badge variant="danger" className="text-[10px]">
                  {format}
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                Live YouTube Walkthrough & Video Creative Player
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player 16:9 */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={campaignName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Video Metadata & CTA Footer */}
        <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-6 w-full sm:w-auto">
            <div>
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Total Views
              </span>
              <span className="text-base font-black text-[var(--text-primary)]">
                {views.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Ad Spend
              </span>
              <span className="text-base font-black text-rose-600">
                ₹{Math.round(spend).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Target CTA
              </span>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                Book Site Visit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
              className="text-xs rounded-xl"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Open on YouTube
            </Button>
            <Button
              onClick={onClose}
              className="text-xs rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              Close Player
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
