"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card } from "@/components/ui/Card";
import { LeadTableFilters } from "@/features/leads/components/tables/LeadTableFilters";
import { LeadTableGrid } from "@/features/leads/components/tables/LeadTableGrid";

function LeadTableContent({ isManagerView }: { isManagerView?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const initialFollowUpDate = searchParams.get("followUpDate") || "";

  // Filters
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [scoreRange, setScoreRange] = useState(
    searchParams.get("scoreRange") || ""
  );
  const [followUpDate, setFollowUpDate] = useState(initialFollowUpDate);
  const [siteVisitDate, setSiteVisitDate] = useState(
    searchParams.get("siteVisitDate") || ""
  );

  useEffect(() => {
    setFollowUpDate(initialFollowUpDate);
  }, [initialFollowUpDate]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (scoreRange) params.append("scoreRange", scoreRange);
      if (followUpDate) params.append("followUpDate", followUpDate);
      if (siteVisitDate) params.append("siteVisitDate", siteVisitDate);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch<any[]>(
        `/api/leads?${params.toString()}`,
        { baseURL: apiUrl }
      );
      if (res.data) {
        setLeads(res.data);
      } else if (res.error) {
        console.error("Failed to fetch leads:", res.error);
      }
    } catch (e) {
      console.error("Failed to fetch leads:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [status, scoreRange, followUpDate, siteVisitDate]);

  return (
    <Card className="p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      <LeadTableFilters
        isManagerView={isManagerView}
        status={status}
        setStatus={setStatus}
        scoreRange={scoreRange}
        setScoreRange={setScoreRange}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        siteVisitDate={siteVisitDate}
        setSiteVisitDate={setSiteVisitDate}
      />

      <LeadTableGrid
        leads={leads}
        loading={loading}
        isManagerView={isManagerView}
        pathname={pathname}
      />
    </Card>
  );
}

export function LeadTableClient({
  isManagerView,
}: {
  isManagerView?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-semibold text-[var(--text-muted)]">
          Loading lead management filters…
        </div>
      }
    >
      <LeadTableContent isManagerView={isManagerView} />
    </Suspense>
  );
}
