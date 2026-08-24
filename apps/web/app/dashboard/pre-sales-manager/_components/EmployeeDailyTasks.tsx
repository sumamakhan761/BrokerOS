"use client";

import React from "react";
import { CircleProgress } from "./CircleProgress";
import { EmployeeDashboardData } from "./types";
import { ListTodo, AlertCircle, Edit2 } from "lucide-react";

interface EmployeeDailyTasksProps {
  tasks: EmployeeDashboardData["dailyTasks"];
  hasBacklog: boolean;
  onEditTask: () => void;
}

export function EmployeeDailyTasks({
  tasks,
  hasBacklog,
  onEditTask,
}: EmployeeDailyTasksProps) {
  return (
    <div
      className={`relative rounded-3xl p-6 shadow-2xs border ${
        hasBacklog
          ? "bg-amber-50/40 border-amber-200/80"
          : "bg-white border-slate-200/80"
      }`}
    >
      {hasBacklog && (
        <div className="mb-4 bg-amber-100/70 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 border border-amber-200">
          <AlertCircle size={13} className="text-amber-700 shrink-0" />
          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
            Employee has pending backlogs
          </span>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <ListTodo size={14} />
            </div>
            <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
              Daily Call Goals
            </h2>
          </div>
          <button
            onClick={onEditTask}
            className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-[var(--brand-700)] border border-purple-200/60 rounded-xl px-2.5 py-1 text-xs font-bold cursor-pointer transition-all active:scale-[0.96] press-effect shadow-2xs"
          >
            <Edit2 size={12} />
            <span>Edit Target</span>
          </button>
        </div>

        <div className="flex justify-around items-start">
          <CircleProgress
            done={tasks.coldCall.done}
            target={tasks.coldCall.target}
            label="Cold Calls"
            color="#9333ea"
          />
          <CircleProgress
            done={tasks.followUp.done}
            target={tasks.followUp.target || 1}
            label="Follow-ups"
            color="#10b981"
          />
        </div>
      </div>
    </div>
  );
}
