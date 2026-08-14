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
  const [sourcingManagers, setSourcingManagers] = useState<EmployeeCardData[]>([]);
  const [closingManagers, setClosingManagers] = useState<EmployeeCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const [sourcingRes, closingRes] = await Promise.all([
        authClient.$fetch<EmployeeCardData[]>("/api/dashboard/channel-partner/employees/sourcing-managers", { baseURL: baseUrl }),
        authClient.$fetch<EmployeeCardData[]>("/api/dashboard/channel-partner/employees/closing-managers", { baseURL: baseUrl }),
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Employees</h1>
        <p className="text-slate-500 text-sm font-medium">Manage and track performance of your Sourcing and Closing managers.</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100/80 rounded-2xl w-fit border border-slate-200/60 shadow-inner">
        <button
          onClick={() => setActiveTab("sourcing")}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === "sourcing"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          Sourcing Managers
        </button>
        <button
          onClick={() => setActiveTab("closing")}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === "closing"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          Closing Managers
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(activeTab === "sourcing" ? sourcingManagers : closingManagers).map((emp) => (
            <Link
              href={`/dashboard/channel-partner/employees/${emp.id}?role=${activeTab}`}
              key={emp.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-lg border border-indigo-200 shadow-inner overflow-hidden relative">
                  {emp.image ? (
                    <Image src={emp.image} alt={emp.name} fill className="object-cover" />
                  ) : (
                    getInitials(emp.name)
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {emp.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{emp.employeeCode}</p>
                  <p className="text-[11px] font-bold text-indigo-500 mt-1 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                    {activeTab === "sourcing" ? "Sourcing" : "Closing"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                {activeTab === "sourcing" ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">Total Brokers</span>
                      </div>
                      <span className="font-bold text-slate-900">{emp.stats.totalBrokers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CalendarCheck className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium">Meetings</span>
                      </div>
                      <span className="font-bold text-emerald-700">{emp.stats.siteVisits || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Briefcase className="w-4 h-4 text-orange-400" />
                        <span className="font-medium">Follow-ups</span>
                      </div>
                      <span className="font-bold text-orange-600">{emp.stats.followUpsDone || 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">Total Leads</span>
                      </div>
                      <span className="font-bold text-slate-900">{emp.stats.totalLeads || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Briefcase className="w-4 h-4 text-indigo-400" />
                        <span className="font-medium">Bookings</span>
                      </div>
                      <span className="font-bold text-indigo-600">{emp.stats.bookingsGenerated || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Home className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium">Units Sold</span>
                      </div>
                      <span className="font-bold text-emerald-700">{emp.stats.unitsSold || 0}</span>
                    </div>
                  </>
                )}
              </div>
            </Link>
          ))}

          {((activeTab === "sourcing" ? sourcingManagers : closingManagers).length === 0) && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
              <Users className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No {activeTab} managers found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
