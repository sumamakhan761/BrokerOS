"use client";

import React, { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";
import { NewLeadsToolbar } from "@/features/leads/components/tables/NewLeadsToolbar";
import { NewLeadsGrid } from "@/features/leads/components/tables/NewLeadsGrid";

function NewLeadsContent() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [subordinates, setSubordinates] = useState<any[]>([]);

  const fetchLeadsAndSubordinates = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${baseUrl}/api/leads?managerUnassigned=true`);
      if (res.ok) setLeads(await res.json());

      const subRes = await fetch(`${baseUrl}/users/subordinates`);
      if (subRes.ok) setSubordinates(await subRes.json());
    } catch (e) {
      console.error("Failed to fetch leads:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsAndSubordinates();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLeadIds(
      e.target.checked ? new Set(leads.map((l) => l.id)) : new Set()
    );
  };

  const handleSelectOne = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const next = new Set(selectedLeadIds);
    if (e.target.checked) next.add(id);
    else next.delete(id);
    setSelectedLeadIds(next);
  };

  const handleAssign = async (
    leadIds: string[],
    targetUserId?: string,
    roundRobin = false
  ) => {
    if (!leadIds.length) {
      toast.error("Please select leads to assign");
      return;
    }
    if (!roundRobin && !targetUserId) {
      toast.error("Select an executive to assign to");
      return;
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${baseUrl}/api/leads/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds, targetUserId, roundRobin }),
      });
      if (res.ok) {
        toast.success(`Assigned ${leadIds.length} lead${leadIds.length > 1 ? "s" : ""} successfully`);
        setSelectedLeadIds(new Set());
        fetchLeadsAndSubordinates();
      } else {
        toast.error("Failed to assign leads.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error assigning leads.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <NewLeadsToolbar
        selectedLeadIds={selectedLeadIds}
        subordinates={subordinates}
        onAssign={handleAssign}
        onUploadSuccess={fetchLeadsAndSubordinates}
      />
      <NewLeadsGrid
        leads={leads}
        loading={loading}
        selectedLeadIds={selectedLeadIds}
        subordinates={subordinates}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onAssign={handleAssign}
      />
    </div>
  );
}

export function NewLeadsTable() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-xs font-semibold text-[var(--text-muted)]">
          Loading unassigned leads…
        </div>
      }
    >
      <NewLeadsContent />
    </Suspense>
  );
}
