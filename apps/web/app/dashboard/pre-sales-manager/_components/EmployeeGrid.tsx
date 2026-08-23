import React from "react";
import Link from "next/link";
import { Employee } from "./types";
import { Users, PhoneCall, CalendarCheck, Briefcase, Loader2 } from "lucide-react";
import Image from "next/image";

interface EmployeeGridProps {
  employees: Employee[];
  loading: boolean;
}

export function EmployeeGrid({ employees, loading }: EmployeeGridProps) {
  const getInitials = (name?: string | null) => {
    return (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        @keyframes pulse-green { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .on-call-dot { animation: pulse-green 1.5s ease-in-out infinite; }
      `}</style>

      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-indigo-500" />
        <h2 className="text-xl font-bold text-slate-800">Team Members</h2>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : employees.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
          <Users className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No employees found under your management.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map((emp, i) => (
            <Link
              href={`/dashboard/pre-sales-manager/employees/${emp.id}`}
              key={emp.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-lg border border-indigo-200 shadow-inner overflow-hidden relative">
                  {emp.image ? (
                    <Image src={emp.image} alt={emp.name || emp.username || "Employee"} fill className="object-cover" />
                  ) : (
                    getInitials(emp.name || emp.username || "")
                  )}
                  {/* On-call dot */}
                  <span
                    className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${emp.isOnCall ? 'bg-green-500 on-call-dot' : 'bg-amber-400'}`}
                    title={emp.isOnCall ? 'On Call' : 'Not in Call'}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {emp.name || emp.username}
                  </h3>
                  {emp.employeeCode && <p className="text-xs font-medium text-slate-500 mt-0.5">{emp.employeeCode}</p>}

                  {/* On-call status pill */}
                  <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${emp.isOnCall ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {emp.isOnCall ? 'On Call' : 'Not in Call'}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Total Leads</span>
                  </div>
                  <span className="font-bold text-slate-900">{emp.stats.totalLeads || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <PhoneCall className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium">Contacted</span>
                  </div>
                  <span className="font-bold text-indigo-700">{emp.stats.contactedLeads || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="w-4 h-4 text-orange-400" />
                    <span className="font-medium">Follow-ups</span>
                  </div>
                  <span className="font-bold text-orange-600">{emp.stats.followUpsDone || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">Visits Scheduled</span>
                  </div>
                  <span className="font-bold text-emerald-700">{emp.stats.siteVisits || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
