"use client";

export function CPSalesPipeline({
  pipeline,
}: {
  pipeline: Record<string, number>;
}) {
  if (!pipeline) return null;

  const stages = [
    { key: "NEW", label: "New Leads", color: "#3b82f6" },
    { key: "SITE_VISIT_SCHEDULED", label: "Site Visits", color: "#9333ea" },
    { key: "NEGOTIATION", label: "In Negotiation", color: "#f97316" },
    { key: "BOOKED", label: "Booked", color: "#10b981" },
  ];

  const pipelineData = {
    NEW: (pipeline["NEW"] || 0) + (pipeline["CONTACTED"] || 0),
    SITE_VISIT_SCHEDULED:
      (pipeline["SITE_VISIT_SCHEDULED"] || 0) +
      (pipeline["SITE_VISIT_CONDUCTED"] || 0),
    NEGOTIATION: pipeline["NEGOTIATION"] || 0,
    BOOKED: pipeline["BOOKED"] || 0,
  };

  const total = Object.values(pipelineData).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white border border-slate-200/80 shadow-2xs rounded-3xl p-5 relative overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
          Channel Partner Sales Funnel
        </h2>
        <span className="text-[10px] font-extrabold text-[var(--text-muted)] bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
          {total} Active Opportunities
        </span>
      </div>

      {total === 0 ? (
        <div className="py-8 flex items-center justify-center text-xs font-semibold text-[var(--text-muted)] text-center">
          No broker leads in the pipeline yet.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex h-5 rounded-full overflow-hidden shadow-inner bg-slate-100">
            {stages.map((stage) => {
              const count =
                pipelineData[stage.key as keyof typeof pipelineData] || 0;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              if (percentage === 0) return null;
              return (
                <div
                  key={stage.key}
                  style={{
                    backgroundColor: stage.color,
                    width: `${percentage}%`,
                  }}
                  className="h-full transition-all duration-700 flex items-center justify-center"
                >
                  {percentage > 8 && (
                    <span className="text-[9px] font-extrabold text-white tabular-nums drop-shadow-xs">
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stages.map((stage) => {
              const count =
                pipelineData[stage.key as keyof typeof pipelineData] || 0;
              return (
                <div
                  key={stage.key}
                  className="bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider truncate">
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-lg font-black text-[var(--text-primary)] tabular-nums pl-4">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
