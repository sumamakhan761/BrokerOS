import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

export function useBookingForm(
  leadId: string,
  userId: string,
  showForm: boolean,
  setShowForm: (show: boolean) => void,
  onRefresh: () => void,
  lead?: any,
  booking?: any
) {
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

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const [towers, setTowers] = useState<any[]>([]);
  const [selectedTowerId, setSelectedTowerId] = useState('');

  const [floors, setFloors] = useState<any[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState('');

  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState(lead?.interestedUnitId || '');

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
        paymentMode: booking.paymentMode || '', // NOTE: paymentMode and others might need to be extracted from notes in backend or just left blank if not available directly on booking record unless we pass it down.
        transactionRef: booking.transactionRef || '',
        loanRequired: false,
        remarks: booking.cancelReason || '',
      });
      setHasInitializedFromBooking(true);
    } else if (showForm && lead && !booking) {
      if (lead.interestedProjectId) setSelectedProjectId(lead.interestedProjectId);
      if (lead.interestedTowerId) setSelectedTowerId(lead.interestedTowerId);
      if (lead.interestedUnit?.floorId) setSelectedFloorId(lead.interestedUnit.floorId);
      if (lead.interestedUnitId) setSelectedUnitId(lead.interestedUnitId);
    }
  }, [showForm, lead, booking, hasInitializedFromBooking]);

  // Fetch Projects on Mount (when form opens)
  useEffect(() => {
    if (showForm) {
      const fetchProjects = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

          const isCpRole = typeof window !== 'undefined' &&
            (window.location.pathname.includes('/channel-partner') ||
              window.location.pathname.includes('/sourcing-manager') ||
              window.location.pathname.includes('/closing-manager'));

          const queryParam = isCpRole ? '?isCpProject=true' : '?isCpProject=false';

          const res = await authClient.$fetch<any[]>(`/api/inventory/projects${queryParam}`, { baseURL: apiUrl });
          if (res.data) {
            setProjects(res.data);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchProjects();
    }
  }, [showForm]);

  // Fetch Towers when Project changes
  useEffect(() => {
    if (selectedProjectId) {
      const fetchTowers = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
          const res = await authClient.$fetch<any[]>(`/api/inventory/projects/${selectedProjectId}/towers`, { baseURL: apiUrl });
          if (res.data) setTowers(res.data);
        } catch (e) {
          console.error(e);
        }
      };
      fetchTowers();
    } else {
      setTowers([]);
    }
    // Only clear if the current selected tower is not in the new list (handled in next effect)
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedTowerId && towers.length > 0 && !towers.some(t => t.id === selectedTowerId)) {
      setSelectedTowerId('');
    }
  }, [towers, selectedTowerId]);

  // Update Floors when Tower changes
  useEffect(() => {
    if (selectedTowerId && towers.length > 0) {
      const tower = towers.find(t => t.id === selectedTowerId);
      setFloors(tower?.floors || []);
    } else {
      setFloors([]);
    }
  }, [selectedTowerId, towers]);

  useEffect(() => {
    if (selectedFloorId && floors.length > 0 && !floors.some(f => f.id === selectedFloorId)) {
      setSelectedFloorId('');
    }
  }, [floors, selectedFloorId]);

  // Update Units when Floor changes
  useEffect(() => {
    if (selectedFloorId && floors.length > 0) {
      const floor = floors.find(f => f.id === selectedFloorId);
      const availableUnits = (floor?.units || []).filter((u: any) => u.status === 'AVAILABLE');
      setUnits(availableUnits);
      // If we are auto-filling the unit, it might not be 'AVAILABLE' if it was blocked just now.
      // But let's assume it is or we include it if it's the selected one.
      if (selectedUnitId && !availableUnits.some((u: any) => u.id === selectedUnitId)) {
        const selectedUnit = floor?.units?.find((u: any) => u.id === selectedUnitId);
        if (selectedUnit) {
          setUnits([...availableUnits, selectedUnit]);
        }
      }
    } else {
      setUnits([]);
    }
  }, [selectedFloorId, floors]);

  useEffect(() => {
    if (selectedUnitId && units.length > 0 && !units.some(u => u.id === selectedUnitId)) {
      setSelectedUnitId('');
    }
  }, [units, selectedUnitId]);

  // Auto-fill price and description when Unit changes
  useEffect(() => {
    if (selectedUnitId && units.length > 0) {
      const unit = units.find(u => u.id === selectedUnitId);
      if (unit) {
        const tower = towers.find(t => t.id === selectedTowerId);
        const floor = floors.find(f => f.id === selectedFloorId);

        setForm(prev => ({
          ...prev,
          agreedPrice: String(unit.basePrice || ''),
          unitDescription: `${tower?.name || ''}, ${floor?.name || ''}, Unit ${unit.unitNumber}, ${unit.type.replace('_', ' ')}`,
        }));
      }
    } else {
      setForm(prev => ({ ...prev, unitDescription: '' }));
    }
  }, [selectedUnitId, units, selectedTowerId, selectedFloorId, towers, floors]);

  const handleCreateBooking = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const url = booking ? `/api/leads/${leadId}/booking` : `/api/leads/${leadId}/booking`;
      const method = booking ? 'PATCH' : 'POST';
      
      const payload: any = {
        userId,
        unitId: selectedUnitId, // Pass unitId to backend for unit status linking
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

      await authClient.$fetch(url, {
        baseURL: apiUrl,
        method: method,
        body: payload,
      });
      setShowForm(false);
      setHasInitializedFromBooking(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return {
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
