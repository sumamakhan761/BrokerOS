"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export interface LivePromptVariablePreviewProps {
  sampleLead: {
    firstName?: string;
    fullName?: string;
    budget?: string | number;
  };
  sampleProject: {
    name?: string;
    city?: string;
  };
}

export function LivePromptVariablePreview({
  sampleLead,
  sampleProject,
}: LivePromptVariablePreviewProps) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl w-fit flex-wrap">
      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
      <span>
        Audience Preview Simulation: &#123;&#123;lead.firstName&#125;&#125; &rarr;{" "}
        <strong className="text-slate-800">{sampleLead.firstName || "Prospect"}</strong> ·{" "}
        &#123;&#123;project.name&#125;&#125; &rarr;{" "}
        <strong className="text-slate-800">{sampleProject.name || "Skyline Towers"}</strong>
        {sampleProject.city && (
          <>
            {" "}· &#123;&#123;project.city&#125;&#125; &rarr;{" "}
            <strong className="text-slate-800">{sampleProject.city}</strong>
          </>
        )}
      </span>
    </div>
  );
}
