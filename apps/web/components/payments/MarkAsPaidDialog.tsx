import React, { useState } from 'react';
import { AlertCircle, Upload, X } from 'lucide-react';

interface MarkAsPaidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  amount: number;
  onSuccess: () => void;
}

export function MarkAsPaidDialog({ isOpen, onClose, scheduleId, amount, onSuccess }: MarkAsPaidDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUpload = async () => {
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('amountPaid', amount.toString());
      formData.append('remarks', 'Uploaded via Web Dashboard');
      if (file) {
        formData.append('receipt', file);
      }

      const res = await fetch(`/api/proxy/api/payments/${scheduleId}/pay`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to mark as paid. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Mark as Paid</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            You are marking this installment of <span className="font-bold text-gray-900">₹{amount.toLocaleString('en-IN')}</span> as paid.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>Pro Tip:</strong> To capture a picture directly using your device camera, please use the Mobile App!
            </p>
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-sm font-semibold text-gray-700">Upload Receipt (Optional)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Attach a scanned PDF or image of the transaction receipt.</p>
          </div>
          
          {error && <p className="text-sm text-red-500 font-medium mb-4">{error}</p>}

          <div className="flex items-center justify-end gap-3 mt-8">
            <button 
              onClick={onClose} 
              disabled={uploading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload} 
              disabled={uploading} 
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center transition-colors disabled:opacity-50"
            >
              {uploading ? 'Processing...' : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
