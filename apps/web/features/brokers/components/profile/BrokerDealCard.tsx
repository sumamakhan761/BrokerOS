import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Briefcase, Plus, FileText, Lock, Unlock, Edit2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface BrokerDealCardProps {
  brokerId: string;
  broker: any;
  onRefresh: () => void;
}

export function BrokerDealCard({
  brokerId,
  broker,
  onRefresh,
}: BrokerDealCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    projectId: "",
    towerId: "",
    brokeragePercent: "",
    brokerageFlat: "",
    isLocked: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const pathname = usePathname() || "";
  const isCP = pathname.includes("/channel-partner");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await fetch(
          `${baseUrl}/api/inventory/projects?isCpProject=true`
        );
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    };
    loadProjects();
  }, []);

  const handleSave = async () => {
    if (!formData.projectId) {
      setError("Please select a project");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${baseUrl}/api/brokers/${brokerId}/deal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAdding(false);
        setFormData({
          projectId: "",
          towerId: "",
          brokeragePercent: "",
          brokerageFlat: "",
          isLocked: false,
        });
        onRefresh();
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to save deal");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const assignments = broker?.projectAssignments || [];

  return (
    <Card className="p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
            <Briefcase size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] m-0">
              Deal Cards & Project Allocations
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
              Commission agreements agreed per project inventory
            </p>
          </div>
        </div>

        {broker.status === "DEAL" && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-7 h-7 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-full flex items-center justify-center transition-all active:scale-[0.96] press-effect shadow-xs cursor-pointer"
            title="Add Deal Card"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {broker.status !== "DEAL" && (
        <div className="text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 mb-4 font-medium">
          To attach or configure a project Deal Card, the broker&apos;s status must be set to <strong>DEAL</strong>.
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 mb-4 font-semibold">
          {error}
        </div>
      )}

      {isAdding && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-5 space-y-3.5 animate-enter">
          <h4 className="text-xs font-bold text-[var(--text-primary)] m-0">
            Configure Project Deal
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Project *
              </label>
              <select
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Tower (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Tower A"
                value={formData.towerId}
                onChange={(e) =>
                  setFormData({ ...formData, towerId: e.target.value })
                }
                className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Brokerage Percentage (%)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 2.5"
                value={formData.brokeragePercent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brokeragePercent: e.target.value,
                  })
                }
                className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Flat Brokerage Amount (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={formData.brokerageFlat}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brokerageFlat: e.target.value,
                  })
                }
                className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
              />
            </div>
          </div>

          {isCP && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isLocked"
                checked={formData.isLocked}
                onChange={(e) =>
                  setFormData({ ...formData, isLocked: e.target.checked })
                }
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <label
                htmlFor="isLocked"
                className="text-xs font-bold text-[var(--text-primary)] cursor-pointer"
              >
                Lock this deal card (Restricts editing to Channel Partner Admin)
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all active:scale-[0.96] press-effect cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded-xl transition-all active:scale-[0.96] press-effect shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving…" : "Save Deal Card"}
            </button>
          </div>
        </div>
      )}

      {assignments.length === 0 ? (
        !isAdding && (
          <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-slate-100">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[var(--text-secondary)] m-0">
              No deal cards allocated yet
            </p>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment: any) => (
            <div
              key={assignment.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs hover:border-purple-200 transition-all relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)] m-0">
                    {assignment.project?.name || "Designated Project"}
                  </h4>
                  {assignment.towerId && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                      Tower: {assignment.towerId}
                    </span>
                  )}
                </div>

                {assignment.isLocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Lock size={10} /> Locked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <Unlock size={10} /> Open Deal
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block">
                    Brokerage Percentage
                  </span>
                  <span className="font-extrabold text-[var(--text-primary)] tabular-nums mt-0.5 block">
                    {assignment.brokeragePercent
                      ? `${assignment.brokeragePercent}%`
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block">
                    Flat Commercial Payout
                  </span>
                  <span className="font-extrabold text-[var(--text-primary)] tabular-nums mt-0.5 block">
                    {assignment.brokerageFlat
                      ? `₹${assignment.brokerageFlat.toLocaleString("en-IN")}`
                      : "—"}
                  </span>
                </div>
              </div>

              {(!assignment.isLocked || isCP) &&
                broker.status === "DEAL" && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => {
                        setFormData({
                          projectId: assignment.projectId,
                          towerId: assignment.towerId || "",
                          brokeragePercent:
                            assignment.brokeragePercent?.toString() || "",
                          brokerageFlat:
                            assignment.brokerageFlat?.toString() || "",
                          isLocked: assignment.isLocked,
                        });
                        setIsAdding(true);
                      }}
                      className="text-[11px] font-bold text-[var(--brand-700)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={11} />
                      <span>Edit Deal Parameters</span>
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
