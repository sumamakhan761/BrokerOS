import React from "react";
import { AlertCircle } from "lucide-react";

export function DashboardPageWrapper({
  loading,
  error,
  userName,
  title,
  subtitle,
  children,
  headerRight,
}: {
  loading: boolean;
  error?: string | null;
  userName?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3.5">
        <div className="relative w-9 h-9">
          <div className="absolute inset-0 rounded-full border-2 border-purple-100" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--brand-600)] animate-spin" />
        </div>
        <p className="text-xs font-semibold text-[var(--text-tertiary)] tracking-tight">
          Loading workspace data…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center gap-3.5 max-w-lg mx-auto my-8">
        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-700">
          <AlertCircle size={20} />
        </div>
        <div>
          <div className="text-xs font-extrabold text-rose-900 mb-0.5">
            Unable to Load Workspace Data
          </div>
          <div className="text-xs text-rose-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-enter">
      {/* Header Section */}
      {(userName || title) && (
        <div className="flex flex-wrap items-end justify-between gap-3 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight m-0 text-balance">
              {title ? (
                title
              ) : (
                <>
                  Welcome back, {userName?.split(" ")[0] || "Agent"}{" "}
                  <span className="inline-block hover:animate-bounce">👋</span>
                </>
              )}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm font-medium text-[var(--text-tertiary)] mt-1.5 mb-0 text-pretty">
                {subtitle}
              </p>
            )}
          </div>
          {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
