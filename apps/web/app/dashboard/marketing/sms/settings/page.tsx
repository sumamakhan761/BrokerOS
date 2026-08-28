"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import {
  SmsProviderConfigCard,
  SmsIntegrationRecord,
} from "@/features/marketing/components/SmsProviderConfigCard";

export default function SmsSettingsPage() {
  const [integrations, setIntegrations] = useState<SmsIntegrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${baseUrl}/api/marketing/sms/integrations`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setIntegrations(data);
          return;
        }
      }
      setIntegrations([]);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch SMS provider integrations");
      setIntegrations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleConnect = async (dto: Record<string, unknown>) => {
    const res = await fetch(`${baseUrl}/api/marketing/sms/integrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to save and verify SMS gateway credentials");
    }

    await loadIntegrations();
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to disconnect this SMS gateway?");
    if (!confirmed) return;

    const res = await fetch(`${baseUrl}/api/marketing/sms/integrations/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      await loadIntegrations();
    }
  };

  return (
    <DashboardPageWrapper
      loading={isLoading}
      error={error}
      title="SMS Gateway & DLT Settings"
      subtitle="Manage your default master engine and connect third-party carrier accounts (Twilio, AWS SNS, Sinch, Gupshup)."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/sms">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SMS Hub</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={loadIntegrations}
            className="gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      }
    >
      <SmsProviderConfigCard
        integrations={integrations}
        onConnect={handleConnect}
        onDelete={handleDelete}
      />
    </DashboardPageWrapper>
  );
}
