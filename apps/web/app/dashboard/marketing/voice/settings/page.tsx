"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { VoiceProviderConfigCard } from "@/features/marketing/voice/components/VoiceProviderConfigCard";
import type {
  VoiceTelephonyIntegrationRecord,
  VoiceAgentIntegrationRecord,
} from "@/features/marketing/types";

export default function VoiceSettingsPage() {
  const [telephonyIntegrations, setTelephonyIntegrations] = useState<VoiceTelephonyIntegrationRecord[]>([]);
  const [agentIntegrations, setAgentIntegrations] = useState<VoiceAgentIntegrationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const [telRes, agentRes] = await Promise.all([
        fetch(`${baseUrl}/api/marketing/voice/integrations/telephony`),
        fetch(`${baseUrl}/api/marketing/voice/integrations/agents`),
      ]);

      if (telRes.ok) {
        const telData = await telRes.json();
        setTelephonyIntegrations(telData || []);
      }
      if (agentRes.ok) {
        const agentData = await agentRes.json();
        setAgentIntegrations(agentData || []);
      }
    } catch (err) {
      console.error("Failed to load integrations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [baseUrl]);

  const handleAddTelephony = async (data: any) => {
    const res = await fetch(`${baseUrl}/api/marketing/voice/integrations/telephony`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to save and verify carrier credentials");
    }
    await loadIntegrations();
  };

  const handleDeleteTelephony = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this carrier line?")) return;
    const res = await fetch(`${baseUrl}/api/marketing/voice/integrations/telephony/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadIntegrations();
    }
  };

  const handleAddAgent = async (data: any) => {
    const res = await fetch(`${baseUrl}/api/marketing/voice/integrations/agents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to save and verify AI engine credentials");
    }
    await loadIntegrations();
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this AI voice platform?")) return;
    const res = await fetch(`${baseUrl}/api/marketing/voice/integrations/agents/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadIntegrations();
    }
  };

  return (
    <DashboardPageWrapper
      loading={loading}
      title="Telephony & AI Voice Gateways"
      subtitle="Manage your master PSTN carriers (Twilio, Vobiz, Exotel, Telnyx) and connect AI Voice Agent platforms."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/voice">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Voice Hub</span>
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
      <div className="space-y-6 max-w-5xl">
        <VoiceProviderConfigCard
          telephonyIntegrations={telephonyIntegrations}
          agentIntegrations={agentIntegrations}
          onAddTelephony={handleAddTelephony}
          onDeleteTelephony={handleDeleteTelephony}
          onAddAgent={handleAddAgent}
          onDeleteAgent={handleDeleteAgent}
          loading={loading}
        />
      </div>
    </DashboardPageWrapper>
  );
}
