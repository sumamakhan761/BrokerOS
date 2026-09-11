// ============================================================================
// BrokerOS — SMS Contact Drawer (Right Pane CRM Context)
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  X,
  Phone,
  Mail,
  User,
  Building,
  Flame,
  Zap,
  ExternalLink,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import type { SmsConversation } from '../../types/inbox';

interface SmsContactDrawerProps {
  conversation: SmsConversation;
  onClose: () => void;
}

export const SmsContactDrawer: React.FC<SmsContactDrawerProps> = ({
  conversation,
  onClose,
}) => {
  const lead = conversation.lead;
  const leadName =
    conversation.contactName ||
    (lead ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : null) ||
    'Mobile Prospect';

  const temperature = lead?.temperature || 'WARM';

  return (
    <div className="w-80 border-l border-slate-200 bg-white h-full flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Lead & CRM Profile
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Contact Info Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 font-extrabold text-sm flex items-center justify-center mx-auto border border-amber-200">
            {leadName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900">{leadName}</div>
            <div className="font-mono text-xs text-slate-500 font-bold mt-0.5">
              {conversation.contactPhone}
            </div>
          </div>

          {/* Temperature Badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 shadow-2xs">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>{temperature} Lead</span>
          </div>
        </div>

        {/* Lead Details */}
        <div className="space-y-3">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Pipeline Details
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-500 font-medium">CRM Status</span>
              <span className="font-bold text-slate-900">{lead?.status || 'Active Inbound'}</span>
            </div>

            {lead?.budget && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-500 font-medium">Budget</span>
                <span className="font-bold text-emerald-700">₹{lead.budget.toLocaleString()}</span>
              </div>
            )}

            {lead?.email && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-500 font-medium">Email</span>
                <span className="font-bold text-slate-900 truncate max-w-[150px]">{lead.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Source */}
        {conversation.campaign && (
          <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-1">
            <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
              Source SMS Broadcast
            </div>
            <div className="font-extrabold text-xs text-slate-900 truncate">
              {conversation.campaign.title}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {lead?.id && (
          <div className="pt-2">
            <Link
              href={`/dashboard/leads/${lead.id}`}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors shadow-2xs"
            >
              <span>View in Lead Management</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
