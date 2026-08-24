import React from "react";
import { Phone } from "lucide-react";

interface BrokerHeaderEditProps {
  formData: any;
  setFormData: (data: any) => void;
  brokerPhone: string;
}

export function BrokerHeaderEdit({
  formData,
  setFormData,
  brokerPhone,
}: BrokerHeaderEditProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pr-8 animate-enter">
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
          Broker Name
        </label>
        <input
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Broker contact name"
          className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
        />
      </div>

      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={formData.email || ""}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          placeholder="broker@agency.com"
          className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
        />
      </div>

      <div className="sm:col-span-2">
        <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
          <Phone size={13} className="text-slate-400 flex-shrink-0" />
          <span className="font-bold text-[var(--text-secondary)] tabular-nums">
            {brokerPhone}
          </span>
          <span className="text-[11px] text-slate-400 ml-1">
            — Primary verified broker phone
          </span>
        </div>
      </div>
    </div>
  );
}
