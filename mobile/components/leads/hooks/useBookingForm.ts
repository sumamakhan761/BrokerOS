import { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { authClient } from '../../../lib/auth-client';

export function useBookingForm(leadId: string, onRefresh: () => void, lead?: any, booking?: any) {
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

  const [hasInitializedFromBooking, setHasInitializedFromBooking] = useState(false);

  // Cascading Dropdown States
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Pre-fill from lead or booking
  useEffect(() => {
    if (showForm && booking && !hasInitializedFromBooking) {
      if (booking.unit?.floor?.tower?.projectId) setSelectedProjectId(booking.unit.floor.tower.projectId);
      if (booking.unit?.floor?.towerId) setSelectedTowerId(booking.unit.floor.towerId);
      if (booking.unit?.floorId) setSelectedFloorId(booking.unit.floorId);
      if (booking.unitId) setSelectedUnitId(booking.unitId);
      
      setForm({
        unitDescription: booking.unitDescription || '',
        agreedPrice: booking.agreedPrice ? String(booking.agreedPrice) : '',
        bookingAmount: booking.tokenAmount ? String(booking.tokenAmount) : '',
        commissionPercentage: booking.commissionPercentage ? String(booking.commissionPercentage) : '',
        commissionAmount: booking.commissionAmount ? String(booking.commissionAmount) : '',
        paymentMode: booking.paymentMode || '',
        transactionRef: booking.transactionRef || '',
        loanRequired: false,
        remarks: booking.cancelReason || '',
      });
      setHasInitializedFromBooking(true);
    } else if (showForm && lead && !booking) {
      if (lead.interestedProjectId) setSelectedProjectId(lead.interestedProjectId);
      if (lead.interestedTowerId) setSelectedTowerId(lead.interestedTowerId);
      if (lead.interestedUnitId) setSelectedUnitId(lead.interestedUnitId);
    }
  }, [showForm, lead, booking, hasInitializedFromBooking]);

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
        Toast.show({ type: 'error', text1: 'Error', text2: 'You must be logged in.' });
        return;
      }

      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const url = booking ? `/api/leads/${leadId}/booking` : `/api/leads/${leadId}/booking`;
      const method = booking ? 'PATCH' : 'POST';

      const payload: any = {
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
      };

      if (booking) {
        payload.bookingId = booking.id;
      }

      const { error } = await authClient.$fetch(url, {
        baseURL,
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (!error) {
        setShowForm(false);
        setHasInitializedFromBooking(false);
        onRefresh();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create booking' });
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
