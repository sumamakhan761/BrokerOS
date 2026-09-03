"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  Video,
  Play,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreVertical,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Smartphone,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { InstagramCreativeData } from "../types";

interface InstagramCreativeGalleryProps {
  creatives: InstagramCreativeData[];
}

export function InstagramCreativeGallery({
  creatives = [],
}: InstagramCreativeGalleryProps) {
  const [activeFormat, setActiveFormat] = useState<"ALL" | "9:16" | "1:1">("ALL");

  const filteredCreatives = creatives.filter((c) => {
    if (activeFormat === "ALL") return true;
    return c.aspectRatio === activeFormat;
  });

  if (creatives.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200/80 bg-white">
        <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Smartphone className="w-6 h-6" />
        </div>
        <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
          No Instagram Creatives Cached
        </h4>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto">
          Sync live ad data to inspect 9:16 vertical video walkthroughs, Story creatives, and copy text.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Format Toggle Bar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            Visual Creatives & 9:16 Phone Mockups
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Inspect authentic Instagram Reels, Stories, and carousel ad representations.
          </p>
        </div>

        <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs">
          {[
            { id: "ALL", label: "All Formats" },
            { id: "9:16", label: "9:16 Reels & Stories" },
            { id: "1:1", label: "1:1 Feed Posts" },
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setActiveFormat(fmt.id as any)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFormat === fmt.id
                  ? "bg-white text-pink-600 shadow-2xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Creative Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCreatives.map((creative, idx) => {
          const is916 = creative.aspectRatio === "9:16";
          const mediaUrl = creative.imageUrl || creative.thumbnailUrl;
          const handle = creative.instagramActorHandle || "godrej_luxury_residences";

          return (
            <div
              key={creative.id || idx}
              className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs hover:border-pink-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Creative Meta Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[var(--text-primary)] truncate max-w-[180px]">
                    {creative.name || `Creative #${idx + 1}`}
                  </span>
                  <Badge
                    variant={is916 ? "info" : "default"}
                    className="text-[10px] font-extrabold"
                  >
                    {creative.aspectRatio || "9:16"}
                  </Badge>
                </div>

                {creative.previewUrl && (
                  <a
                    href={creative.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-600 hover:text-pink-700 p-1"
                    title="View live ad"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* ── Phone Frame Chassis ── */}
              <div className="mx-auto w-full max-w-[280px] rounded-[28px] bg-slate-950 p-2.5 shadow-lg border-2 border-slate-800 relative overflow-hidden text-white select-none">
                {/* Speaker Notch */}
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                </div>

                {/* Inner Screen */}
                <div
                  className={`w-full rounded-[22px] bg-slate-900 overflow-hidden relative ${
                    is916 ? "aspect-[9/16]" : "aspect-[4/5]"
                  }`}
                >
                  {/* Background Image / Video Poster */}
                  {mediaUrl ? (
                    <img
                      src={mediaUrl}
                      alt={creative.title || "Instagram Ad"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 via-pink-900 to-slate-950 text-slate-300 p-4 text-center">
                      <Video className="w-10 h-10 mb-2 opacity-60 text-pink-400" />
                      <span className="text-[11px] font-bold">Property Tour Reel</span>
                    </div>
                  )}

                  {/* Top Gradient & Header */}
                  <div className="absolute top-0 right-0 left-0 p-3 pt-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-[9px] font-black text-white">
                          IG
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-black tracking-tight text-white leading-none">
                            {handle}
                          </span>
                          <CheckCircle className="w-2.5 h-2.5 text-blue-400 fill-blue-400" />
                        </div>
                        <span className="text-[9px] text-slate-300 font-medium">Sponsored</span>
                      </div>
                    </div>
                    <MoreVertical className="w-3.5 h-3.5 text-white/80" />
                  </div>

                  {/* Right Floating Actions (Reels Style) */}
                  {is916 && (
                    <div className="absolute right-2 bottom-20 z-10 flex flex-col items-center gap-3">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white hover:text-rose-400 transition-colors">
                          <Heart className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold text-white shadow-xs">2.4k</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold text-white shadow-xs">184</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white">
                        <Send className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white">
                        <Bookmark className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {/* Center Play Overlay Icon */}
                  {creative.mediaType === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Caption & Action Banner */}
                  <div className="absolute bottom-0 right-0 left-0 p-3 pt-8 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-10 space-y-2">
                    <p className="text-[10px] text-white/95 line-clamp-2 font-medium leading-snug drop-shadow-xs">
                      {creative.body || creative.title || "Book your luxury 3 & 4 BHK residence today."}
                    </p>

                    {/* CTA Pill Button */}
                    <div className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white text-center text-[11px] font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5">
                      <span>{creative.callToActionType?.replace(/_/g, " ") || "LEARN MORE"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Metadata Footnote */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[var(--text-tertiary)] font-mono">
                <span>Format: {is916 ? "Vertical Story / Reel" : "Square Feed"}</span>
                <span>CTA: {creative.callToActionType || "LEARN_MORE"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
