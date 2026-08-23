import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface InboundCommissionReceiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { file: File | null; remarks: string }) => Promise<void>;
  isSaving: boolean;
  commissionAmount: string | number;
}

export function InboundCommissionReceiveDialog({ isOpen, onClose, onConfirm, isSaving, commissionAmount }: InboundCommissionReceiveDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConfirm = async () => {
    await onConfirm({ file, remarks });
    setFile(null);
    setRemarks('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Commission as Received</DialogTitle>
          <DialogDescription>
            You are about to mark this commission as Received from the developer/owner. Expected amount is <span className="font-bold text-emerald-600">₹{Number(commissionAmount).toLocaleString('en-IN')}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Remarks / Cheque No. (Optional)</Label>
            <Input 
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="E.g. Cheque #123456"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Upload Receipt / Proof (Optional)</Label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 hover:bg-slate-50 transition-colors text-center group cursor-pointer">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 line-clamp-1">{file.name}</p>
                  <p className="text-xs text-indigo-600 mt-1 font-medium">Click to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Upload File</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark Received
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
