import React, { useState, useEffect } from "react";
import { Upload, Download, Key, CheckCircle2 } from "lucide-react";

interface HandoverFormProps {
  booking: any;
  saving: boolean;
  saveModelData: (endpoint: string, data: any) => void;
  uploadFile: (
    type: "loan" | "agreement" | "handover",
    fieldName: string,
    file: File
  ) => void;
  userRole?: string;
}

export function HandoverForm({
  booking,
  saving,
  saveModelData,
  uploadFile,
  userRole,
}: HandoverFormProps) {
  const [handoverData, setHandoverData] = useState<any>(
    booking?.possession || {}
  );

  useEffect(() => {
    if (booking?.possession) {
      setHandoverData(booking.possession);
    }
  }, [booking?.possession]);

  const isReadOnly = userRole === "CHANNEL_PARTNER";

  return (
    <div className="space-y-4">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${
          isReadOnly ? "pointer-events-none opacity-80" : ""
        }`}
      >
        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Handover & Possession Status
          </label>
          <select
            value={handoverData.status || "NOT_READY"}
            onChange={(e) =>
              setHandoverData({ ...handoverData, status: e.target.value })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
          >
            <option value="NOT_READY">Not Ready</option>
            <option value="READY">Ready for Inspection</option>
            <option value="SCHEDULED">Handover Scheduled</option>
            <option value="HANDED_OVER">Keys Handed Over</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Scheduled Handover Date
          </label>
          <input
            type="date"
            value={
              handoverData.scheduledDate
                ? new Date(handoverData.scheduledDate)
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            onChange={(e) =>
              setHandoverData({
                ...handoverData,
                scheduledDate: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : null,
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all cursor-pointer"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Allocated Parking Slot
          </label>
          <input
            type="text"
            placeholder="e.g. Basement 1 - P24"
            value={handoverData.parkingSlotNumber || ""}
            onChange={(e) =>
              setHandoverData({
                ...handoverData,
                parkingSlotNumber: e.target.value,
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Electricity Meter Number
          </label>
          <input
            type="text"
            placeholder="e.g. MSEB-8839210"
            value={handoverData.electricityMeterNumber || ""}
            onChange={(e) =>
              setHandoverData({
                ...handoverData,
                electricityMeterNumber: e.target.value,
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Water Meter Number
          </label>
          <input
            type="text"
            placeholder="e.g. WTR-00492"
            value={handoverData.waterMeterNumber || ""}
            onChange={(e) =>
              setHandoverData({
                ...handoverData,
                waterMeterNumber: e.target.value,
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Customer Satisfaction Rating / Feedback
          </label>
          <input
            type="text"
            placeholder="e.g. Highly satisfied, smooth inspection"
            value={handoverData.customerFeedback || ""}
            onChange={(e) =>
              setHandoverData({
                ...handoverData,
                customerFeedback: e.target.value,
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>

        {/* Checkboxes Row */}
        <div className="sm:col-span-2 flex items-center gap-6 pt-1">
          <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
            <input
              type="checkbox"
              checked={handoverData.snagResolved || false}
              onChange={(e) =>
                setHandoverData({
                  ...handoverData,
                  snagResolved: e.target.checked,
                })
              }
              className="w-4 h-4 accent-purple-600 rounded"
            />
            <span>All Snags & Rectifications Resolved</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
            <input
              type="checkbox"
              checked={handoverData.keysHandedOver || false}
              onChange={(e) => {
                const checked = e.target.checked;
                setHandoverData((prev: any) => ({
                  ...prev,
                  keysHandedOver: checked,
                  ...(checked ? { status: "HANDED_OVER" } : {}),
                }));
              }}
              className="w-4 h-4 accent-purple-600 rounded"
            />
            <span>Keys Handed Over to Buyer</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
          Possession Notes
        </label>
        <textarea
          placeholder="Any special possession remarks, warranty cards handed, or outstanding dues..."
          value={handoverData.handoverNotes || ""}
          onChange={(e) =>
            setHandoverData({
              ...handoverData,
              handoverNotes: e.target.value,
            })
          }
          className="w-full text-base sm:text-xs p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all resize-none text-[var(--text-primary)]"
          rows={2}
          disabled={isReadOnly}
        />
      </div>

      {!isReadOnly && (
        <button
          onClick={() => saveModelData("handover", handoverData)}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving Details…" : "Save Handover Details"}
        </button>
      )}

      {/* Compliance & Certificate Documents */}
      <div className="mt-4 border-t border-slate-100 pt-4 space-y-2.5">
        {[
          { key: "occupancyCertUrl", label: "Occupancy Certificate (OC)" },
          { key: "completionCertUrl", label: "Completion Certificate (CC)" },
          { key: "handoverDocUrl", label: "Signed Possession Handover Letter" },
        ].map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-between p-3.5 border border-slate-200/80 rounded-xl hover:bg-slate-50/80 bg-white shadow-2xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Key size={15} />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {field.label}
              </span>
            </div>

            {booking?.possession?.[field.key] ? (
              <a
                href={booking.possession[field.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-[var(--brand-700)] hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg font-bold transition-all active:scale-[0.96] press-effect"
              >
                <Download size={13} />
                <span>View File</span>
              </a>
            ) : !isReadOnly ? (
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg font-bold transition-all active:scale-[0.96] press-effect">
                <Upload size={13} />
                <span>Upload</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      uploadFile("handover", field.key, e.target.files[0]);
                  }}
                  disabled={saving}
                />
              </label>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
