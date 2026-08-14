import React, { useState, useEffect } from 'react';
import { Upload, Download } from 'lucide-react';

interface HandoverFormProps {
  booking: any;
  saving: boolean;
  saveModelData: (endpoint: string, data: any) => void;
  uploadFile: (type: 'loan' | 'agreement' | 'handover', fieldName: string, file: File) => void;
}

export function HandoverForm({ booking, saving, saveModelData, uploadFile }: HandoverFormProps) {
  const [handoverData, setHandoverData] = useState<any>(booking?.possession || {});

  useEffect(() => {
    if (booking?.possession) {
      setHandoverData(booking.possession);
    }
  }, [booking?.possession]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select value={handoverData.status || 'NOT_READY'} onChange={e => setHandoverData({ ...handoverData, status: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900">
          <option value="NOT_READY">Not Ready</option>
          <option value="READY">Ready</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="HANDED_OVER">Handed Over</option>
        </select>
        <div className="relative">
          <input type="date" value={handoverData.scheduledDate ? new Date(handoverData.scheduledDate).toISOString().split('T')[0] : ''} onChange={e => setHandoverData({ ...handoverData, scheduledDate: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
          {!handoverData.scheduledDate && <span className="absolute left-4 top-2.5 text-sm text-gray-400 pointer-events-none bg-gray-50">Scheduled Date</span>}
        </div>
        <input type="text" placeholder="Parking Slot No." value={handoverData.parkingSlotNumber || ''} onChange={e => setHandoverData({ ...handoverData, parkingSlotNumber: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="text" placeholder="Electricity Meter No." value={handoverData.electricityMeterNumber || ''} onChange={e => setHandoverData({ ...handoverData, electricityMeterNumber: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="text" placeholder="Water Meter No." value={handoverData.waterMeterNumber || ''} onChange={e => setHandoverData({ ...handoverData, waterMeterNumber: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="text" placeholder="Customer Feedback" value={handoverData.customerFeedback || ''} onChange={e => setHandoverData({ ...handoverData, customerFeedback: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        
        <div className="col-span-2 flex items-center gap-6 mt-1 px-1">
          <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
            <input type="checkbox" checked={handoverData.snagResolved || false} onChange={e => setHandoverData({ ...handoverData, snagResolved: e.target.checked })} className="w-4 h-4 accent-indigo-600 rounded" />
            Snags Resolved
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
            <input type="checkbox" checked={handoverData.keysHandedOver || false} onChange={e => {
              const checked = e.target.checked;
              setHandoverData((prev: any) => ({ 
                ...prev, 
                keysHandedOver: checked,
                ...(checked ? { status: 'HANDED_OVER' } : {}) 
              }));
            }} className="w-4 h-4 accent-indigo-600 rounded" />
            Keys Handed Over
          </label>
        </div>
      </div>
      <textarea placeholder="Handover Notes" value={handoverData.handoverNotes || ''} onChange={e => setHandoverData({ ...handoverData, handoverNotes: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 resize-none mt-1" rows={2}></textarea>
      <button onClick={() => saveModelData('handover', handoverData)} disabled={saving} className="bg-indigo-600 text-white text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-all active:scale-95">
        Save Details
      </button>

      <div className="mt-5 border-t border-gray-100 pt-5 space-y-3">
        {['occupancyCertUrl', 'completionCertUrl', 'handoverDocUrl'].map(field => (
          <div key={field} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50/80 bg-white shadow-sm transition-all">
            <p className="text-sm font-semibold text-gray-900">{field.replace('Url', '')}</p>
            {booking?.possession?.[field] ? (
              <a href={booking.possession[field]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-lg font-bold transition-all"><Download className="w-3.5 h-3.5" /> View</a>
            ) : (
              <label className="cursor-pointer flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-1.5 rounded-lg font-bold transition-all">
                <Upload className="w-3.5 h-3.5" /> Upload
                <input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadFile('handover', field, e.target.files[0]); }} disabled={saving} />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
