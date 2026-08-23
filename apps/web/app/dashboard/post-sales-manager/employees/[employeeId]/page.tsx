"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { StatCards } from "@/components/dashboard/StatCards";
import { FollowUpList } from "@/components/dashboard/FollowUpList";
import { PendingListWidget } from "../../../post-sales/components/PendingListWidget";
import { Handshake, FileText, Building, Key, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from 'sonner';
import { PostSalesEmployeeLeadsView } from "../_components/PostSalesEmployeeLeadsView";
import { PostSalesEmployeeAnalyticsView } from "../_components/PostSalesEmployeeAnalyticsView";

type Tab = 'dashboard' | 'leads' | 'analytics';

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
      const res = await authClient.$fetch<any>(`/api/dashboard/post-sales-manager/employees/${empId}/dashboard`, { baseURL: baseUrl });
      if (res.data) setDashData(res.data);
      if (res.error) throw new Error(res.error.message || "Failed to load dashboard");
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const confirmFollowUp = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch<any>(`/api/dashboard/pre-sales/follow-ups/${id}/confirm`, {
        method: "POST", baseURL: baseUrl,
      });
      if (res.data?.success) window.location.reload();
      else toast.error(res.data?.message || "Failed");
    } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading employee dashboard...</p>
        </div>
      </div>
    );
  }

  const w = dashData?.widgets;
  const statItems = w ? [
    { label: "Total Booked",        value: w.totalBooked,         icon: Handshake,  accent: "#7c3aed" },
    { label: "Documents Pending",   value: w.documentsPending,    icon: FileText,   accent: "#f59e0b" },
    { label: "Loan Cases",          value: w.loanCases,           icon: Building,   accent: "#3b82f6" },
    { label: "Agreement Pending",   value: w.agreementPending,    icon: FileText,   accent: "#8b5cf6" },
    { label: "Possession Pending",  value: w.possessionPending,   icon: Key,        accent: "#ec4899" },
    { label: "Handover Completed",  value: w.handoverCompleted,   icon: CheckCircle,accent: "#10b981" },
  ] : [];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 bg-slate-50 min-h-screen">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* View As Banner */}
      <div className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center justify-between shadow-lg sticky top-4 z-50 animate-[fadeUp_0.3s_ease]">
        <div className="flex items-center gap-3">
          <span className="text-xl">👀</span>
          <p className="font-medium text-sm">
            Viewing <span className="font-bold">Post-Sales Executive</span>'s Dashboard
          </p>
        </div>
        <Link href="/dashboard/post-sales-manager/employees" className="flex items-center gap-2 text-indigo-100 hover:text-white transition-colors text-sm font-semibold bg-indigo-700/50 px-3 py-1.5 rounded-lg">
          <ArrowLeft className="w-4 h-4" /> Back to Team
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {([
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'leads', label: 'Lead Management' },
          { key: 'analytics', label: 'Analytics' },
        ] as { key: Tab; label: string }[]).map(tab => (
          <button
            key={tab.key}
            className={`py-3 px-5 text-[14px] font-bold bg-transparent border-none border-b-2 cursor-pointer transition-colors ${activeTab === tab.key ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'leads' && (
        <PostSalesEmployeeLeadsView employeeId={employeeId} />
      )}

      {activeTab === 'analytics' && (
        <PostSalesEmployeeAnalyticsView employeeId={employeeId} />
      )}

      {activeTab === 'dashboard' && (
        <div className="animate-[fadeUp_0.4s_ease_forwards]">
          {dashData ? (
            <>
              <StatCards items={statItems} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 32 }}>
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

              <div className="mt-8">
                <FollowUpList
                  items={dashData.todayFollowUpList ?? []}
                  onConfirm={confirmFollowUp}
                  viewAllHref={`/dashboard/post-sales-manager/employees/${employeeId}/lead-management`}
                  title="Today's Follow-ups"
                />
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400 py-16">No dashboard data available.</div>
          )}
        </div>
      )}
    </div>
  );
}
