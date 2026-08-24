"use client";

import React, { Suspense, useState } from "react";
import { Card } from "@/components/ui/Card";
import { usePostSalesLeads } from "@/features/leads/hooks/usePostSalesLeads";
import { PostSalesTableFilters } from "@/features/leads/components/tables/PostSalesTableFilters";
import { PostSalesTable } from "@/features/leads/components/tables/PostSalesTable";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { ClosingManagerNewLeadModal } from "@/features/leads/components/modals/ClosingManagerNewLeadModal";

function ChannelPartnerLeadTableContent() {
  const {
    filteredLeads,
    loading,
    status,
    setStatus,
    followUpDate,
    setFollowUpDate,
    search,
    setSearch,
  } = usePostSalesLeads({ isCpProject: true });

  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  return (
    <Card className="space-y-4 p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex justify-between items-center pb-2">
        <div>
          <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
            Channel Partner Portfolio
          </h2>
          <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
            Active buyer registrations, bookings, and post-sales commissions.
          </p>
        </div>
        <Button
          onClick={() => setIsNewLeadModalOpen(true)}
          variant="luxury"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New CP Lead</span>
        </Button>
      </div>

      <PostSalesTableFilters
        status={status}
        setStatus={setStatus}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        search={search}
        setSearch={setSearch}
      />
      <PostSalesTable
        filteredLeads={filteredLeads}
        loading={loading}
      />

      {isNewLeadModalOpen && (
        <ClosingManagerNewLeadModal
          isOpen={isNewLeadModalOpen}
          onClose={() => setIsNewLeadModalOpen(false)}
          onSuccess={() => {
            setIsNewLeadModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </Card>
  );
}

export function ChannelPartnerLeadTableClient() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-semibold text-[var(--text-muted)]">
          Loading CP lead records…
        </div>
      }
    >
      <ChannelPartnerLeadTableContent />
    </Suspense>
  );
}
