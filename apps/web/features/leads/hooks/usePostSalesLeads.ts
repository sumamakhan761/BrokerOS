import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function usePostSalesLeads(options?: { completedHandoversOnly?: boolean, isCpProject?: boolean }) {
  const searchParams = useSearchParams();
  const initialFollowUpDate = searchParams.get('followUpDate') || '';

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(
    options?.completedHandoversOnly ? 'HANDOVER' : (searchParams.get('status') || 'NEW,CONTACTED,NEGOTIATION,BOOKING,DOCUMENT,LOAN,AGREEMENT,HANDOVER')
  );
  const [followUpDate, setFollowUpDate] = useState(initialFollowUpDate);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setFollowUpDate(initialFollowUpDate);
  }, [initialFollowUpDate]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const statusesToFetch = status.split(',');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

      let allLeads: any[] = [];

      for (const st of statusesToFetch) {
        const params = new URLSearchParams();
        params.append('status', st);
        if (followUpDate) params.append('followUpDate', followUpDate);
        if (options?.isCpProject !== undefined) params.append('isCpProject', options.isCpProject.toString());

        const res = await authClient.$fetch<any[]>(`/api/leads?${params.toString()}`, { baseURL: apiUrl });
        if (res.data) {
          allLeads = [...allLeads, ...res.data];
        }
      }

      let uniqueLeads = Array.from(new Map(allLeads.map(item => [item.id, item])).values());

      if (options?.completedHandoversOnly) {
        uniqueLeads = uniqueLeads.filter(l => l.subStatus === 'DONE');
      }

      uniqueLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setLeads(uniqueLeads);
    } catch (e) {
      console.error('Failed to fetch leads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [status, followUpDate]);

  const filteredLeads = leads.filter(l =>
    !search ||
    `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search)
  );

  return {
    filteredLeads,
    loading,
    status,
    setStatus,
    followUpDate,
    setFollowUpDate,
    search,
    setSearch,
  };
}
