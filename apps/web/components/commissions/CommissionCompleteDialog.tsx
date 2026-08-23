import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface CommissionCompleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File | null) => Promise<void>;
  isSaving: boolean;
  commissionAmount: string | number;
}

export function CommissionCompleteDialog({ isOpen, onClose, onConfirm, isSaving, commissionAmount }: CommissionCompleteDialogProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConfirm = async () => {
    await onConfirm(file);
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Commission Payment</DialogTitle>
          <DialogDescription>
            You are about to mark this commission as Paid. The net payable amount is <span className="font-bold text-emerald-600">₹{Number(commissionAmount).toLocaleString('en-IN')}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label className="text-sm font-medium text-slate-700 mb-3 block">Upload Payment Receipt (Optional)</Label>
          <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 hover:bg-slate-50 transition-colors text-center group cursor-pointer">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p className="text-xs text-indigo-600 mt-2 font-medium">Click or drag to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mt-1">Upload Receipt</p>
                <p className="text-xs text-slate-500 text-center max-w-[200px]">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
