"use client";

import React, { useState, useRef, useEffect } from "react";
import { ManagerTask, Employee } from "./types";
import { Target, MoreHorizontal, Edit2, Trash2, Plus } from "lucide-react";

interface TaskListProps {
  tasks: ManagerTask[];
  employees: Employee[];
  availableEmployees: Employee[];
  onEdit: (task: ManagerTask) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function TaskList({
  tasks,
  employees,
  availableEmployees,
  onEdit,
  onDelete,
  onNew,
}: TaskListProps) {
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
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
            <Target size={16} />
          </div>
          <h2 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Daily Cold Call Task Targets
          </h2>
        </div>
        <button
          id="create-task-btn"
          className={`bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-2xs transition-all active:scale-[0.96] press-effect flex items-center gap-1.5 cursor-pointer ${
            availableEmployees.length === 0 && employees.length > 0
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={onNew}
          disabled={availableEmployees.length === 0 && employees.length > 0}
        >
          <Plus size={13} />
          <span>Create Task Target</span>
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center bg-slate-50/60 rounded-3xl border border-slate-200 border-dashed space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-2xs">
            <Target size={18} />
          </div>
          <p className="text-xs font-semibold text-[var(--text-muted)] m-0">
            No active targets configured. Set daily cold call targets for your team.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between relative"
            >
              <div className="space-y-3 pr-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)] border border-purple-200 shadow-2xs shrink-0">
                    <Target size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)] m-0 tabular-nums">
                      {task.coldCallTarget} Dials / Day
                    </h3>
                    <div className="text-[9px] font-extrabold text-[var(--brand-700)] uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-purple-200/60">
                      Active Target
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Assigned Agents
                  </div>
                  <div className="text-xs font-bold text-slate-700 line-clamp-2 leading-relaxed">
                    {task.assignees.length === employees.length
                      ? "All team employees"
                      : task.assignees
                          .map((a) => a.user.name || a.user.username)
                          .join(", ")}
                  </div>
                </div>
              </div>

              <div
                className="absolute top-4 right-4"
                ref={openTaskMenu === task.id ? menuRef : null}
              >
                <button
                  id={`task-menu-${task.id}`}
                  className="w-7 h-7 bg-transparent hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenTaskMenu(openTaskMenu === task.id ? null : task.id);
                  }}
                >
                  <MoreHorizontal size={15} />
                </button>
                {openTaskMenu === task.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 min-w-[140px] p-1 overflow-hidden animate-enter">
                    <button
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      onClick={() => {
                        onEdit(task);
                        setOpenTaskMenu(null);
                      }}
                    >
                      <Edit2 size={13} /> <span>Edit Target</span>
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      onClick={() => {
                        onDelete(task.id);
                        setOpenTaskMenu(null);
                      }}
                    >
                      <Trash2 size={13} /> <span>Delete Target</span>
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
