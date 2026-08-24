import React from "react";
import { Megaphone } from "lucide-react";

export interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export function Announcements({
  announcements,
}: {
  announcements: AnnouncementItem[];
}) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {announcements.map((ann, i) => (
        <div
          key={ann.id}
          className="flex items-start gap-3.5 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 border-l-4 border-l-amber-500 shadow-xs animate-enter"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <Megaphone
            size={16}
            className="text-amber-700 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-amber-950 mb-1 tracking-tight">
              {ann.title}
            </div>
            <div className="text-xs text-amber-800 leading-relaxed">
              {ann.description}
            </div>
          </div>
          <div className="text-[11px] font-semibold text-amber-700 tabular-nums whitespace-nowrap flex-shrink-0">
            {new Date(ann.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
