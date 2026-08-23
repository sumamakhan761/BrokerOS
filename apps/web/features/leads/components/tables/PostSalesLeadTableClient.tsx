'use client';

import React, { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { usePostSalesLeads } from '@/features/leads/hooks/usePostSalesLeads';
import { PostSalesTableFilters } from '@/features/leads/components/tables/PostSalesTableFilters';
import { PostSalesTable } from '@/features/leads/components/tables/PostSalesTable';

function PostSalesLeadTableContent({ isManagerView, completedHandoversOnly }: { isManagerView?: boolean, completedHandoversOnly?: boolean }) {
  const {
    filteredLeads,
    loading,
    status,
    setStatus,
    followUpDate,
    setFollowUpDate,
    search,
    setSearch,
  } = usePostSalesLeads({ completedHandoversOnly });

  return (
    <Card>
      <PostSalesTableFilters
        status={status}
        setStatus={setStatus}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        search={search}
        setSearch={setSearch}
        completedHandoversOnly={completedHandoversOnly}
      />
      <PostSalesTable
        filteredLeads={filteredLeads}
        loading={loading}
      />
    </Card>
  );
}

export function PostSalesLeadTableClient({ isManagerView, completedHandoversOnly }: { isManagerView?: boolean, completedHandoversOnly?: boolean }) {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Loading...</div>}>
      <PostSalesLeadTableContent isManagerView={isManagerView} completedHandoversOnly={completedHandoversOnly} />
    </Suspense>
  );
}
