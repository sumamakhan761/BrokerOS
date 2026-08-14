import { useState, useEffect } from 'react';

export function useBrokerTable(isCP: boolean) {
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [followUpDate, setFollowUpDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    name: '',
    phone: '',
    city: '',
    sourcingManagerId: '',
    reraNumber: '',
    gstNumber: '',
    serviceAreas: '',
    assignedProjects: [] as string[]
  });
  const [saving, setSaving] = useState(false);

  // Assignment Modal
  const [assignModalBroker, setAssignModalBroker] = useState<any>(null);
  const [sourcingManagers, setSourcingManagers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadBrokers();
    loadProjects();
    if (isCP) {
      loadSourcingManagers();
    }
  }, [isCP, followUpDate]);

  const loadBrokers = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const params = new URLSearchParams();
      if (followUpDate) params.append('followUpDate', followUpDate);

      const res = await fetch(`${baseUrl}/api/brokers?${params.toString()}`);
      if (res.ok) {
        setBrokers(await res.json());
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
        setSourcingManagers(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadProjects = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/inventory/projects?isCpProject=true`);
      if (res.ok) {
        setProjects(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setIsModalOpen(false);
        loadBrokers();
        setForm({
          companyName: '',
          name: '',
          phone: '',
          city: '',
          sourcingManagerId: '',
          reraNumber: '',
          gstNumber: '',
          serviceAreas: '',
          assignedProjects: []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (brokerId: string, smId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers/${brokerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcingManagerId: smId })
      });
      if (res.ok) {
        setAssignModalBroker(null);
        loadBrokers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBrokers = brokers.filter(b => {
    const matchesSearch = (b.name + b.companyName + b.phone).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isModalOpen,
    setIsModalOpen,
    form,
    setForm,
    saving,
    assignModalBroker,
    setAssignModalBroker,
    sourcingManagers,
    projects,
    handleCreate,
    handleAssign,
    filteredBrokers,
    followUpDate,
    setFollowUpDate
  };
}
