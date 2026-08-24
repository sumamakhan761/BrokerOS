"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Users, Briefcase, CalendarCheck, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type EmployeeStats = {
  totalBrokers?: number;
  siteVisits?: number;
  followUpsDone?: number;
  totalLeads?: number;
  bookingsGenerated?: number;
  unitsSold?: number;
};

type EmployeeCardData = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  employeeCode: string;
  stats: EmployeeStats;
};

export default function ChannelPartnerEmployees() {
  const [activeTab, setActiveTab] = useState<"sourcing" | "closing">("sourcing");
  const [sourcingManagers, setSourcingManagers] = useState<EmployeeCardData[]>(
    []
  );
  const [closingManagers, setClosingManagers] = useState<EmployeeCardData[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const [sourcingRes, closingRes] = await Promise.all([
        authClient.$fetch<EmployeeCardData[]>(
          "/api/dashboard/channel-partner/employees/sourcing-managers",
          { baseURL: baseUrl }
        ),
        authClient.$fetch<EmployeeCardData[]>(
          "/api/dashboard/channel-partner/employees/closing-managers",
          { baseURL: baseUrl }
        ),
      ]);

      if (sourcingRes.data) setSourcingManagers(sourcingRes.data);
      if (closingRes.data) setClosingManagers(closingRes.data);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-enter">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
            <Users size={18} />
          </div>
          <span>Channel Partner Field Teams & Managers</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
          Supervise and review individual workloads of Sourcing Managers and Closing Managers
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60 w-fit">
        <button
          onClick={() => setActiveTab("sourcing")}
          className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === "sourcing"
              ? "bg-white text-[var(--text-primary)] shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Sourcing Managers ({sourcingManagers.length})
        </button>
        <button
          onClick={() => setActiveTab("closing")}
          className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === "closing"
              ? "bg-white text-[var(--text-primary)] shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Closing Managers ({closingManagers.length})
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Loading team roster…
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(activeTab === "sourcing" ? sourcingManagers : closingManagers).map(
            (emp) => (
              <Link
                href={`/dashboard/channel-partner/employees/${emp.id}?role=${activeTab}`}
                key={emp.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between no-underline"
              >
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 text-[var(--brand-700)] font-extrabold text-sm border border-purple-200/60 shadow-2xs overflow-hidden relative">
                    {emp.image ? (
                      <Image
                        src={emp.image}
                        alt={emp.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      getInitials(emp.name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--brand-700)] transition-colors m-0">
                      {emp.name}
                    </h3>
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] mt-0.5 m-0 tabular-nums">
                      {emp.employeeCode}
                    </p>
                    <span className="text-[9px] font-extrabold text-[var(--brand-700)] mt-1.5 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60 inline-block">
                      {activeTab === "sourcing"
                        ? "Sourcing Manager"
                        : "Closing Manager"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  {activeTab === "sourcing" ? (
                    <>
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                          <Users size={13} />
                          <span>Total Brokers</span>
                        </div>
                        <span className="font-extrabold text-slate-900 tabular-nums">
                          {emp.stats.totalBrokers || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                          <CalendarCheck size={13} className="text-emerald-500" />
                          <span>Meetings</span>
                        </div>
                        <span className="font-extrabold text-emerald-700 tabular-nums">
                          {emp.stats.siteVisits || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                          <Briefcase size={13} className="text-amber-500" />
                          <span>Follow-ups</span>
                        </div>
                        <span className="font-extrabold text-amber-700 tabular-nums">
                          {emp.stats.followUpsDone || 0}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                          <Users size={13} />
                          <span>Total Leads</span>
                        </div>
                        <span className="font-extrabold text-slate-900 tabular-nums">
                          {emp.stats.totalLeads || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                          <Briefcase size={13} className="text-purple-500" />
                          <span>Bookings</span>
                        </div>
                        <span className="font-extrabold text-purple-700 tabular-nums">
                          {emp.stats.bookingsGenerated || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                          <Home size={13} className="text-emerald-500" />
                          <span>Units Sold</span>
                        </div>
                        <span className="font-extrabold text-emerald-700 tabular-nums">
                          {emp.stats.unitsSold || 0}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Link>
            )
          )}

          {(activeTab === "sourcing" ? sourcingManagers : closingManagers)
            .length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-50/60 rounded-3xl border border-slate-200 border-dashed space-y-2">
              <Users size={24} className="text-slate-300" />
              <p className="text-xs font-semibold text-[var(--text-muted)] m-0">
                No {activeTab} managers found.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
