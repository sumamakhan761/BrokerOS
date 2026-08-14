import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function useSalesExecLeads() {
  const searchParams = useSearchParams();
  const initialFollowUpDate = searchParams.get('followUpDate') || '';
  const initialSiteVisitDate = searchParams.get('siteVisitDate') || '';

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(searchParams.get('status') || (initialSiteVisitDate ? 'SITE_VISIT_SCHEDULED' : ''));
  const [followUpDate, setFollowUpDate] = useState(initialFollowUpDate);
  const [siteVisitDate, setSiteVisitDate] = useState(initialSiteVisitDate);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setFollowUpDate(initialFollowUpDate);
  }, [initialFollowUpDate]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (followUpDate) params.append('followUpDate', followUpDate);
      if (siteVisitDate) params.append('siteVisitDate', siteVisitDate);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await authClient.$fetch<any[]>(`/api/leads?${params.toString()}`, { baseURL: apiUrl });
      if (res.data) {
        setLeads(res.data);
      } else if (res.error) {
        console.error('Failed to fetch leads:', res.error);
      }
    } catch (e) {
      console.error('Failed to fetch leads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [status, followUpDate, siteVisitDate]);

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
    siteVisitDate,
    setSiteVisitDate,
    search,
    setSearch,
  };
}
