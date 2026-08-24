import React from "react";
import { Card } from "@/components/ui/Card";
import {
  Edit2,
  Briefcase,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText,
  FileCheck,
  Globe,
  UserCheck,
  Navigation,
} from "lucide-react";

interface BrokerInformationCardProps {
  broker: any;
  isEditingBrokerInfo: boolean;
  setIsEditingBrokerInfo: (val: boolean) => void;
  brokerInfoData: any;
  setBrokerInfoData: (data: any) => void;
  handleBrokerInfoSave: () => void;
  availableSourcingManagers: any[];
  isCP?: boolean;
}

export function BrokerInformationCard({
  broker,
  isEditingBrokerInfo,
  setIsEditingBrokerInfo,
  brokerInfoData,
  setBrokerInfoData,
  handleBrokerInfoSave,
  availableSourcingManagers,
  isCP = false,
}: BrokerInformationCardProps) {
  return (
    <Card className="p-6 relative rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
        <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-tight m-0 flex items-center gap-2">
          <Briefcase size={15} className="text-[var(--brand-600)]" />
          <span>Broker Information</span>
        </h3>

        <div className="flex items-center gap-1.5">
          {!isEditingBrokerInfo ? (
            <button
              onClick={() => setIsEditingBrokerInfo(true)}
              className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-[var(--brand-700)] flex items-center justify-center transition-all active:scale-[0.96] press-effect cursor-pointer"
              title="Edit parameters"
            >
              <Edit2 size={12} />
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setIsEditingBrokerInfo(false);
                  setBrokerInfoData({
                    companyName: broker.companyName || "",
                    reraNumber: broker.reraNumber || "",
                    gstNumber: broker.gstNumber || "",
                    serviceAreas:
                      broker.serviceAreas && broker.serviceAreas.length > 0
                        ? broker.serviceAreas.join(", ")
                        : "",
                    sourcingManagerId: broker.sourcingManagerId || "",
                    city: broker.city || "",
                    address: broker.address || "",
                  });
                }}
                className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center transition-all active:scale-[0.96] press-effect cursor-pointer"
                title="Cancel"
              >
                <X size={12} />
              </button>
              <button
                onClick={handleBrokerInfoSave}
                className="w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all active:scale-[0.96] press-effect shadow-xs cursor-pointer"
                title="Save parameters"
              >
                <Check size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 text-xs flex-1">
        {!isEditingBrokerInfo ? (
          <>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
                <Phone size={13} className="text-slate-400" /> Phone
              </span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">
                {broker.phone}{" "}
                {broker.alternatePhone ? `/ ${broker.alternatePhone}` : ""}
              </span>
            </div>

            {broker.email && (
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
                  <Mail size={13} className="text-slate-400" /> Email
                </span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {broker.email}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
                <Building2 size={13} className="text-slate-400" /> Company / Agency
              </span>
              <span className="font-bold text-[var(--text-primary)]">
                {broker.companyName || "Independent"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
                <FileText size={13} className="text-slate-400" /> RERA Number
              </span>
              <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                {broker.reraNumber || "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
                <FileCheck size={13} className="text-slate-400" /> GSTIN Number
              </span>
              <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                {broker.gstNumber || "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
                <Globe size={13} className="text-slate-400" /> Service Areas
              </span>
              <span
                className="font-semibold text-[var(--text-primary)] text-right max-w-[150px] truncate"
                title={
                  broker.serviceAreas && broker.serviceAreas.length > 0
                    ? broker.serviceAreas.join(", ")
                    : "—"
                }
              >
                {broker.serviceAreas && broker.serviceAreas.length > 0
                  ? broker.serviceAreas.join(", ")
                  : "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
                <Navigation size={13} className="text-slate-400" /> City Location
              </span>
              <span className="font-semibold text-[var(--text-primary)]">
                {broker.city || "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
                <MapPin size={13} className="text-slate-400" /> Address
              </span>
              <span
                className="font-semibold text-[var(--text-primary)] text-right max-w-[150px] truncate"
                title={broker.address || "—"}
              >
                {broker.address || "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
                <UserCheck size={13} className="text-slate-400" /> Sourcing Manager
              </span>
              <span className="font-bold text-[var(--brand-700)]">
                {broker.sourcingManager?.name || "Unassigned"}
              </span>
            </div>
          </>
        ) : (
          <div className="space-y-3 animate-enter">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={brokerInfoData.companyName}
                onChange={(e) =>
                  setBrokerInfoData({
                    ...brokerInfoData,
                    companyName: e.target.value,
                  })
                }
                className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                RERA Number
              </label>
              <input
                type="text"
                value={brokerInfoData.reraNumber}
                onChange={(e) =>
                  setBrokerInfoData({
                    ...brokerInfoData,
                    reraNumber: e.target.value,
                  })
                }
                className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                GST Number
              </label>
              <input
                type="text"
                value={brokerInfoData.gstNumber}
                onChange={(e) =>
                  setBrokerInfoData({
                    ...brokerInfoData,
                    gstNumber: e.target.value,
                  })
                }
                className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                Service Areas (comma separated)
              </label>
              <input
                type="text"
                value={brokerInfoData.serviceAreas}
                onChange={(e) =>
                  setBrokerInfoData({
                    ...brokerInfoData,
                    serviceAreas: e.target.value,
                  })
                }
                className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                City
              </label>
              <input
                type="text"
                value={brokerInfoData.city}
                onChange={(e) =>
                  setBrokerInfoData({
                    ...brokerInfoData,
                    city: e.target.value,
                  })
                }
                className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                Address
              </label>
              <textarea
                value={brokerInfoData.address}
                onChange={(e) =>
                  setBrokerInfoData({
                    ...brokerInfoData,
                    address: e.target.value,
                  })
                }
                className="w-full text-base sm:text-xs p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/15 transition-all resize-none"
                rows={2}
              />
            </div>

            {isCP && (
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Assign Sourcing Manager
                </label>
                <select
                  value={brokerInfoData.sourcingManagerId || ""}
                  onChange={(e) =>
                    setBrokerInfoData({
                      ...brokerInfoData,
                      sourcingManagerId: e.target.value,
                    })
                  }
                  className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
                >
                  <option value="">Unassigned</option>
                  {availableSourcingManagers.map((sm) => (
                    <option key={sm.id} value={sm.id}>
                      {sm.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
