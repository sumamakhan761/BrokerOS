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
      <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-2">
          <ImageIcon className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No Creative Visuals Cached</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">
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
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
          >
            {/* Visual Media Header */}
            <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden group">
              {previewImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImg}
                  alt={cr.title || cr.name || "Ad Creative"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400 gap-1">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-[10px]">No Thumbnail</span>
                </div>
              )}

              <div className="absolute top-2.5 right-2.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 backdrop-blur-xs text-white border border-white/20">
                  {ctaLabel}
                </span>
              </div>
            </div>

            {/* Creative Copy & Details */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {cr.title || cr.name || "Real Estate Ad Creative"}
                </h4>
                {cr.body && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                    {cr.body}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono">
                  ID: {cr.id.slice(0, 14)}...
                </span>

                {(cr.instagramPermalinkUrl || cr.previewUrl) && (
                  <a
                    href={cr.instagramPermalinkUrl || cr.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Live Post
                    <ExternalLink className="w-2.5 h-2.5" />
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
