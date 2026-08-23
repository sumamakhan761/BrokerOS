"use client";

import { X, Save, Edit3, Loader2 } from 'lucide-react';
import PossessionModal from '@/features/inventory/components/modals/PossessionModal';
import { useUnitDetails } from '@/features/inventory/hooks/useUnitDetails';
import { UnitDetailsView } from '@/features/inventory/components/units/UnitDetailsView';
import { UnitBookingInfo } from '@/features/inventory/components/units/UnitBookingInfo';
import { UnitEditForm } from '@/features/inventory/components/units/UnitEditForm';

interface UnitDetailsDrawerProps {
  unit: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (unitId: string, updates: any) => Promise<void>;
  readOnly?: boolean;
}

export function UnitDetailsDrawer({ unit, isOpen, onClose, onSave, readOnly }: UnitDetailsDrawerProps) {
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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Unit {unit.unitNumber}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Floor {unit.floor?.floorNumber || 'Unknown'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!isEditing ? (
            <div className="space-y-6">
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

        <div className="p-6 border-t border-slate-100 bg-white">
          {readOnly ? (
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          ) : !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
            >
              <Edit3 className="w-5 h-5" />
              Manual Edit
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
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
