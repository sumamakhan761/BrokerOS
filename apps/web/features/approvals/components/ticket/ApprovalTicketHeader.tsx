import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, XCircle, ShieldCheck } from "lucide-react";

interface ApprovalTicketHeaderProps {
  ticket: any;
  role: string;
  onBack: () => void;
  handleCloseTicket: () => void;
  loading: boolean;
}

export function ApprovalTicketHeader({
  ticket,
  role,
  onBack,
  handleCloseTicket,
  loading,
}: ApprovalTicketHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "CLOSED":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-4.5 sm:p-5.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-3xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all active:scale-[0.96] press-effect shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-sm sm:text-base text-[var(--text-primary)] tracking-tight tabular-nums m-0">
              Ticket #{ticket.id.slice(0, 8).toUpperCase()}
            </h2>
            {ticket.type === "BOOKING" && (
              <span className="bg-purple-50 text-[var(--brand-700)] border border-purple-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Booking
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5 m-0">
            {role === "SALES_MANAGER"
              ? `Requested by ${ticket.salesExec?.name || "Executive"}`
              : `Assigned to ${ticket.manager?.name || "Sales Manager"}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <span
          className={`border rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusColor(
            ticket.status
          )}`}
        >
          {ticket.status}
        </span>

        {role === "SALES_MANAGER" && ticket.status !== "CLOSED" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCloseTicket}
            disabled={loading}
            className="text-xs font-bold border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Close Ticket
          </Button>
        )}
      </div>
    </div>
  );
}
