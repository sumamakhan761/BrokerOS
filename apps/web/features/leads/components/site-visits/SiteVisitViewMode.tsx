import React from "react";
import {
  Edit2,
  Smile,
  Meh,
  Frown,
  Flame,
  CheckCircle2,
  Zap,
  Snowflake,
  ThumbsUp,
} from "lucide-react";
import {
  SiteVisit,
  INTEREST_LEVEL_COLORS,
  REACTION_LABELS,
  PROBABILITY_LABELS,
} from "@/features/leads/types/site-visit-constants";

interface SiteVisitViewModeProps {
  sv: SiteVisit;
  startEdit: (sv: SiteVisit) => void;
}

const ReactionIcon = ({ reaction }: { reaction: string }) => {
  switch (reaction) {
    case "VERY_POSITIVE":
      return <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />;
    case "POSITIVE":
      return <Smile className="w-3.5 h-3.5 text-emerald-500" />;
    case "NEUTRAL":
      return <Meh className="w-3.5 h-3.5 text-amber-500" />;
    case "NEGATIVE":
      return <Frown className="w-3.5 h-3.5 text-rose-500" />;
    default:
      return null;
  }
};

const ProbabilityIcon = ({ prob }: { prob: string }) => {
  switch (prob) {
    case "VERY_HIGH":
      return <Flame className="w-3.5 h-3.5 text-orange-500" />;
    case "HIGH":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    case "MEDIUM":
      return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    case "LOW":
      return <Snowflake className="w-3.5 h-3.5 text-sky-500" />;
    default:
      return null;
  }
};

export function SiteVisitViewMode({ sv, startEdit }: SiteVisitViewModeProps) {
  return (
    <div className="space-y-3.5 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {sv.interestLevel && (
          <div>
            <span className="text-[var(--text-muted)] font-medium">Interest Level:</span>
            <div className="mt-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold border ${
                  INTEREST_LEVEL_COLORS[sv.interestLevel] || ""
                }`}
              >
                {sv.interestLevel.replace("_", " ")}
              </span>
            </div>
          </div>
        )}

        {sv.budgetConfirmed && (
          <div>
            <span className="text-[var(--text-muted)] font-medium">Confirmed Budget:</span>
            <p className="font-extrabold text-[var(--text-primary)] tabular-nums mt-0.5 m-0">
              ₹{Number(sv.budgetConfirmed).toLocaleString("en-IN")}
            </p>
          </div>
        )}

        {sv.configInterest && (
          <div>
            <span className="text-[var(--text-muted)] font-medium">Configuration Liked:</span>
            <p className="font-bold text-[var(--text-primary)] mt-0.5 m-0">
              {sv.configInterest}
            </p>
          </div>
        )}

        {sv.customerReaction && (
          <div>
            <span className="text-[var(--text-muted)] font-medium">Customer Sentiment:</span>
            <p className="font-bold text-[var(--text-primary)] mt-0.5 flex items-center gap-1.5 m-0">
              <ReactionIcon reaction={sv.customerReaction} />
              <span>{REACTION_LABELS[sv.customerReaction] || sv.customerReaction}</span>
            </p>
          </div>
        )}

        {sv.closingProbability && (
          <div>
            <span className="text-[var(--text-muted)] font-medium">Closing Probability:</span>
            <p className="font-bold text-[var(--text-primary)] mt-0.5 flex items-center gap-1.5 m-0">
              <ProbabilityIcon prob={sv.closingProbability} />
              <span>{PROBABILITY_LABELS[sv.closingProbability] || sv.closingProbability}</span>
            </p>
          </div>
        )}

        {sv.nextAction && (
          <div>
            <span className="text-[var(--text-muted)] font-medium">Next Action:</span>
            <p className="font-bold text-[var(--text-primary)] mt-0.5 m-0">
              {sv.nextAction}
            </p>
          </div>
        )}
      </div>

      {sv.customerObjections && (
        <div className="bg-amber-50/80 rounded-xl p-3.5 border border-amber-200/80 space-y-1">
          <p className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider m-0">
            Objections Raised
          </p>
          <p className="text-xs text-amber-950 leading-relaxed m-0">
            {sv.customerObjections}
          </p>
        </div>
      )}

      {sv.meetingNotes && (
        <div className="bg-purple-50/80 rounded-xl p-3.5 border border-purple-200/80 space-y-1">
          <p className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider m-0">
            Discussion / Meeting Notes
          </p>
          <p className="text-xs text-purple-950 leading-relaxed m-0">
            {sv.meetingNotes}
          </p>
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={() => startEdit(sv)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-2xs active:scale-[0.96] press-effect cursor-pointer"
        >
          <Edit2 size={12} className="text-slate-500" />
          <span>Edit Visit Record</span>
        </button>
      </div>
    </div>
  );
}
