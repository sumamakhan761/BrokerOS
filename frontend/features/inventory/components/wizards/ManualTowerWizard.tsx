"use client";

import React, { useState } from 'react';
import { Save, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ManualTowerWizardProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ManualTowerWizard({ projectId, onSuccess, onCancel }: ManualTowerWizardProps) {
  const [towerName, setTowerName] = useState('New Tower');
  const [floors, setFloors] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addFloor = () => {
    setFloors([
      ...floors,
      {
        floorNumber: floors.length + 1,
        name: `Floor ${floors.length + 1}`,
        units: []
      }
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
      type: 'TWO_BHK',
      status: 'AVAILABLE',
      basePrice: 0,
      commissionPercentage: 0,
      carpetArea: 0,
      facing: 'East'
    });
    setFloors(newFloors);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${baseUrl}/api/inventory/projects/${projectId}/towers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: towerName, floors })
      });
      
      if (!res.ok) throw new Error("Failed to save tower");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save tower");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[80vh] max-h-[800px]">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manual Tower Creation</h2>
          <p className="text-sm text-slate-500">Manually build your tower floor by floor.</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-medium">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tower Name</label>
          <input 
            type="text" 
            value={towerName}
            onChange={e => setTowerName(e.target.value)}
            className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Floors</h3>
            <button onClick={addFloor} className="text-sm text-indigo-600 font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Floor
            </button>
          </div>

          {floors.map((floor, fIdx) => (
            <div key={fIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <input 
                  type="text"
                  value={floor.name}
                  onChange={e => {
                    const nf = [...floors];
                    nf[fIdx].name = e.target.value;
                    setFloors(nf);
                  }}
                  className="bg-transparent font-bold text-slate-700 border-none focus:ring-0 p-0"
                />
                <button onClick={() => removeFloor(fIdx)} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {floor.units.map((unit: any, uIdx: number) => (
                  <div key={uIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                    <input 
                      type="text" 
                      placeholder="Unit No"
                      value={unit.unitNumber}
                      onChange={e => {
                        const nf = [...floors];
                        nf[fIdx].units[uIdx].unitNumber = e.target.value;
                        setFloors(nf);
                      }}
                      className="w-24 text-sm border-slate-200 rounded-md"
                    />
                    <select 
                      value={unit.type}
                      onChange={e => {
                        const nf = [...floors];
                        nf[fIdx].units[uIdx].type = e.target.value;
                        setFloors(nf);
                      }}
                      className="w-32 text-sm border-slate-200 rounded-md"
                    >
                      <option value="TWO_BHK">2 BHK</option>
                      <option value="THREE_BHK">3 BHK</option>
                      <option value="SHOP">SHOP</option>
                    </select>
                    <input 
                      type="number" 
                      placeholder="Price"
                      value={unit.basePrice || ''}
                      onChange={e => {
                        const nf = [...floors];
                        nf[fIdx].units[uIdx].basePrice = Number(e.target.value);
                        setFloors(nf);
                      }}
                      className="w-28 text-sm border-slate-200 rounded-md"
                    />
                    <input 
                      type="number" 
                      placeholder="Comm %"
                      value={unit.commissionPercentage || ''}
                      onChange={e => {
                        const nf = [...floors];
                        nf[fIdx].units[uIdx].commissionPercentage = Number(e.target.value);
                        setFloors(nf);
                      }}
                      className="w-24 text-sm border-slate-200 rounded-md bg-emerald-50 text-emerald-700 placeholder-emerald-300"
                    />
                    <button onClick={() => {
                      const nf = [...floors];
                      nf[fIdx].units.splice(uIdx, 1);
                      setFloors(nf);
                    }} className="text-slate-400 hover:text-red-500 ml-auto p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={() => addUnitToFloor(fIdx)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium border border-dashed border-slate-300"
                >
                  + Add Unit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <button 
          onClick={handleSave}
          disabled={isSaving || floors.length === 0}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          Save Tower
        </button>
      </div>
    </div>
  );
}
