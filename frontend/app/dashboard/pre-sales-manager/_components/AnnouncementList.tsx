import React, { useState, useRef, useEffect } from "react";
import { Announcement } from "./types";
import { Megaphone, MoreHorizontal, Edit2, Trash2 } from "lucide-react";

interface AnnouncementListProps {
  announcements: Announcement[];
  onEdit: (ann: Announcement) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function AnnouncementList({ announcements, onEdit, onDelete, onNew }: AnnouncementListProps) {
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-800">Announcements</h2>
        </div>
        <button
          id="create-announcement-btn"
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 transition-all"
          onClick={onNew}
        >
          + New Announcement
        </button>
      </div>
      {announcements.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
          <Megaphone className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No announcements yet. Create one to broadcast to all your employees.</p>
        </div>
      ) : (
        <div className="gap-6">
          {announcements.map((ann, i) => (
            <div key={ann.id} className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative ${ann.isActive
              ? "border-amber-200"
              : "border-slate-200"
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start gap-4 mb-4 pr-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${ann.isActive ? 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className={`font-bold text-lg line-clamp-2 ${ann.isActive ? 'text-slate-900 group-hover:text-amber-600 transition-colors' : 'text-slate-600'}`}>
                    {ann.title}
                  </h3>
                  {!ann.isActive && <div className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md inline-block">Inactive</div>}
                </div>
              </div>

              <div className="flex-1">
                <p className={`text-sm leading-relaxed line-clamp-3 ${ann.isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                  {ann.description}
                </p>
              </div>

              <div className="absolute top-4 right-4" ref={openAnnMenu === ann.id ? menuRef : null}>
                <button
                  id={`ann-menu-${ann.id}`}
                  className={`bg-transparent border-none cursor-pointer p-2 rounded-xl transition-colors ${ann.isActive ? 'text-amber-400 hover:bg-amber-50 hover:text-amber-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenAnnMenu(openAnnMenu === ann.id ? null : ann.id);
                  }}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {openAnnMenu === ann.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[160px] py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button className="w-full text-left px-4 py-2.5 text-sm cursor-pointer text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 border-none bg-transparent" onClick={() => { onEdit(ann); setOpenAnnMenu(null); }}>
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm cursor-pointer text-red-500 hover:bg-red-50 font-medium flex items-center gap-2 border-none bg-transparent" onClick={() => { onDelete(ann.id); setOpenAnnMenu(null); }}>
                      <Trash2 className="w-4 h-4" /> Delete
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
