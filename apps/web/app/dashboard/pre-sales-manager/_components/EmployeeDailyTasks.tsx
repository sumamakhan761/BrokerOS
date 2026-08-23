import React from "react";
import { CircleProgress } from "./CircleProgress";
import { EmployeeDashboardData } from "./types";
import { ListTodo, AlertCircle, Edit2 } from "lucide-react";

interface EmployeeDailyTasksProps {
  tasks: EmployeeDashboardData["dailyTasks"];
  hasBacklog: boolean;
  onEditTask: () => void;
}

export function EmployeeDailyTasks({ tasks, hasBacklog, onEditTask }: EmployeeDailyTasksProps) {
  return (
    <div className={`relative rounded-2xl p-6 shadow-sm border ${hasBacklog ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-100'}`}>
      {hasBacklog && (
        <div className="absolute top-0 left-0 right-0 bg-amber-100/80 rounded-t-2xl px-5 py-2.5 flex items-center gap-2 border-b border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-[12px] font-bold text-amber-700">Employee has backlogs</span>
        </div>
      )}
      <div className={hasBacklog ? "mt-10" : ""}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 m-0">Daily Tasks</h2>
          </div>
          <button
            onClick={onEditTask}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-none rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Task
          </button>
        </div>
        <div className="flex justify-around items-start">
          <CircleProgress
            done={tasks.coldCall.done}
            target={tasks.coldCall.target}
            label="Cold Calls"
            color="#6366f1"
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
