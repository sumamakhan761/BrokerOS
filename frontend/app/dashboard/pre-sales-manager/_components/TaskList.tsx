import React, { useState, useRef, useEffect } from "react";
import { ManagerTask, Employee } from "./types";
import { Target, MoreHorizontal, Edit2, Trash2 } from "lucide-react";

interface TaskListProps {
  tasks: ManagerTask[];
  employees: Employee[];
  availableEmployees: Employee[];
  onEdit: (task: ManagerTask) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function TaskList({ tasks, employees, availableEmployees, onEdit, onDelete, onNew }: TaskListProps) {
  const [openTaskMenu, setOpenTaskMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenTaskMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-800">Daily Call Tasks</h2>
        </div>
        <button
          id="create-task-btn"
          className={`bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer shadow-sm hover:shadow transition-all ${availableEmployees.length === 0 && employees.length > 0 ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"
            }`}
          onClick={onNew}
          disabled={availableEmployees.length === 0 && employees.length > 0}
        >
          + Create Task
        </button>
      </div>
      {tasks.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
          <Target className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No active tasks. Create a task to set daily cold call targets for your team.</p>
        </div>
      ) : (
        <div className="gap-6">
          {tasks.map((task, i) => (
            <div key={task.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start gap-4 mb-4 pr-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 border border-indigo-200 shadow-inner">
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {task.coldCallTarget} Calls
                  </h3>
                  <div className="text-[11px] font-bold text-indigo-500 mt-1 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md inline-block">Daily Target</div>
                </div>
              </div>

              <div className="flex-1 pt-2 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assigned To</div>
                <div className="text-sm font-medium text-slate-700 line-clamp-2">
                  {task.assignees.length === employees.length
                    ? "All employees"
                    : task.assignees.map((a) => a.user.name || a.user.username).join(", ")}
                </div>
              </div>

              <div className="absolute top-4 right-4" ref={openTaskMenu === task.id ? menuRef : null}>
                <button
                  id={`task-menu-${task.id}`}
                  className="bg-transparent border-none cursor-pointer p-2 rounded-xl transition-colors text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenTaskMenu(openTaskMenu === task.id ? null : task.id);
                  }}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {openTaskMenu === task.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[160px] py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button className="w-full text-left px-4 py-2.5 text-sm cursor-pointer text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 border-none bg-transparent" onClick={() => { onEdit(task); setOpenTaskMenu(null); }}>
                      <Edit2 className="w-4 h-4" /> Edit Target
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm cursor-pointer text-red-500 hover:bg-red-50 font-medium flex items-center gap-2 border-none bg-transparent" onClick={() => { onDelete(task.id); setOpenTaskMenu(null); }}>
                      <Trash2 className="w-4 h-4" /> Delete Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
