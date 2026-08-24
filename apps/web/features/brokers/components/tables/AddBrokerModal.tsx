import React from "react";
import { UserPlus, X } from "lucide-react";

interface AddBrokerModalProps {
  isCP: boolean;
  form: any;
  setForm: (form: any) => void;
  saving: boolean;
  projects: any[];
  sourcingManagers: any[];
  handleCreate: (e: React.FormEvent) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

export function AddBrokerModal({
  isCP,
  form,
  setForm,
  saving,
  projects,
  sourcingManagers,
  handleCreate,
  setIsModalOpen,
}: AddBrokerModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-enter">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 border border-slate-200/80">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <UserPlus size={16} />
            </div>
            <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              Register New Broker Partner
            </h2>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Company / Agency Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Apex Realty"
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Contact Person Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Sanjay Verma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Phone Number *
              </label>
              <input
                required
                type="text"
                placeholder="+91..."
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                City / Location *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Mumbai"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                RERA Registration No.
              </label>
              <input
                type="text"
                value={form.reraNumber}
                onChange={(e) =>
                  setForm({ ...form, reraNumber: e.target.value })
                }
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
                placeholder="Optional RERA ID"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                GST Number
              </label>
              <input
                type="text"
                value={form.gstNumber}
                onChange={(e) =>
                  setForm({ ...form, gstNumber: e.target.value })
                }
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
                placeholder="Optional GSTIN"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Service Areas
            </label>
            <input
              type="text"
              value={form.serviceAreas}
              onChange={(e) =>
                setForm({ ...form, serviceAreas: e.target.value })
              }
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
              placeholder="e.g. Bandra, Khar, BKC (comma separated)"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Assign Applicable CP Projects
            </label>
            <div className="border border-slate-200 rounded-xl p-2.5 max-h-32 overflow-y-auto bg-slate-50/50 space-y-1">
              {projects.length === 0 ? (
                <div className="text-xs text-[var(--text-muted)] italic p-2">
                  No projects available.
                </div>
              ) : (
                projects.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.assignedProjects.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({
                            ...form,
                            assignedProjects: [
                              ...form.assignedProjects,
                              p.id,
                            ],
                          });
                        } else {
                          setForm({
                            ...form,
                            assignedProjects: form.assignedProjects.filter(
                              (id: string) => id !== p.id
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                    <span>{p.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {isCP && (
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Assign Sourcing Manager
              </label>
              <select
                value={form.sourcingManagerId}
                onChange={(e) =>
                  setForm({ ...form, sourcingManagerId: e.target.value })
                }
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
              >
                <option value="">-- Unassigned --</option>
                {sourcingManagers.map((sm) => (
                  <option key={sm.id} value={sm.id}>
                    {sm.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Creating…" : "Register Broker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
