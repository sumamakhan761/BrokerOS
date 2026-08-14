import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, XCircle } from 'lucide-react';

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
      case 'REQUESTED': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'CLOSED': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-200/50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <h2 className="font-extrabold text-lg text-slate-900 tracking-tight">
            Ticket #{ticket.id.slice(0, 8).toUpperCase()}
          </h2>
          <div className="text-sm font-medium text-slate-500 mt-0.5">
            {role === 'SALES_MANAGER' ? `Requested by ${ticket.salesExec.name}` : `Sent to ${ticket.manager.name}`}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="default" className={`${getStatusColor(ticket.status)} border rounded-full px-3 py-1 font-medium`}>
          {ticket.status}
        </Badge>

        {role === 'SALES_MANAGER' && ticket.status !== 'CLOSED' && (
          <Button variant="outline" size="sm" onClick={handleCloseTicket} disabled={loading} className="font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm">
            <XCircle className="w-4 h-4 mr-2" />
            Close Ticket
          </Button>
        )}
      </div>
    </div>
  );
}
