import { useState } from 'react';

export function useLeadBooking(leadId: string) {
  const [booking, setBooking] = useState<any>(null);

  const fetchBooking = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/booking`);
      if (res.ok) {
        const text = await res.text();
        if (text) setBooking(JSON.parse(text));
      }
    } catch (e) {
      console.error('Failed to fetch booking:', e);
    }
  };

  return {
    booking,
    fetchBooking,
  };
}
