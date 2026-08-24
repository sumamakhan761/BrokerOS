"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import { DashboardData } from "../../../sales-executive/types";
import { StatCards } from "@/components/dashboard/StatCards";
import { SalesExecTasks } from "../../../sales-executive/components/SalesExecTasks";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle,
  MessageSquare,
  Trophy,
  UserCircle2,
} from "lucide-react";
import { SalesExecEmployeeLeadsView } from "../../_components/SalesExecEmployeeLeadsView";
import { SalesExecEmployeeAnalyticsView } from "../../_components/SalesExecEmployeeAnalyticsView";

export default function SalesManagerViewAsEmployee() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.employeeId as string;

  const { data: session, isPending } = authClient.useSession();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

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
      const dashRes = await authClient.$fetch<DashboardData>(
        `/api/dashboard/sales-manager/employees/${empId}/dashboard`,
        { baseURL: baseUrl }
      );
      if (dashRes.data) setDashData(dashRes.data);
      if (dashRes.error)
        throw new Error(dashRes.error.message || "Failed to load dashboard");
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xs font-semibold text-[var(--text-muted)] animate-pulse">
          Loading sales executive dashboard…
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-enter">
      {/* View As Banner */}
      <div className="bg-[var(--brand-600)] text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="text-base">👀</span>
          <p className="font-bold text-xs m-0">
            Manager View Mode: Supervised Sales Executive Workspace
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/sales-manager/employees")}
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
        <button
          className={`py-2.5 px-4 text-xs font-bold bg-transparent border-b-2 cursor-pointer transition-all ${
            activeTab === "dashboard"
              ? "text-[var(--brand-700)] border-[var(--brand-600)]"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          Overview & Tasks
        </button>
        <button
          className={`py-2.5 px-4 text-xs font-bold bg-transparent border-b-2 cursor-pointer transition-all ${
            activeTab === "leads"
              ? "text-[var(--brand-700)] border-[var(--brand-600)]"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("leads")}
        >
          Assigned Leads
        </button>
        <button
          className={`py-2.5 px-4 text-xs font-bold bg-transparent border-b-2 cursor-pointer transition-all ${
            activeTab === "analytics"
              ? "text-[var(--brand-700)] border-[var(--brand-600)]"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Detailed Analytics
        </button>
      </div>

      {activeTab === "leads" && (
        <SalesExecEmployeeLeadsView employeeId={employeeId} />
      )}

      {activeTab === "analytics" && (
        <SalesExecEmployeeAnalyticsView employeeId={employeeId} />
      )}

      {activeTab === "dashboard" && dashData && (
        <div className="space-y-6">
          <StatCards
            items={[
              {
                label: "SV Scheduled",
                value: dashData.widgets.siteVisitsScheduled,
                icon: Calendar,
                accent: "#0369a1",
              },
              {
                label: "Today's SVs Done",
                value: dashData.widgets.todaySiteVisitsDone,
                icon: MapPin,
                accent: "#6d28d9",
              },
              {
                label: "SV Completed",
                value: dashData.widgets.siteVisitsCompleted,
                icon: CheckCircle,
                accent: "#7c3aed",
              },
              {
                label: "Negotiations",
                value: dashData.widgets.negotiations,
                icon: MessageSquare,
                accent: "#f59e0b",
              },
              {
                label: "Bookings",
                value: dashData.widgets.bookingsGenerated,
                icon: Trophy,
                accent: "#10b981",
              },
            ]}
          />

          {/* Tasks + Live Location Bento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <SalesExecTasks dashData={dashData} />

            {/* Live Location Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-[var(--text-primary)] m-0">
                      Live GPS Position
                    </h2>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
                      Real-time executive tracking
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
              <div className="p-3">
                <LiveTrackingMap userId={employeeId} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
