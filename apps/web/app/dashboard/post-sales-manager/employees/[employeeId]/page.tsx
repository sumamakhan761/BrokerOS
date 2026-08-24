"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { StatCards } from "@/components/dashboard/StatCards";
import { FollowUpList } from "@/components/dashboard/FollowUpList";
import { PendingListWidget } from "../../../post-sales/components/PendingListWidget";
import {
  Handshake,
  FileText,
  Building,
  Key,
  CheckCircle,
  ArrowLeft,
  UserCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { PostSalesEmployeeLeadsView } from "../_components/PostSalesEmployeeLeadsView";
import { PostSalesEmployeeAnalyticsView } from "../_components/PostSalesEmployeeAnalyticsView";

type Tab = "dashboard" | "leads" | "analytics";

export default function PostSalesManagerViewAsEmployee() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.employeeId as string;

  const { data: session, isPending } = authClient.useSession();
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
      return;
    }
    if (session && employeeId) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      loadDashboard(baseUrl, employeeId);
    }
  }, [session, isPending, router, employeeId]);

  const loadDashboard = async (baseUrl: string, empId: string) => {
    try {
      setLoading(true);
      const res = await authClient.$fetch<any>(
        `/api/dashboard/post-sales-manager/employees/${empId}/dashboard`,
        { baseURL: baseUrl }
      );
      if (res.data) setDashData(res.data);
      if (res.error)
        throw new Error(res.error.message || "Failed to load dashboard");
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const confirmFollowUp = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch<any>(
        `/api/dashboard/pre-sales/follow-ups/${id}/confirm`,
        {
          method: "POST",
          baseURL: baseUrl,
        }
      );
      if (res.data?.success) window.location.reload();
      else toast.error(res.data?.message || "Failed");
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xs font-semibold text-[var(--text-muted)] animate-pulse">
          Loading employee dashboard…
        </div>
      </div>
    );
  }

  const w = dashData?.widgets;
  const statItems = w
    ? [
        {
          label: "Total Booked",
          value: w.totalBooked,
          icon: Handshake,
          accent: "#7c3aed",
        },
        {
          label: "Documents Pending",
          value: w.documentsPending,
          icon: FileText,
          accent: "#f59e0b",
        },
        {
          label: "Loan Cases",
          value: w.loanCases,
          icon: Building,
          accent: "#3b82f6",
        },
        {
          label: "Agreement Pending",
          value: w.agreementPending,
          icon: FileText,
          accent: "#8b5cf6",
        },
        {
          label: "Possession Pending",
          value: w.possessionPending,
          icon: Key,
          accent: "#ec4899",
        },
        {
          label: "Handover Completed",
          value: w.handoverCompleted,
          icon: CheckCircle,
          accent: "#10b981",
        },
      ]
    : [];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-enter">
      {/* View As Banner */}
      <div className="bg-[var(--brand-600)] text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="text-base">👀</span>
          <p className="font-bold text-xs m-0">
            Manager View Mode: Supervised Post-Sales Executive Workspace
          </p>
        </div>
        <button
          onClick={() =>
            router.push("/dashboard/post-sales-manager/employees")
          }
          className="flex items-center gap-1.5 text-white hover:bg-white/10 transition-colors text-xs font-bold bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 cursor-pointer"
        >
          <ArrowLeft size={13} /> <span>Back to Team</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 text-xs font-bold">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 gap-2">
        {(
          [
            { key: "dashboard", label: "Dashboard Overview" },
            { key: "leads", label: "Assigned Leads" },
            { key: "analytics", label: "Executive Analytics" },
          ] as { key: Tab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            className={`py-2.5 px-4 text-xs font-bold bg-transparent border-b-2 cursor-pointer transition-all ${
              activeTab === tab.key
                ? "text-[var(--brand-700)] border-[var(--brand-600)]"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "leads" && (
        <PostSalesEmployeeLeadsView employeeId={employeeId} />
      )}

      {activeTab === "analytics" && (
        <PostSalesEmployeeAnalyticsView employeeId={employeeId} />
      )}

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {dashData ? (
            <>
              <StatCards items={statItems} />

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <PendingListWidget
                  title="Documents Pending"
                  list={dashData.documentsList ?? []}
                  statusFilter="DOCUMENT"
                  emptyMessage="No documents pending."
                />
                <PendingListWidget
                  title="Loan Cases"
                  list={dashData.loanList ?? []}
                  statusFilter="LOAN"
                  emptyMessage="No loan cases in progress."
                />
                <PendingListWidget
                  title="Agreements Pending"
                  list={dashData.agreementList ?? []}
                  statusFilter="AGREEMENT"
                  emptyMessage="No agreements pending."
                />
                <PendingListWidget
                  title="Possession Pending"
                  list={dashData.possessionList ?? []}
                  statusFilter="HANDOVER"
                  emptyMessage="No possessions pending."
                />
              </div>

              <div className="mt-6">
                <FollowUpList
                  items={dashData.todayFollowUpList ?? []}
                  onConfirm={confirmFollowUp}
                  viewAllHref={`/dashboard/post-sales-manager/employees/${employeeId}/lead-management`}
                  title="Today's Executive Follow-ups"
                />
              </div>
            </>
          ) : (
            <div className="text-center text-[var(--text-muted)] py-16 text-xs font-semibold">
              No dashboard data available for this employee.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
