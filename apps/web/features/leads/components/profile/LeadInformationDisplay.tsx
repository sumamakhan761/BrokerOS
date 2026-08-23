import React from 'react';
import { Globe, User, UserCheck, DollarSign, Building2, MapPin, Briefcase, Calendar } from 'lucide-react';

interface LeadInformationDisplayProps {
  lead: any;
}

export function LeadInformationDisplay({ lead }: LeadInformationDisplayProps) {
  return (
    <>
      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
        <span className="text-gray-500 flex items-center gap-2"><Globe className="w-4 h-4" /> Source</span>
        <span className="font-medium text-gray-900">{lead.source?.name || 'Unknown'}</span>
      </div>
      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
        <span className="text-gray-500 flex items-center gap-2"><User className="w-4 h-4" /> Agent Name</span>
        <span className="font-medium text-gray-900">{lead.assignedUser ? (lead.assignedUser.name || lead.assignedUser.username) : 'Unassigned'}</span>
      </div>
      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
        <span className="text-gray-500 flex items-center gap-2"><UserCheck className="w-4 h-4" /> SE</span>
        <span className="font-medium text-gray-900">{lead.salesExecutive ? (lead.salesExecutive.name || lead.salesExecutive.username) : 'Unassigned'}</span>
      </div>
      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
        <span className="text-gray-500 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Budget</span>
        <span className="font-medium text-gray-900">
          {lead.budget ? lead.budget.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'Not specified'}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
        <span className="text-gray-500 flex items-center gap-2"><Building2 className="w-4 h-4" /> Project</span>
        <span className="font-medium text-gray-900 text-right max-w-[150px] truncate" title={lead.interestedProject?.name || 'Any / None specified'}>
          {lead.interestedProject?.name || 'Any'}
        </span>
      </div>
      {lead.interestedTower && (
        <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
          <span className="text-gray-500 flex items-center gap-2"><Building2 className="w-4 h-4" /> Tower</span>
          <span className="font-medium text-gray-900 text-right max-w-[150px] truncate" title={lead.interestedTower.name}>
            {lead.interestedTower.name}
          </span>
        </div>
      )}
      {lead.interestedUnit && (
        <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
          <span className="text-gray-500 flex items-center gap-2"><Building2 className="w-4 h-4" /> Unit</span>
          <span className="font-medium text-gray-900 text-right max-w-[150px] truncate" title={lead.interestedUnit.unitNumber}>
            {lead.interestedUnit.unitNumber}
          </span>
        </div>
      )}
      {lead.broker && (
        <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
          <span className="text-gray-500 flex items-center gap-2"><UserCheck className="w-4 h-4" /> Broker</span>
          <span className="font-medium text-gray-900 text-right max-w-[150px] truncate" title={lead.broker.name}>
            {lead.broker.name}
          </span>
        </div>
      )}
      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
        <span className="text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Pref. Location</span>
        <span className="font-medium text-gray-900 text-right max-w-[150px] truncate" title={lead.preferredLocation || 'Not specified'}>
          {lead.preferredLocation || 'Not specified'}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
        <span className="text-gray-500 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Requirements</span>
        <span className="font-medium text-gray-900 text-right max-w-[150px] truncate" title={lead.requirements || 'Not specified'}>
          {lead.requirements || 'Not specified'}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
        <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Last Contacted</span>
        <span className="font-medium text-gray-900">{lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'Never'}</span>
      </div>
      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
        <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Next Follow-up</span>
        <span className="font-medium text-gray-900">{lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'Not scheduled'}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Site Visit</span>
        <span className="font-medium text-gray-900">{lead.siteVisits?.[0]?.scheduledDate ? new Date(lead.siteVisits[0].scheduledDate).toLocaleDateString() : 'No visits'}</span>
      </div>
    </>
  );
}
