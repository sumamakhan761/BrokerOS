"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, ShieldCheck, Mail } from "lucide-react";
import { ProviderConfigCard, IntegrationRecord } from "@/features/marketing/components/ProviderConfigCard";

export default function MarketingSettingsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIntegrations = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/integrations`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setIntegrations(data);
      }
    } catch {
      // Mock fallback
      setIntegrations([
        {
          id: "int-1",
          provider: "SENDGRID",
          name: "Twilio SendGrid Dedicated IP",
          isActive: true,
          isDefault: false,
          fromEmail: "updates@skylinerealty.com",
          fromName: "Skyline Realty",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnect = async (payload: any) => {
    const res = await fetch(`${baseUrl}/api/marketing/integrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.message || "Failed to verify credentials");
    }
    await fetchIntegrations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this provider?")) return;
    await fetch(`${baseUrl}/api/marketing/integrations/${id}`, { method: "DELETE" });
    await fetchIntegrations();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/marketing/email"
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Settings className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Email Provider Integrations</h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Manage your default master engine and connect third-party enterprise providers.
            </p>
          </div>
        </div>
      </div>

      {/* ── PROVIDER CONFIG COMPONENT ── */}
      <ProviderConfigCard
        integrations={integrations}
        onConnect={handleConnect}
        onDelete={handleDelete}
      />
    </div>
  );
}
