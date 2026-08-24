"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, FileText, Landmark, Users, Loader2 } from "lucide-react";
import Image from "next/image";

export interface PostSalesEmployee {
  id: string;
  name: string;
  username: string;
  image: string | null;
  employeeCode: string | null;
  isOnCall?: boolean;
  stats: {
    totalBookings: number;
    pendingDocs: number;
    loanCases: number;
  };
}

interface PostSalesEmployeeGridProps {
  employees: PostSalesEmployee[];
  loading: boolean;
}

export function PostSalesEmployeeGrid({
  employees,
  loading,
}: PostSalesEmployeeGridProps) {
  const getInitials = (name?: string | null) => {
    return (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
          <Users size={16} />
        </div>
        <h2 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider m-0">
          Supervised Post-Sales Executives
        </h2>
      </div>

      {loading ? (
        <div className="min-h-[240px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
        </div>
      ) : employees.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center bg-slate-50/60 rounded-3xl border border-slate-200 border-dashed space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-2xs">
            <Users size={18} />
          </div>
          <p className="text-xs font-semibold text-[var(--text-muted)] m-0">
            No employees found under your management.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((emp) => (
            <Link
              href={`/dashboard/post-sales-manager/employees/${emp.id}`}
              key={emp.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between no-underline"
            >
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 text-[var(--brand-700)] font-extrabold text-sm border border-purple-200 shadow-2xs overflow-hidden relative">
                  {emp.image ? (
                    <Image
                      src={emp.image}
                      alt={emp.name || emp.username || "Employee"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    getInitials(emp.name || emp.username || "")
                  )}
                  {/* On-call dot */}
                  <span
                    className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      emp.isOnCall
                        ? "bg-emerald-500 animate-pulse shadow-xs"
                        : "bg-amber-400"
                    }`}
                    title={emp.isOnCall ? "On Call" : "Not in Call"}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--brand-700)] transition-colors m-0">
                    {emp.name || emp.username}
                  </h3>
                  {emp.employeeCode && (
                    <p className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5 m-0 tabular-nums">
                      {emp.employeeCode}
                    </p>
                  )}

                  <div
                    className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                      emp.isOnCall
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {emp.isOnCall ? "In Call" : "Available"}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <Briefcase size={13} />
                    <span>Total Bookings</span>
                  </div>
                  <span className="font-extrabold text-emerald-700 tabular-nums">
                    {emp.stats.totalBookings || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <FileText size={13} />
                    <span>Pending Docs</span>
                  </div>
                  <span className="font-extrabold text-amber-700 tabular-nums">
                    {emp.stats.pendingDocs || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <Landmark size={13} />
                    <span>Loan Cases</span>
                  </div>
                  <span className="font-extrabold text-purple-700 tabular-nums">
                    {emp.stats.loanCases || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
