import React from "react";
import { Phone } from "lucide-react";

interface LeadHeaderEditProps {
  formData: any;
  setFormData: (data: any) => void;
  leadPhone: string;
}

export function LeadHeaderEdit({
  formData,
  setFormData,
  leadPhone,
}: LeadHeaderEditProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pr-8 animate-enter">
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
          First Name
        </label>
        <input
          className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          placeholder="First name"
        />
      </div>

      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
          Last Name
        </label>
        <input
          className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          placeholder="Last name"
        />
      </div>

      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
          Email Address
        </label>
        <input
          type="email"
          className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@example.com"
        />
      </div>

      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
          Preferred Location
        </label>
        <input
          className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          value={formData.preferredLocation}
          onChange={(e) =>
            setFormData({ ...formData, preferredLocation: e.target.value })
          }
          placeholder="e.g. Bandra West, BKC"
        />
      </div>

      {/* Read-only Phone Banner */}
      <div className="sm:col-span-2">
        <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
          <Phone size={13} className="text-slate-400 flex-shrink-0" />
          <span className="font-bold text-[var(--text-secondary)] tabular-nums">
            {leadPhone}
          </span>
          <span className="text-[11px] text-slate-400 ml-1">
            — Primary phone number is verified and locked
          </span>
        </div>
      </div>
    </div>
  );
}
