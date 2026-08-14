'use client';

import React, { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { useSalesExecLeads } from '@/features/leads/hooks/useSalesExecLeads';
import { SalesExecTableFilters } from '@/features/leads/components/tables/SalesExecTableFilters';
import { SalesExecTable } from '@/features/leads/components/tables/SalesExecTable';

function SalesExecLeadTableContent({ isManagerView }: { isManagerView?: boolean }) {
  const {
    filteredLeads,
    loading,
    status,
    setStatus,
    followUpDate,
    setFollowUpDate,
    siteVisitDate,
    setSiteVisitDate,
    search,
    setSearch,
  } = useSalesExecLeads();

  return (
    <Card>
      <SalesExecTableFilters
        status={status}
        setStatus={setStatus}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        siteVisitDate={siteVisitDate}
        setSiteVisitDate={setSiteVisitDate}
        search={search}
        setSearch={setSearch}
      />
      <SalesExecTable
        filteredLeads={filteredLeads}
        loading={loading}
        isManagerView={isManagerView}
      />
    </Card>
  );
}

export function SalesExecLeadTableClient({ isManagerView }: { isManagerView?: boolean }) {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Loading...</div>}>
      <SalesExecLeadTableContent isManagerView={isManagerView} />
    </Suspense>
  );
}
