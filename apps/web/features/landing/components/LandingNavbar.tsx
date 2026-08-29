"use client";

import React from "react";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 px-4 sm:px-8 pt-4">
      <div className="max-w-6xl mx-auto glass rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 text-decoration-none group">
          <div className="w-9 h-9 rounded-xl bg-[var(--brand-600)] flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform duration-200">
            <Building2 className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)]">
              Broker<span className="text-[var(--brand-600)]">OS</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-[var(--brand-700)] border border-purple-200">
              Enterprise CRM
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[var(--text-secondary)]">
          <a href="#sandbox" className="hover:text-[var(--brand-600)] transition-colors">
            Role Sandbox
          </a>
          <a href="#pillars" className="hover:text-[var(--brand-600)] transition-colors">
            Architecture
          </a>
          <a href="#security" className="hover:text-[var(--brand-600)] transition-colors">
            Security & RBAC
          </a>
        </nav>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-sm hover:shadow-md transition-all active:scale-[0.96] press-effect"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
