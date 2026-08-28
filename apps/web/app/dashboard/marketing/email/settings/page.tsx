"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, Mail } from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { ProviderConfigCard, IntegrationRecord } from "@/features/marketing/components/ProviderConfigCard";

export default function MarketingSettingsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${baseUrl}/api/marketing/integrations`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setIntegrations(data);
          return;
        }
      }
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
    } catch (err: any) {
      setError(err?.message || "Failed to load provider integrations");
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
    <DashboardPageWrapper
      loading={isLoading}
      error={error}
      title="Email Provider Integrations"
      subtitle="Manage your default master engine and connect third-party enterprise providers (AWS SES, SendGrid, Brevo, Mailchimp)."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/email">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Email Engine</span>
            </Button>
          </Link>
        </div>
      }
    >
      <ProviderConfigCard
        integrations={integrations}
        onConnect={handleConnect}
        onDelete={handleDelete}
      />
    </DashboardPageWrapper>
  );
}
