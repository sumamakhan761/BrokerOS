import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={contentRef}
        className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-[0_24px_64px_rgba(0,0,0,0.18)] animate-[fadeUp_0.25s_ease_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0 text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 border-none cursor-pointer p-2 rounded-full transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
