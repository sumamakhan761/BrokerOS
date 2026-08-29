"use client";

import React from "react";
import { Building2 } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
        <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <Building2 className="w-4 h-4 text-[var(--brand-600)]" />
          <span>BrokerOS · Enterprise Real Estate Operating System</span>
        </div>
        <div className="flex items-center gap-6">
          <span>NestJS 11 · Next.js 16 · Prisma 7 · Better Auth</span>
          <span>© {new Date().getFullYear()} All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
}
