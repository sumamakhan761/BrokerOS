import { useState, useRef } from 'react';

export function useBrokerDetails(brokerId: string, isCP: boolean) {
  const [broker, setBroker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Header Edit state
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerFormData, setHeaderFormData] = useState<any>({ name: '', email: '' });

  // Info Card Edit state
  const [isEditingBrokerInfo, setIsEditingBrokerInfo] = useState(false);
  const [brokerInfoData, setBrokerInfoData] = useState<any>({});
  const [availableSourcingManagers, setAvailableSourcingManagers] = useState<any[]>([]);

  const loadBroker = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers/${brokerId}`);
      if (res.ok) {
        const data = await res.json();
        setBroker(data);
        setHeaderFormData({
          name: data.name || '',
          email: data.email || '',
        });
        setBrokerInfoData({
          companyName: data.companyName || '',
          reraNumber: data.reraNumber || '',
          gstNumber: data.gstNumber || '',
          serviceAreas: data.serviceAreas && data.serviceAreas.length > 0 ? data.serviceAreas.join(', ') : '',
          sourcingManagerId: data.sourcingManagerId || '',
          city: data.city || '',
          address: data.address || '',
        });
        return data;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSourcingManagers = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers/sourcing-managers`);
      if (res.ok) {
        setAvailableSourcingManagers(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBrokerInfoSave = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const payload = { ...brokerInfoData };
      if (payload.sourcingManagerId === '') payload.sourcingManagerId = null;
      if (typeof payload.serviceAreas === 'string') {
        payload.serviceAreas = payload.serviceAreas.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      const res = await fetch(`${baseUrl}/api/brokers/${brokerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsEditingBrokerInfo(false);
        loadBroker();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleHeaderSave = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers/${brokerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(headerFormData)
      });
      if (res.ok) {
        setIsEditingHeader(false);
        loadBroker();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubStatusChange = async (subStatus: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers/${brokerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subStatus })
      });
      if (res.ok) {
        loadBroker();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return {
    broker,
    setBroker,
    loading,
    isEditingHeader,
    setIsEditingHeader,
    headerFormData,
    setHeaderFormData,
    isEditingBrokerInfo,
    setIsEditingBrokerInfo,
    brokerInfoData,
    setBrokerInfoData,
    availableSourcingManagers,
    loadBroker,
    loadSourcingManagers,
    handleBrokerInfoSave,
    handleHeaderSave,
    handleSubStatusChange
  };
}
