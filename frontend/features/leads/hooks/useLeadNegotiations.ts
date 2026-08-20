import { useState } from 'react';

export function useLeadNegotiations(leadId: string) {
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/negotiations`);
      if (res.ok) {
        const data = await res.json();
        setNegotiations(data);
      }
    } catch (e) {
      console.error('Failed to fetch negotiations:', e);
    } finally {
      setLoading(false);
    }
  };

  return {
    negotiations,
    fetchNegotiations,
    loadingNegotiations: loading,
  };
}
