import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Handshake } from "lucide-react";

interface ClosingManagerHandoverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onSuccess: () => void;
}

export function ClosingManagerHandoverFormModal({
  isOpen,
  onClose,
  lead,
  onSuccess,
}: ClosingManagerHandoverFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${apiUrl}/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: "HANDOVER",
          subStatus: "DONE",
          note: notes,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to handover lead");
      }

      onSuccess();
    } catch (err: any) {
      console.error("Handover error:", err);
      setError(err.message || "An error occurred during handover");
    } finally {
      setLoading(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xl space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Handshake size={16} />
            </div>
            <DialogTitle className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
              Confirm Post-Sales Handover
            </DialogTitle>
          </div>
          <p className="text-xs text-[var(--text-muted)] m-0 leading-relaxed">
            Transition{" "}
            <span className="font-bold text-[var(--text-primary)]">
              {lead.firstName} {lead.lastName || ""}
            </span>{" "}
            to the Post-Sales team. This will complete the closing process and trigger post-sales document collection workflows.
          </p>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Handover Remarks (Optional)
            </label>
            <textarea
              className="w-full text-base sm:text-xs p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all resize-none text-[var(--text-primary)] placeholder:text-slate-400"
              rows={3}
              placeholder="Provide any key handover notes, special client conditions, or payment milestones..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
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
            {loading ? "Processing…" : "Confirm Handover"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
