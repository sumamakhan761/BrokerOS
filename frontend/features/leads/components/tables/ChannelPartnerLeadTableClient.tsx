'use client';

import React, { Suspense, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { usePostSalesLeads } from '@/features/leads/hooks/usePostSalesLeads';
import { PostSalesTableFilters } from '@/features/leads/components/tables/PostSalesTableFilters';
import { PostSalesTable } from '@/features/leads/components/tables/PostSalesTable';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ClosingManagerNewLeadModal } from '@/features/leads/components/modals/ClosingManagerNewLeadModal';

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
    <Card className="space-y-4">
      <div className="flex justify-between items-center px-4 pt-4">
        <h2 className="text-lg font-bold text-gray-900">Customer Management</h2>
        <Button onClick={() => setIsNewLeadModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Lead
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
            window.location.reload(); // Quick refresh for now
          }}
        />
      )}
    </Card>
  );
}

export function ChannelPartnerLeadTableClient() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Loading...</div>}>
      <ChannelPartnerLeadTableContent />
    </Suspense>
  );
}
