import React from 'react';
import { Input } from '@/components/ui/Input';
import { Globe, DollarSign, Building2, MapPin, Briefcase, Calendar } from 'lucide-react';

interface LeadInformationEditProps {
  leadInfoData: any;
  setLeadInfoData: (data: any) => void;
  availableSources: any[];
  availableProjects: any[];
}

export function LeadInformationEdit({ leadInfoData, setLeadInfoData, availableSources, availableProjects }: LeadInformationEditProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 flex items-center gap-2"><Globe className="w-4 h-4" /> Source</label>
        <select
          value={leadInfoData.sourceId}
          onChange={(e) => setLeadInfoData({ ...leadInfoData, sourceId: e.target.value })}
          className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
        >
          <option value="">Select a source...</option>
          {availableSources.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Budget</label>
        <Input
          type="number"
          value={leadInfoData.budget}
          onChange={(e) => setLeadInfoData({ ...leadInfoData, budget: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 flex items-center gap-2"><Building2 className="w-4 h-4" /> Project</label>
        <select
          value={leadInfoData.interestedProjectId}
          onChange={(e) => setLeadInfoData({ ...leadInfoData, interestedProjectId: e.target.value })}
          className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
        >
          <option value="">Select a project...</option>
          {availableProjects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Pref. Location</label>
        <Input
          type="text"
          placeholder="e.g. Bandra, Andheri"
          value={leadInfoData.preferredLocation}
          onChange={(e) => setLeadInfoData({ ...leadInfoData, preferredLocation: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Requirements</label>
        <Input
          type="text"
          placeholder="e.g. 1 BHK, 2 BHK, Sea facing"
          value={leadInfoData.requirements}
          onChange={(e) => setLeadInfoData({ ...leadInfoData, requirements: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Last Contacted</label>
        <Input
          type="date"
          value={leadInfoData.lastContactDate}
          onChange={(e) => setLeadInfoData({ ...leadInfoData, lastContactDate: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Next Follow-up</label>
        <Input
          type="date"
          value={leadInfoData.nextFollowUpDate}
          onChange={(e) => setLeadInfoData({ ...leadInfoData, nextFollowUpDate: e.target.value })}
        />
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Site Visit</span>
        <span className="text-gray-400 text-xs italic">Read only</span>
      </div>
    </div>
  );
}
