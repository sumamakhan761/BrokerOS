import React, { useState } from "react";
import { TrendingUp, ChevronDown, ChevronUp, Handshake } from "lucide-react";

interface NegotiationTimelineProps {
  negotiationNotes: any[];
}

export function NegotiationTimeline({
  negotiationNotes,
}: NegotiationTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (negotiationNotes.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-slate-100">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-xs font-semibold text-[var(--text-secondary)] m-0">
          No negotiation rounds logged yet
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 m-0">
          Click &quot;Add Round&quot; above to log pricing conversations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {negotiationNotes.map((note) => {
        const data = {
          askingPrice: note.askingPrice,
          offeredPrice: note.offeredPrice,
          objections: note.customerObjections,
          strategy: note.managerSuggestion,
          title: note.negotiationNotes,
          nextStep: note.nextActionPlan,
        };
        const isExpanded = expandedId === note.id;
        const gap =
          data.askingPrice && data.offeredPrice
            ? Number(data.askingPrice) - Number(data.offeredPrice)
            : null;

        return (
          <div
            key={note.id}
            className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs transition-all bg-white"
          >
            {/* Header Row */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
              onClick={() => toggleExpand(note.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-200 text-[var(--brand-700)]">
                  <Handshake size={16} />
                </div>
                <div>
                  <p className="font-bold text-xs text-[var(--text-primary)] m-0">
                    {data.title || "Negotiation Round"}
                  </p>
                  <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 tabular-nums m-0">
                    {new Date(note.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {gap !== null && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full tabular-nums">
                    Gap: ₹{gap.toLocaleString("en-IN")}
                  </span>
                )}
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 text-slate-500">
                  {isExpanded ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Detail */}
            {isExpanded && (
              <div className="border-t border-slate-100 p-4 bg-slate-50/40 space-y-3.5 animate-enter">
                {(data.askingPrice || data.offeredPrice) && (
                  <div className="flex flex-wrap gap-3">
                    {data.askingPrice && (
                      <div className="bg-sky-50 border border-sky-200 rounded-xl px-3.5 py-2 text-center">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 m-0">
                          Firm Asking Price
                        </p>
                        <p className="text-xs font-extrabold text-sky-950 tabular-nums mt-0.5 m-0">
                          ₹{Number(data.askingPrice).toLocaleString("en-IN")}
                        </p>
                      </div>
                    )}

                    {data.offeredPrice && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 text-center">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 m-0">
                          Customer Offer
                        </p>
                        <p className="text-xs font-extrabold text-amber-950 tabular-nums mt-0.5 m-0">
                          ₹{Number(data.offeredPrice).toLocaleString("en-IN")}
                        </p>
                      </div>
                    )}

                    {gap !== null && gap > 0 && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2 text-center">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 m-0">
                          Price Delta
                        </p>
                        <p className="text-xs font-extrabold text-rose-950 tabular-nums mt-0.5 m-0">
                          ₹{gap.toLocaleString("en-IN")}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2.5 text-xs">
                  {data.objections && (
                    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <h4 className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider m-0">
                          Customer Objections
                        </h4>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed m-0">
                        {data.objections}
                      </p>
                    </div>
                  )}

                  {data.strategy && (
                    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <h4 className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider m-0">
                          Negotiation Strategy & Counter
                        </h4>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed m-0">
                        {data.strategy}
                      </p>
                    </div>
                  )}

                  {data.nextStep && (
                    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <h4 className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider m-0">
                          Next Action Agreed
                        </h4>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed m-0">
                        {data.nextStep}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
