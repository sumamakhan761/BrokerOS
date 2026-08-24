"use client";

import React from "react";
import { Modal } from "./Modal";
import { Employee, Announcement, ManagerTask } from "./types";
import { Avatar } from "@/components/dashboard/Avatar";
import { Loader2 } from "lucide-react";

interface ModalsProps {
  // Create Task Modal
  showTaskModal: boolean;
  setShowTaskModal: (show: boolean) => void;
  taskTarget: string;
  setTaskTarget: (v: string) => void;
  taskAssignAll: boolean;
  setTaskAssignAll: (v: boolean) => void;
  availableEmployees: Employee[];
  taskSelectedUsers: string[];
  setTaskSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
  handleCreateTask: () => void;
  taskSaving: boolean;

  // Edit Task Modal
  editTask: ManagerTask | null;
  setEditTask: (task: ManagerTask | null) => void;
  editTarget: string;
  setEditTarget: (v: string) => void;
  handleEditTask: () => void;

  // Announcement Modal
  showAnnModal: boolean;
  setShowAnnModal: (show: boolean) => void;
  editAnn: Announcement | null;
  setEditAnn: (ann: Announcement | null) => void;
  annTitle: string;
  setAnnTitle: (v: string) => void;
  annDesc: string;
  setAnnDesc: (v: string) => void;
  handleSaveAnn: () => void;
  annSaving: boolean;
}

export function EmployeePageModals(props: ModalsProps) {
  return (
    <>
      {/* ── Create Task Modal ── */}
      {props.showTaskModal && (
        <Modal
          title="Create Daily Cold Call Target"
          onClose={() => props.setShowTaskModal(false)}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Daily Cold Call Target
              </label>
              <input
                id="task-target-input"
                type="number"
                min={1}
                value={props.taskTarget}
                onChange={(e) => props.setTaskTarget(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
                placeholder="e.g. 90"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Assign Scope
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  id="assign-all-btn"
                  onClick={() => props.setTaskAssignAll(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    props.taskAssignAll
                      ? "bg-purple-50 text-[var(--brand-700)] border-purple-300 shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  All Employees
                </button>
                <button
                  id="assign-specific-btn"
                  onClick={() => props.setTaskAssignAll(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    !props.taskAssignAll
                      ? "bg-purple-50 text-[var(--brand-700)] border-purple-300 shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Select Specific
                </button>
              </div>
              {!props.taskAssignAll && (
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {props.availableEmployees.map((emp) => {
                    const isSelected = props.taskSelectedUsers.includes(emp.id);
                    return (
                      <label
                        key={emp.id}
                        className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all border ${
                          isSelected
                            ? "bg-purple-50/60 border-purple-200"
                            : "bg-white border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="rounded text-[var(--brand-600)] focus:ring-0"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked)
                              props.setTaskSelectedUsers((p) => [...p, emp.id]);
                            else
                              props.setTaskSelectedUsers((p) =>
                                p.filter((id) => id !== emp.id)
                              );
                          }}
                        />
                        <Avatar
                          name={emp.name || emp.username}
                          size={28}
                        />
                        <span className="text-xs font-bold text-slate-700">
                          {emp.name || emp.username}
                        </span>
                      </label>
                    );
                  })}
                  {props.availableEmployees.length === 0 && (
                    <p className="text-xs text-slate-400 p-3 text-center bg-slate-50 rounded-xl border border-slate-100 font-medium m-0">
                      All employees already have a task assigned.
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              id="save-task-btn"
              onClick={props.handleCreateTask}
              disabled={props.taskSaving}
              className="w-full py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              {props.taskSaving && <Loader2 size={13} className="animate-spin" />}
              <span>{props.taskSaving ? "Creating…" : "Create Task Target"}</span>
            </button>
          </div>
        </Modal>
      )}

      {/* ── Edit Task Modal ── */}
      {props.editTask && (
        <Modal
          title="Edit Daily Call Target"
          onClose={() => props.setEditTask(null)}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                New Daily Cold Call Target
              </label>
              <input
                id="edit-task-target-input"
                type="number"
                min={1}
                value={props.editTarget}
                onChange={(e) => props.setEditTarget(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
              />
            </div>
            <button
              id="save-edit-task-btn"
              onClick={props.handleEditTask}
              disabled={props.taskSaving}
              className="w-full py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {props.taskSaving && <Loader2 size={13} className="animate-spin" />}
              <span>{props.taskSaving ? "Saving…" : "Save Target"}</span>
            </button>
          </div>
        </Modal>
      )}

      {/* ── Announcement Modal ── */}
      {props.showAnnModal && (
        <Modal
          title={props.editAnn ? "Edit Announcement" : "New Team Broadcast"}
          onClose={() => {
            props.setShowAnnModal(false);
            props.setEditAnn(null);
          }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Title / Headline
              </label>
              <input
                id="ann-title-input"
                value={props.annTitle}
                onChange={(e) => props.setAnnTitle(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
                placeholder="e.g. Sales Briefing Tomorrow at 10 AM"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Announcement Body
              </label>
              <textarea
                id="ann-desc-input"
                value={props.annDesc}
                onChange={(e) => props.setAnnDesc(e.target.value)}
                className="w-full p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 min-h-[100px] resize-y transition-all"
                placeholder="Broadcast details for the team…"
              />
            </div>
            <button
              id="save-ann-btn"
              onClick={props.handleSaveAnn}
              disabled={props.annSaving}
              className="w-full py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              {props.annSaving && <Loader2 size={13} className="animate-spin" />}
              <span>
                {props.annSaving
                  ? "Saving…"
                  : props.editAnn
                  ? "Save Changes"
                  : "Broadcast Announcement"}
              </span>
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
