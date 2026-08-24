"use client";

import React, { useState } from "react";
import { Save, Plus, Trash2, X, Building, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ManualTowerWizardProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ManualTowerWizard({
  projectId,
  onSuccess,
  onCancel,
}: ManualTowerWizardProps) {
  const [towerName, setTowerName] = useState("Tower A");
  const [floors, setFloors] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addFloor = () => {
    setFloors([
      ...floors,
      {
        floorNumber: floors.length + 1,
        name: `Floor ${floors.length + 1}`,
        units: [],
      },
    ]);
  };

  const removeFloor = (index: number) => {
    setFloors(floors.filter((_, i) => i !== index));
  };

  const addUnitToFloor = (floorIndex: number) => {
    const newFloors = [...floors];
    const floor = newFloors[floorIndex];
    floor.units.push({
      unitNumber: `${floor.floorNumber}0${floor.units.length + 1}`,
      type: "TWO_BHK",
      status: "AVAILABLE",
      basePrice: 0,
      commissionPercentage: 0,
      carpetArea: 0,
      facing: "East",
    });
    setFloors(newFloors);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(
        `${baseUrl}/api/inventory/projects/${projectId}/towers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: towerName, floors }),
        }
      );

      if (!res.ok) throw new Error("Failed to save tower");
      toast.success("Tower saved successfully");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save tower");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col h-[85vh] max-h-[800px] w-full max-w-4xl mx-auto animate-enter">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
            <Building size={16} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              Manual Tower Builder
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
              Construct floor-by-floor unit inventories manually
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
            Tower Identifier Name *
          </label>
          <input
            type="text"
            value={towerName}
            onChange={(e) => setTowerName(e.target.value)}
            placeholder="e.g. Tower 1 / Wing B"
            className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>

        <div className="space-y-3.5">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
              Tower Floors ({floors.length})
            </h3>
            <button
              onClick={addFloor}
              className="inline-flex items-center gap-1 text-xs bg-purple-50 text-[var(--brand-700)] hover:bg-purple-100 border border-purple-200 px-3 py-1 rounded-xl font-bold transition-all active:scale-[0.96] press-effect cursor-pointer"
            >
              <Plus size={12} />
              <span>Add Floor</span>
            </button>
          </div>

          {floors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-semibold text-[var(--text-secondary)] m-0">
                No floors added yet
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 m-0">
                Click &ldquo;Add Floor&rdquo; above to start building the inventory matrix.
              </p>
            </div>
          ) : (
            floors.map((floor, fIdx) => (
              <div
                key={fIdx}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <input
                    type="text"
                    value={floor.name}
                    onChange={(e) => {
                      const nf = [...floors];
                      nf[fIdx].name = e.target.value;
                      setFloors(nf);
                    }}
                    className="font-bold text-xs text-[var(--text-primary)] bg-transparent border-none outline-none focus:ring-0 p-0"
                  />
                  <button
                    onClick={() => removeFloor(fIdx)}
                    className="w-6 h-6 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="space-y-2">
                  {floor.units.map((unit: any, uIdx: number) => (
                    <div
                      key={uIdx}
                      className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80"
                    >
                      <input
                        type="text"
                        placeholder="Unit No"
                        value={unit.unitNumber}
                        onChange={(e) => {
                          const nf = [...floors];
                          nf[fIdx].units[uIdx].unitNumber = e.target.value;
                          setFloors(nf);
                        }}
                        className="w-20 h-7 px-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg tabular-nums"
                      />
                      <select
                        value={unit.type}
                        onChange={(e) => {
                          const nf = [...floors];
                          nf[fIdx].units[uIdx].type = e.target.value;
                          setFloors(nf);
                        }}
                        className="w-28 h-7 px-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="TWO_BHK">2 BHK</option>
                        <option value="THREE_BHK">3 BHK</option>
                        <option value="ONE_BHK">1 BHK</option>
                        <option value="FOUR_BHK">4 BHK</option>
                        <option value="SHOP">Shop</option>
                        <option value="OFFICE">Office</option>
                        <option value="STUDIO">Studio</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Base Price (₹)"
                        value={unit.basePrice || ""}
                        onChange={(e) => {
                          const nf = [...floors];
                          nf[fIdx].units[uIdx].basePrice = Number(
                            e.target.value
                          );
                          setFloors(nf);
                        }}
                        className="w-28 h-7 px-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg tabular-nums"
                      />
                      <input
                        type="number"
                        placeholder="Comm %"
                        value={unit.commissionPercentage || ""}
                        onChange={(e) => {
                          const nf = [...floors];
                          nf[fIdx].units[uIdx].commissionPercentage = Number(
                            e.target.value
                          );
                          setFloors(nf);
                        }}
                        className="w-20 h-7 px-2 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg tabular-nums"
                      />
                      <button
                        onClick={() => {
                          const nf = [...floors];
                          nf[fIdx].units.splice(uIdx, 1);
                          setFloors(nf);
                        }}
                        className="w-6 h-6 text-slate-400 hover:text-rose-600 rounded-lg flex items-center justify-center ml-auto transition-colors cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addUnitToFloor(fIdx)}
                    className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-dashed border-slate-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Unit to Floor</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-2.5">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || floors.length === 0 || !towerName.trim()}
          className="px-5 py-2 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          {isSaving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          <span>Save Tower Inventory</span>
        </button>
      </div>
    </div>
  );
}
