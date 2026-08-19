"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmployeeDashboardData } from "../../_components/types";
import { Modal } from "../../_components/Modal";
import { EmployeeLeadsView } from "../../_components/EmployeeLeadsView";
import { EmployeeWidgets } from "../../_components/EmployeeWidgets";
import { PipelineBar } from "@/components/dashboard/PipelineBar";
import { toast } from 'sonner';

const PIPELINE_STAGES = [
  { key: "new",         label: "New",          color: "#8b5cf6" },
  { key: "contacted",   label: "Contacted",    color: "#6366f1" },
  { key: "siteVisit",   label: "Site Visit",   color: "#3b82f6" },
  { key: "negotiation", label: "Negotiation",  color: "#0ea5e9" },
  { key: "booked",      label: "Booked",       color: "#10b981" },
];
import { EmployeeDailyTasks } from "../../_components/EmployeeDailyTasks";
import { EmployeeBacklogs } from "../../_components/EmployeeBacklogs";
import { EmployeeAnalyticsView } from "../../_components/EmployeeAnalyticsView";
import { ArrowLeft } from "lucide-react";

const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400";
const labelClasses = "block text-[13px] font-bold text-slate-700 mb-2";
const btnPrimary = "w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none rounded-xl py-3 px-6 text-[14px] font-bold cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed";

export default function EmployeeDashboardView() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.employeeId as string;

  const [dashData, setDashData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("dashboard");

  // Edit Task State
  const [showEditTask, setShowEditTask] = useState(false);
  const [editTarget, setEditTarget] = useState("");
  const [editBacklog, setEditBacklog] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch<EmployeeDashboardData>(`/api/dashboard/pre-sales-manager/employees/${employeeId}/dashboard`, { baseURL: baseUrl });

      if (res.data) setDashData(res.data);
      if (res.error) throw new Error(res.error.message || "Failed to load dashboard");
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [employeeId]);

  const handleSaveTask = async () => {
    const taskId = dashData?.dailyTasks.coldCall.taskId;
    if (!taskId) { toast.error("Employee has no active task assigned."); return; }
    setIsSaving(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      await authClient.$fetch(`/api/dashboard/pre-sales-manager/employees/tasks/${taskId}`, {
        method: "PATCH",
        baseURL: baseUrl,
        body: {
          coldCallTarget: editTarget ? Number(editTarget) : undefined,
          userId: dashData?.dailyTasks.coldCall.taskUserId ? employeeId : undefined,
          backlogOverride: editBacklog ? Number(editBacklog) : undefined,
        },
      });
      setShowEditTask(false);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update task.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasBacklog =
    (dashData?.dailyTasks.coldCall.backlog ?? 0) > 0 ||
    (dashData?.dailyTasks.followUp.backlog ?? 0) > 0;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-slate-500 font-medium animate-pulse">Loading employee dashboard…</div>
    </div>
  );

  if (error) return (
    <div className="p-8 bg-red-50/50 rounded-2xl border border-red-200 text-red-600">
      <strong>Error:</strong> {error}
      <button onClick={() => router.back()} className="block mt-4 text-red-600 hover:text-red-700 underline underline-offset-4 bg-transparent border-none cursor-pointer font-medium p-0">Go Back</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-12 animate-[fadeUp_0.4s_ease_forwards] max-w-7xl mx-auto w-full">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── Top Nav / Header ── */}
      <div className="flex items-start gap-4 flex-wrap">
        <button
          onClick={() => router.push("/dashboard/pre-sales-manager/employees")}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-none rounded-xl py-2 px-4 font-bold text-[13px] cursor-pointer transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employees
        </button>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight m-0">
            Employee Dashboard
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm font-medium">
            You have full access to view and manage this employee's leads and performance.
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          className={`py-3 px-5 text-[14px] font-bold bg-transparent border-none border-b-2 cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`py-3 px-5 text-[14px] font-bold bg-transparent border-none border-b-2 cursor-pointer transition-colors ${activeTab === 'leads' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
          onClick={() => setActiveTab('leads')}
        >
          Lead Management
        </button>
        <button
          className={`py-3 px-5 text-[14px] font-bold bg-transparent border-none border-b-2 cursor-pointer transition-colors ${activeTab === 'analytics' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'leads' && (
        <EmployeeLeadsView employeeId={employeeId} />
      )}

      {activeTab === 'analytics' && (
        <EmployeeAnalyticsView employeeId={employeeId} />
      )}

      {/* ── Dashboard Content ── */}
      {activeTab === 'dashboard' && dashData && (
        <>
          {/* Section 1: Widgets */}
          <EmployeeWidgets widgets={dashData.widgets} />

          {/* Section 2: Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Pipeline */}
            <PipelineBar stages={PIPELINE_STAGES} data={dashData.pipeline ?? {}} />

            {/* Daily Tasks */}
            <EmployeeDailyTasks
              tasks={dashData.dailyTasks}
              hasBacklog={hasBacklog}
              onEditTask={() => {
                setEditTarget(String(dashData.dailyTasks.coldCall.target));
                setEditBacklog(String(dashData.dailyTasks.coldCall.backlog));
                setShowEditTask(true);
              }}
            />

            {/* Backlogs */}
            <EmployeeBacklogs backlogs={dashData.backlogs} hasBacklog={hasBacklog} />

          </div>
        </>
      )}

      {/* ── Edit Task Modal ── */}
      {showEditTask && (
        <Modal title="Edit Employee Task" onClose={() => setShowEditTask(false)}>
          <div className="flex flex-col gap-5">
            <div>
              <label className={labelClasses}>Cold Call Daily Target</label>
              <input
                type="number" min={1} value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Backlog Override (Optional)</label>
              <p className="text-[12px] text-slate-400 mb-2 font-medium">Use this to clear/reduce an employee's backlog.</p>
              <input
                type="number" min={0} value={editBacklog}
                onChange={(e) => setEditBacklog(e.target.value)}
                className={inputClasses}
                placeholder="e.g. 0 to clear"
              />
            </div>
            <button
              onClick={handleSaveTask}
              disabled={isSaving}
              className={`${btnPrimary} mt-2`}
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
