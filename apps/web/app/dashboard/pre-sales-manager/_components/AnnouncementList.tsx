"use client";

import React, { useState, useRef, useEffect } from "react";
import { Announcement } from "./types";
import { Megaphone, MoreHorizontal, Edit2, Trash2, Plus } from "lucide-react";

interface AnnouncementListProps {
  announcements: Announcement[];
  onEdit: (ann: Announcement) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function AnnouncementList({
  announcements,
  onEdit,
  onDelete,
  onNew,
}: AnnouncementListProps) {
  const [openAnnMenu, setOpenAnnMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenAnnMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <Megaphone size={16} />
          </div>
          <h2 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight uppercase tracking-wider m-0">
            Team Broadcast Announcements
          </h2>
        </div>
        <button
          id="create-announcement-btn"
          className="bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-2xs transition-all active:scale-[0.96] press-effect flex items-center gap-1.5 cursor-pointer"
          onClick={onNew}
        >
          <Plus size={13} />
          <span>New Announcement</span>
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center bg-slate-50/60 rounded-3xl border border-slate-200 border-dashed space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-2xs">
            <Megaphone size={18} />
          </div>
          <p className="text-xs font-semibold text-[var(--text-muted)] m-0">
            No active announcements. Broadcast important updates to your agents here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white border rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between relative ${
                ann.isActive ? "border-amber-200/80" : "border-slate-200/80 opacity-70"
              }`}
            >
              <div className="space-y-2 pr-8">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                      ann.isActive
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    <Megaphone size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-[var(--text-primary)] m-0 line-clamp-1">
                      {ann.title}
                    </h3>
                    {!ann.isActive && (
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3 m-0 font-medium">
                  {ann.description}
                </p>
              </div>

              <div
                className="absolute top-4 right-4"
                ref={openAnnMenu === ann.id ? menuRef : null}
              >
                <button
                  id={`ann-menu-${ann.id}`}
                  className="w-7 h-7 bg-transparent hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenAnnMenu(openAnnMenu === ann.id ? null : ann.id);
                  }}
                >
                  <MoreHorizontal size={15} />
                </button>
                {openAnnMenu === ann.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 min-w-[140px] p-1 overflow-hidden animate-enter">
                    <button
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      onClick={() => {
                        onEdit(ann);
                        setOpenAnnMenu(null);
                      }}
                    >
                      <Edit2 size={13} /> <span>Edit</span>
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      onClick={() => {
                        onDelete(ann.id);
                        setOpenAnnMenu(null);
                      }}
                    >
                      <Trash2 size={13} /> <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
