"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";

export default function CreateApprovalModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description) {
      toast.error("Title and description are required.");
      return;
    }

    try {
      setLoading(true);
      let uploadedUrl = "";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(`${apiUrl}/api/approvals/upload`, {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedUrl = uploadData.url || "";
        } else {
          toast.error("Failed to upload file");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`${apiUrl}/api/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fileUrl: uploadedUrl,
          type: "DISCOUNT",
        }),
      });

      if (!res.ok) {
        toast.error("Failed to create request");
        setLoading(false);
        return;
      }

      toast.success("Approval request ticket submitted!");
      onSuccess();
      onClose();
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border border-slate-200/80 shadow-2xl rounded-3xl bg-white animate-enter">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
            <ShieldAlert size={16} />
          </div>
          <DialogTitle className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
            Create Approval Request
          </DialogTitle>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              Request Title *
            </label>
            <Input
              placeholder="e.g. Special 3% Cash Discount Approval for Unit 402"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 rounded-xl border-slate-200 focus-visible:ring-purple-500/20 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              Commercial Justification & Details *
            </label>
            <Textarea
              placeholder="Provide client background, unit context, and reason for special consideration..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="rounded-xl border-slate-200 focus-visible:ring-purple-500/20 font-medium resize-none text-base sm:text-xs"
            />
          </div>

          <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Supporting Documentation (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-[var(--brand-700)] hover:file:bg-purple-100 cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="luxury"
          >
            {loading ? "Submitting…" : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
