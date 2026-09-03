"use client";

import React from "react";
import { Image as ImageIcon, ExternalLink, Sparkles, MessageSquare, Play } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface CreativeItem {
  id: string;
  name: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  callToActionType?: string;
  instagramPermalinkUrl?: string;
  previewUrl?: string;
}

interface MetaCreativeGalleryProps {
  creatives: CreativeItem[];
}

export function MetaCreativeGallery({ creatives }: MetaCreativeGalleryProps) {
  if (!creatives || creatives.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200/80">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto text-blue-600 mb-2 shadow-xs">
          <ImageIcon className="w-6 h-6" />
        </div>
        <p className="text-xs font-extrabold text-[var(--text-primary)]">No Creative Visuals Cached</p>
        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
          Run a sync to pull recent ad thumbnails, headlines, and copy variations.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {creatives.map((cr, idx) => {
        const previewImg = cr.imageUrl || cr.thumbnailUrl;
        const ctaLabel = (cr.callToActionType || "LEARN_MORE").replace(/_/g, " ");

        return (
          <div
            key={cr.id || idx}
            className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
          >
            {/* Visual Media Header */}
            <div className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden group">
              {previewImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImg}
                  alt={cr.title || cr.name || "Ad Creative"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-[11px] font-medium">No Thumbnail</span>
                </div>
              )}

              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900/80 backdrop-blur-xs text-white shadow-xs">
                  {ctaLabel}
                </span>
              </div>
            </div>

            {/* Creative Copy & Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-[var(--text-primary)] line-clamp-1">
                  {cr.title || cr.name || "Real Estate Ad Creative"}
                </h4>
                {cr.body && (
                  <p className="text-xs font-medium text-[var(--text-secondary)] mt-1.5 line-clamp-3 leading-relaxed">
                    {cr.body}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                  ID: {cr.id.slice(0, 14)}...
                </span>

                {(cr.instagramPermalinkUrl || cr.previewUrl) && (
                  <a
                    href={cr.instagramPermalinkUrl || cr.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <span>Live Post</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
