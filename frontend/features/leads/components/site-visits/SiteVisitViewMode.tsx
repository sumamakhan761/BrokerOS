import React from 'react';
import { Edit2, Smile, Meh, Frown, Flame, CheckCircle2, Zap, Snowflake, ThumbsUp } from 'lucide-react';
import {
  SiteVisit,
  INTEREST_LEVEL_COLORS,
  REACTION_LABELS,
  PROBABILITY_LABELS,
} from '@/features/leads/types/site-visit-constants';

interface SiteVisitViewModeProps {
  sv: SiteVisit;
  startEdit: (sv: SiteVisit) => void;
}

const ReactionIcon = ({ reaction }: { reaction: string }) => {
  switch (reaction) {
    case 'VERY_POSITIVE': return <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />;
    case 'POSITIVE': return <Smile className="w-3.5 h-3.5 text-emerald-500" />;
    case 'NEUTRAL': return <Meh className="w-3.5 h-3.5 text-amber-500" />;
    case 'NEGATIVE': return <Frown className="w-3.5 h-3.5 text-red-500" />;
    default: return null;
  }
};

const ProbabilityIcon = ({ prob }: { prob: string }) => {
  switch (prob) {
    case 'VERY_HIGH': return <Flame className="w-3.5 h-3.5 text-orange-500" />;
    case 'HIGH': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    case 'MEDIUM': return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    case 'LOW': return <Snowflake className="w-3.5 h-3.5 text-blue-500" />;
    default: return null;
  }
};

export function SiteVisitViewMode({ sv, startEdit }: SiteVisitViewModeProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {sv.interestLevel && (
          <div><span className="text-gray-500 font-medium">Interest:</span> <br /> <span className={`ml-1.5 px-2.5 rounded-full text-[11px] uppercase tracking-wider font-bold ${INTEREST_LEVEL_COLORS[sv.interestLevel] || ''}`}>{sv.interestLevel.replace('_', ' ')}</span></div>
        )}
        {sv.budgetConfirmed && (
          <div><span className="text-gray-500 font-medium">Budget Confirmed:</span><br /> <span className="font-semibold text-gray-900 ml-1.5">₹{Number(sv.budgetConfirmed).toLocaleString('en-IN')}</span></div>
        )}
        {sv.configInterest && (
          <div><span className="text-gray-500 font-medium">Config Liked:</span><br /> <span className="font-semibold text-gray-900 ml-1.5">{sv.configInterest}</span></div>
        )}
        {sv.customerReaction && (
          <div className="flex items-center">
            <span className="text-gray-500 font-medium">Reaction:</span><br />
            <span className="font-semibold text-gray-900 ml-1.5 flex items-center gap-1.5">
              <ReactionIcon reaction={sv.customerReaction} />
              {REACTION_LABELS[sv.customerReaction] || sv.customerReaction}
            </span>
          </div>
        )}
        {sv.closingProbability && (
          <div className="flex items-center">
            <span className="text-gray-500 font-medium">Closing Prob:</span><br />
            <span className="font-semibold text-gray-900 ml-1.5 flex items-center gap-1.5">
              <ProbabilityIcon prob={sv.closingProbability} />
              {PROBABILITY_LABELS[sv.closingProbability] || sv.closingProbability}
            </span>
          </div>
        )}
        {sv.nextAction && (
          <div><span className="text-gray-500 font-medium">Next Action:</span><br /> <span className="font-semibold text-gray-900 ml-1.5">{sv.nextAction}</span></div>
        )}
      </div>
      {sv.customerObjections && (
        <div className="bg-orange-50/80 rounded-xl p-4 border border-orange-100/50">
          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-1.5">Objections Raised</p>
          <p className="text-sm text-gray-800 leading-relaxed">{sv.customerObjections}</p>
        </div>
      )}
      {sv.meetingNotes && (
        <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100/50">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1.5">Meeting Notes</p>
          <p className="text-sm text-gray-800 leading-relaxed">{sv.meetingNotes}</p>
        </div>
      )}
      <div className="pt-2">
        <button
          onClick={() => startEdit(sv)}
          className="inline-flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-medium px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          <Edit2 className="w-4 h-4 text-gray-500" />
          Edit Details
        </button>
      </div>
    </div>
  );
}
