import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { authClient } from '../../../lib/auth-client';

export function useBookingForm(leadId: string, onRefresh: () => void, lead?: any) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    unitDescription: '',
    agreedPrice: '',
    bookingAmount: '',
    commissionPercentage: '',
    commissionAmount: '',
    paymentMode: '',
    transactionRef: '',
    loanRequired: false,
    remarks: '',
  });

  // Cascading Dropdown States
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Pre-fill from lead
  useEffect(() => {
    if (showForm && lead) {
      if (lead.interestedProjectId) setSelectedProjectId(lead.interestedProjectId);
      // Depending on if lead stores interestedTowerId, interestedUnitId
      if (lead.interestedTowerId) setSelectedTowerId(lead.interestedTowerId);
      if (lead.interestedUnitId) setSelectedUnitId(lead.interestedUnitId);
    }
  }, [showForm, lead]);

  const [towers, setTowers] = useState<any[]>([]);
  const [selectedTowerId, setSelectedTowerId] = useState('');

  const [floors, setFloors] = useState<any[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState('');

  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');

  useEffect(() => {
    if (showForm) {
      const fetchProjects = async () => {
        try {
          const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
          // The backend detects the user's role from their auth token and
          // automatically returns the correct project type (CP vs non-CP).
          // No need to guess the role client-side.
          const { data, error } = await authClient.$fetch<any[]>('/api/inventory/projects', { baseURL });
          if (!error && data) {
            setProjects(data);
          }
        } catch (e) { console.error(e); }
      };
      fetchProjects();
    }
  }, [showForm]);

  useEffect(() => {
    if (selectedProjectId) {
      const fetchTowers = async () => {
        try {
          const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
          const { data } = await authClient.$fetch<any[]>(`/api/inventory/projects/${selectedProjectId}/towers`, { baseURL });
          if (data) setTowers(data);
        } catch (e) { console.error(e); }
      };
      fetchTowers();
    } else {
      setTowers([]);
    }
    setSelectedTowerId('');
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedTowerId && towers.length > 0) {
      const tower = towers.find(t => t.id === selectedTowerId);
      setFloors(tower?.floors || []);
    } else {
      setFloors([]);
    }
    setSelectedFloorId('');
  }, [selectedTowerId, towers]);

  useEffect(() => {
    if (selectedFloorId && floors.length > 0) {
      const floor = floors.find(f => f.id === selectedFloorId);
      const availableUnits = (floor?.units || []).filter((u: any) => u.status === 'AVAILABLE');
      setUnits(availableUnits);
    } else {
      setUnits([]);
    }
    setSelectedUnitId('');
  }, [selectedFloorId, floors]);

  useEffect(() => {
    if (selectedUnitId && units.length > 0) {
      const unit = units.find(u => u.id === selectedUnitId);
      if (unit) {
        const tower = towers.find(t => t.id === selectedTowerId);
        const floor = floors.find(f => f.id === selectedFloorId);

        setForm(prev => ({
          ...prev,
          agreedPrice: String(unit.basePrice || ''),
          unitDescription: `${tower?.name || ''}, ${floor?.name || ''}, Unit ${unit.unitNumber}, ${unit.type.replace('_', ' ')}`
        }));
      }
    } else {
      setForm(prev => ({ ...prev, unitDescription: '' }));
    }
  }, [selectedUnitId, units, selectedTowerId, selectedFloorId, towers, floors]);

  const handleCreateBooking = async () => {
    setSaving(true);
    try {
      const { data: sessionData } = await authClient.getSession();
      const userId = (sessionData?.user as any)?.id;
      if (!userId) {
        Alert.alert('Error', 'You must be logged in.');
        return;
      }

      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { error } = await authClient.$fetch(`/api/leads/${leadId}/booking`, {
        baseURL,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          userId,
          unitId: selectedUnitId,
          unitDescription: form.unitDescription,
          agreedPrice: form.agreedPrice ? Number(form.agreedPrice) : undefined,
          bookingAmount: form.bookingAmount ? Number(form.bookingAmount) : undefined,
          commissionPercentage: form.commissionPercentage ? Number(form.commissionPercentage) : undefined,
          commissionAmount: form.commissionAmount ? Number(form.commissionAmount) : undefined,
          paymentMode: form.paymentMode,
          transactionRef: form.transactionRef,
          loanRequired: form.loanRequired,
          remarks: form.remarks,
        },
      });
      if (!error) {
        setShowForm(false);
        onRefresh();
      } else {
        Alert.alert('Error', 'Failed to create booking');
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    showForm,
    setShowForm,
    saving,
    form,
    setForm,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    towers,
    selectedTowerId,
    setSelectedTowerId,
    floors,
    selectedFloorId,
    setSelectedFloorId,
    units,
    selectedUnitId,
    setSelectedUnitId,
    handleCreateBooking,
  };
}
