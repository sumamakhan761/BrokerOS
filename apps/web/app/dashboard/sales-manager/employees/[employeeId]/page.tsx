"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import { DashboardData, LeaderboardEntry } from "../../../sales-executive/types";
import { StatCards } from "@/components/dashboard/StatCards";
import { SalesExecTasks } from "../../../sales-executive/components/SalesExecTasks";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, CheckCircle, MessageSquare, Trophy } from "lucide-react";
import { SalesExecEmployeeLeadsView } from "../../_components/SalesExecEmployeeLeadsView";
import { SalesExecEmployeeAnalyticsView } from "../../_components/SalesExecEmployeeAnalyticsView";

export default function SalesManagerViewAsEmployee() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.employeeId as string;

  const { data: session, isPending } = authClient.useSession();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  // We can leave leaderboard empty or mock it for view as mode.
  const [leaderboard, setLeaderboard] = useState<{ leaderboard: LeaderboardEntry[]; currentUserId: string } | null>(null);
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
      const [dashRes] = await Promise.all([
        authClient.$fetch<DashboardData>(`/api/dashboard/sales-manager/employees/${empId}/dashboard`, { baseURL: baseUrl }),
        // For simplicity in View As mode, we won't show the full team leaderboard, or we can just fetch it if needed.
        // authClient.$fetch<{ leaderboard: LeaderboardEntry[]; currentUserId: string }>("/api/dashboard/sales-executive/leaderboard", { baseURL: baseUrl }),
      ]);
      if (dashRes.data) setDashData(dashRes.data);
      if (dashRes.error) throw new Error(dashRes.error.message || "Failed to load dashboard");
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading employee dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 bg-slate-50 min-h-screen">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .widget-card { transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 14px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; background: #fff; }
        .widget-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(99,102,241,0.12); }
        .info-card { background: #ffffff; border-radius: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow: hidden; }
        .section-title { font-size: 13px; font-weight: 700; color: #303d51ff; text-transform: uppercase; letter-spacing: 1px; }
        .followup-row { transition: background 0.2s; }
        .followup-row:hover { background: #f8fafc !important; }
        .lb-row { transition: background 0.2s; }
        .lb-row:hover { background: #f8fafc !important; }
      `}</style>

      {/* View As Banner */}
      <div className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center justify-between shadow-lg sticky top-4 z-50 animate-[fadeUp_0.3s_ease]">
        <div className="flex items-center gap-3">
          <span className="text-xl">👀</span>
          <p className="font-medium text-sm">
            Viewing <span className="font-bold">Sales Executive</span>'s Dashboard
          </p>
        </div>
        <Link href="/dashboard/sales-manager/employees" className="flex items-center gap-2 text-indigo-100 hover:text-white transition-colors text-sm font-semibold bg-indigo-700/50 px-3 py-1.5 rounded-lg">
          <ArrowLeft className="w-4 h-4" /> Back to Team
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 mb-6">
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
        <SalesExecEmployeeLeadsView employeeId={employeeId} />
      )}

      {activeTab === 'analytics' && (
        <SalesExecEmployeeAnalyticsView employeeId={employeeId} />
      )}

      {activeTab === 'dashboard' && dashData && (
        <>
          <StatCards items={[
            { label: "SV Scheduled",    value: dashData.widgets.siteVisitsScheduled, icon: Calendar,      accent: "#0369a1" },
            { label: "Today's SVs Done",value: dashData.widgets.todaySiteVisitsDone, icon: MapPin,        accent: "#6d28d9" },
            { label: "SV Completed",    value: dashData.widgets.siteVisitsCompleted, icon: CheckCircle,   accent: "#7c3aed" },
            { label: "Negotiations",    value: dashData.widgets.negotiations,        icon: MessageSquare, accent: "#f59e0b" },
            { label: "Bookings",        value: dashData.widgets.bookingsGenerated,   icon: Trophy,        accent: "#10b981" },
          ]} />

          {/* Section 2: Tasks & Leaderboard */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24 }}>
            <SalesExecTasks dashData={dashData} />
            {/* We hide the leaderboard for View As mode or provide empty array */}
            <div className="info-card p-6 flex items-center justify-center text-gray-400 text-sm">
              Leaderboard not available in View-As mode.
            </div>
          </div>

          {/* Bottom Section: Live Location */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Live Location</h2>
                  <p className="text-sm text-gray-500">Employee's current location tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-emerald-600 font-medium">Live</span>
              </div>
            </div>
            <div className="p-5">
              {employeeId ? (
                <LiveTrackingMap userId={employeeId} />
              ) : (
                <div className="h-[400px] bg-gray-50 rounded-xl flex items-center justify-center">
                  <p className="text-gray-400">Loading map...</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
