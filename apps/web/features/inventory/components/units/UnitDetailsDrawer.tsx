"use client";

import React from "react";
import { X, Save, Edit3, Loader2 } from "lucide-react";
import PossessionModal from "@/features/inventory/components/modals/PossessionModal";
import { useUnitDetails } from "@/features/inventory/hooks/useUnitDetails";
import { UnitDetailsView } from "@/features/inventory/components/units/UnitDetailsView";
import { UnitBookingInfo } from "@/features/inventory/components/units/UnitBookingInfo";
import { UnitEditForm } from "@/features/inventory/components/units/UnitEditForm";

interface UnitDetailsDrawerProps {
  unit: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (unitId: string, updates: any) => Promise<void>;
  readOnly?: boolean;
}

export function UnitDetailsDrawer({
  unit,
  isOpen,
  onClose,
  onSave,
  readOnly,
}: UnitDetailsDrawerProps) {
  const {
    isEditing,
    setIsEditing,
    isSaving,
    booking,
    loadingBooking,
    formData,
    setFormData,
    possessionModalOpen,
    setPossessionModalOpen,
    handleSave,
    handleCancelBooking,
    refreshBooking,
  } = useUnitDetails(unit, isOpen, onSave, onClose);

  if (!isOpen || !unit) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col border-l border-slate-200/80">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              Unit {unit.unitNumber}
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0 tabular-nums">
              Floor {unit.floor?.floorNumber || "Unknown"} • {unit.type.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {!isEditing ? (
            <div className="space-y-5">
              <UnitDetailsView
                unit={unit}
                setPossessionModalOpen={setPossessionModalOpen}
                readOnly={readOnly}
              />
              <UnitBookingInfo
                unit={unit}
                loadingBooking={loadingBooking}
                booking={booking}
                handleCancelBooking={handleCancelBooking}
                isSaving={isSaving}
                readOnly={readOnly}
                refreshBooking={refreshBooking}
              />
            </div>
          ) : (
            <UnitEditForm
              unit={unit}
              formData={formData}
              setFormData={setFormData}
            />
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          {readOnly ? (
            <button
              onClick={onClose}
              className="w-full h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-[0.96] press-effect cursor-pointer"
            >
              Close
            </button>
          ) : !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full h-9 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-xl text-xs font-bold transition-all active:scale-[0.96] press-effect shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Edit Unit Parameters</span>
            </button>
          ) : (
            <div className="flex gap-2.5">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-[0.96] press-effect cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] h-9 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-xl text-xs font-bold transition-all active:scale-[0.96] press-effect shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <PossessionModal
        isOpen={possessionModalOpen}
        onClose={() => setPossessionModalOpen(false)}
        entityId={unit.id}
        entityType="unit"
        entityName={`Unit ${unit.unitNumber}`}
        initialStatus={unit.constructionStatus}
        initialTimeline={unit.possessionTimeline}
        onSuccess={() => {
          onClose();
        }}
      />
    </>
  );
}
