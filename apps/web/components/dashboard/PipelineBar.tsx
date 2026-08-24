import React from "react";
import { BarChart3 } from "lucide-react";

export interface PipelineStage {
  key: string;
  label: string;
  color: string;
}

export function PipelineBar({
  title = "Pipeline Stages",
  stages,
  data,
}: {
  title?: string;
  stages: PipelineStage[];
  data: Record<string, number>;
}) {
  const values = Object.values(data);
  const max = values.length > 0 ? Math.max(1, ...values) : 1;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 size={16} className="text-[var(--brand-600)] flex-shrink-0" />
        <h2 className="text-xs font-bold text-[var(--text-primary)] tracking-tight m-0">
          {title}
        </h2>
      </div>

      {/* Stage Bars */}
      <div className="space-y-3.5 flex-1">
        {stages.map((stage) => {
          const count = data[stage.key] ?? 0;
          const pct = Math.round((count / max) * 100);
          return (
            <div key={stage.key}>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-[var(--text-secondary)]">
                  {stage.label}
                </span>
                <span className="font-extrabold text-[var(--text-primary)] tabular-nums">
                  {count}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
