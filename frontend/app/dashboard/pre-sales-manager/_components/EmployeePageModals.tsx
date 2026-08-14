import React from "react";
import { Modal } from "./Modal";
import { Employee, Announcement, ManagerTask } from "./types";
import { Avatar } from "@/components/dashboard/Avatar";

const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400";
const labelClasses = "block text-[13px] font-bold text-slate-700 mb-2";
const btnPrimary = "w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none rounded-xl py-3 px-6 text-[14px] font-bold cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed";
const btnGhostActive = "bg-indigo-50 text-indigo-600 border-2 border-indigo-500 hover:bg-indigo-100";
const btnGhostInactive = "bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50";
const btnGhostBase = "flex-1 py-2.5 px-4 rounded-xl text-[13px] font-bold transition-all cursor-pointer";

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
        <Modal title="Create Daily Call Task" onClose={() => props.setShowTaskModal(false)}>
          <div className="flex flex-col gap-5">
            <div>
              <label className={labelClasses}>Daily Cold Call Target</label>
              <input id="task-target-input" type="number" min={1} value={props.taskTarget} onChange={(e) => props.setTaskTarget(e.target.value)} className={inputClasses} placeholder="e.g. 90" />
            </div>
            <div>
              <label className={labelClasses}>Assign To</label>
              <div className="flex gap-3 mb-4">
                <button
                  id="assign-all-btn"
                  onClick={() => props.setTaskAssignAll(true)}
                  className={`${btnGhostBase} ${props.taskAssignAll ? btnGhostActive : btnGhostInactive}`}
                >
                  All Employees
                </button>
                <button
                  id="assign-specific-btn"
                  onClick={() => props.setTaskAssignAll(false)}
                  className={`${btnGhostBase} ${!props.taskAssignAll ? btnGhostActive : btnGhostInactive}`}
                >
                  Select Specific
                </button>
              </div>
              {!props.taskAssignAll && (
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {props.availableEmployees.map((emp) => {
                    const isSelected = props.taskSelectedUsers.includes(emp.id);
                    return (
                      <label key={emp.id} className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all border-2 ${isSelected ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                        <div className="relative flex items-center">
                          <input type="checkbox" className="peer sr-only" checked={isSelected} onChange={(e) => {
                            if (e.target.checked) props.setTaskSelectedUsers((p) => [...p, emp.id]);
                            else props.setTaskSelectedUsers((p) => p.filter((id) => id !== emp.id));
                          }} />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300'}`}>
                            {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                        </div>
                        <Avatar name={emp.name || emp.username} size={32} />
                        <span className="text-[14px] font-bold text-slate-700">{emp.name || emp.username}</span>
                      </label>
                    );
                  })}
                  {props.availableEmployees.length === 0 && <p className="text-[13px] text-slate-400 p-2 text-center bg-slate-50 rounded-lg border border-slate-100">All employees already have a task assigned.</p>}
                </div>
              )}
            </div>
            <button id="save-task-btn" onClick={props.handleCreateTask} disabled={props.taskSaving} className={`${btnPrimary} mt-2`}>
              {props.taskSaving ? "Creating…" : "Create Task"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Edit Task Modal ── */}
      {props.editTask && (
        <Modal title="Edit Task Target" onClose={() => props.setEditTask(null)}>
          <div className="flex flex-col gap-6">
            <div>
              <label className={labelClasses}>New Daily Cold Call Target</label>
              <input id="edit-task-target-input" type="number" min={1} value={props.editTarget} onChange={(e) => props.setEditTarget(e.target.value)} className={inputClasses} />
            </div>
            <button id="save-edit-task-btn" onClick={props.handleEditTask} disabled={props.taskSaving} className={btnPrimary}>
              {props.taskSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Announcement Modal ── */}
      {props.showAnnModal && (
        <Modal title={props.editAnn ? "Edit Announcement" : "New Announcement"} onClose={() => { props.setShowAnnModal(false); props.setEditAnn(null); }}>
          <div className="flex flex-col gap-5">
            <div>
              <label className={labelClasses}>Title</label>
              <input id="ann-title-input" value={props.annTitle} onChange={(e) => props.setAnnTitle(e.target.value)} className={inputClasses} placeholder="e.g. Team Meeting Tomorrow at 10am" />
            </div>
            <div>
              <label className={labelClasses}>Description</label>
              <textarea id="ann-desc-input" value={props.annDesc} onChange={(e) => props.setAnnDesc(e.target.value)} className={`${inputClasses} min-h-[120px] resize-y`} placeholder="Full announcement text…" />
            </div>
            <button id="save-ann-btn" onClick={props.handleSaveAnn} disabled={props.annSaving} className={`${btnPrimary} mt-2`}>
              {props.annSaving ? "Saving…" : props.editAnn ? "Save Changes" : "Post Announcement"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
