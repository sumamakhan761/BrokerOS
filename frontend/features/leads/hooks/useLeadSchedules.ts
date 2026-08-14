import { useState } from 'react';

export function useLeadSchedules(leadId: string, userId: string | undefined, lead: any) {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [svCompleteModalOpen, setSvCompleteModalOpen] = useState(false);
  
  const [editingFollowUpId, setEditingFollowUpId] = useState<string | null>(null);
  const [editingSiteVisitId, setEditingSiteVisitId] = useState<string | null>(null);
  const [selectedSvId, setSelectedSvId] = useState<string | null>(null);

  const [isSavingFollowUp, setIsSavingFollowUp] = useState(false);
  const [isSavingSiteVisit, setIsSavingSiteVisit] = useState(false);

  const [followUpData, setFollowUpData] = useState({ title: '', description: '', date: '' });
  const [siteVisitData, setSiteVisitData] = useState({ projectId: '', description: '', date: '' });

  const fetchFollowUps = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/follow-ups`);
      if (res.ok) setFollowUps(await res.json());
    } catch (e) { console.error('Failed to fetch follow-ups:', e); }
  };

  const fetchSiteVisits = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/site-visits`);
      if (res.ok) setSiteVisits(await res.json());
    } catch (e) { console.error('Failed to fetch site visits:', e); }
  };

  const handleSaveFollowUp = async () => {
    try {
      if (!userId) return alert('You must be logged in.');
      setIsSavingFollowUp(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const url = editingFollowUpId ? `${apiUrl}/api/leads/follow-ups/${editingFollowUpId}` : `${apiUrl}/api/leads/${leadId}/follow-ups`;
      const method = editingFollowUpId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          scheduledDate: followUpData.date,
          type: followUpData.title,
          remarks: followUpData.description
        }),
      });

      if (res.ok) {
        setIsFollowUpModalOpen(false);
        setEditingFollowUpId(null);
        setFollowUpData({ title: '', description: '', date: '' });
        fetchFollowUps();
      }
    } catch (e) { console.error('Failed to save follow-up:', e); }
    finally {
      setIsSavingFollowUp(false);
    }
  };

  const handleDeleteFollowUp = async () => {
    if (!editingFollowUpId) return;
    if (!confirm('Are you sure you want to delete this follow-up?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/follow-ups/${editingFollowUpId}`, { method: 'DELETE' });
      if (res.ok) {
        setIsFollowUpModalOpen(false);
        setEditingFollowUpId(null);
        fetchFollowUps();
      }
    } catch (e) { console.error('Failed to delete follow-up:', e); }
  };

  const openFollowUpModal = (item?: any) => {
    if (item) {
      setEditingFollowUpId(item.id);
      setFollowUpData({
        title: item.type || '',
        description: item.remarks || '',
        date: new Date(item.scheduledDate).toISOString().slice(0, 16)
      });
    } else {
      setEditingFollowUpId(null);
      setFollowUpData({ title: '', description: '', date: '' });
    }
    setIsFollowUpModalOpen(true);
  };

  const handleConfirmFollowUp = async (followUpId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/dashboard/pre-sales/follow-ups/${followUpId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        fetchFollowUps();
      } else {
        alert(data.message || 'Cannot confirm follow-up.');
      }
    } catch (e) {
      console.error('Failed to confirm follow-up:', e);
    }
  };

  const handleSaveSiteVisit = async () => {
    try {
      if (!userId) return alert('You must be logged in.');
      setIsSavingSiteVisit(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const url = editingSiteVisitId ? `${apiUrl}/api/leads/site-visits/${editingSiteVisitId}` : `${apiUrl}/api/leads/${leadId}/site-visits`;
      const method = editingSiteVisitId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectId: siteVisitData.projectId,
          scheduledDate: siteVisitData.date,
          meetingNotes: siteVisitData.description
        }),
      });

      if (res.ok) {
        setIsSiteVisitModalOpen(false);
        setEditingSiteVisitId(null);
        setSiteVisitData({ projectId: '', description: '', date: '' });
        fetchSiteVisits();
      }
    } catch (e) { console.error('Failed to save site visit:', e); }
    finally {
      setIsSavingSiteVisit(false);
    }
  };

  const handleDeleteSiteVisit = async () => {
    if (!editingSiteVisitId) return;
    if (!confirm('Are you sure you want to delete this site visit?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/site-visits/${editingSiteVisitId}`, { method: 'DELETE' });
      if (res.ok) {
        setIsSiteVisitModalOpen(false);
        setEditingSiteVisitId(null);
        fetchSiteVisits();
      }
    } catch (e) { console.error('Failed to delete site visit:', e); }
  };

  const openSiteVisitModal = (item?: any) => {
    if (!lead) return;
    const isPreSales = typeof window !== 'undefined' && window.location.pathname.includes('/pre-sales');
    if (isPreSales) {
      if (lead.status !== 'SITE_VISIT_SCHEDULED') {
        alert('Cannot schedule: Please change the lead status to SITE VISIT SCHEDULED first.');
        return;
      }
    } else {
      if (!['SITE_VISIT_SCHEDULED', 'SITE_VISIT_COMPLETED', 'BOOKING'].includes(lead.status)) {
        alert('Cannot schedule: Lead status must be SITE VISIT SCHEDULED, COMPLETED, or BOOKING.');
        return;
      }
    }

    if (item) {
      setEditingSiteVisitId(item.id);
      setSiteVisitData({
        projectId: item.projectId || '',
        description: item.meetingNotes || '',
        date: new Date(item.scheduledDate).toISOString().slice(0, 16)
      });
    } else {
      setEditingSiteVisitId(null);
      setSiteVisitData({ projectId: '', description: '', date: '' });
    }
    setIsSiteVisitModalOpen(true);
  };

  return {
    followUps,
    siteVisits,
    isFollowUpModalOpen,
    setIsFollowUpModalOpen,
    isSiteVisitModalOpen,
    setIsSiteVisitModalOpen,
    svCompleteModalOpen,
    setSvCompleteModalOpen,
    editingFollowUpId,
    editingSiteVisitId,
    selectedSvId,
    setSelectedSvId,
    followUpData,
    setFollowUpData,
    siteVisitData,
    setSiteVisitData,
    isSavingFollowUp,
    isSavingSiteVisit,
    fetchFollowUps,
    fetchSiteVisits,
    handleSaveFollowUp,
    handleDeleteFollowUp,
    openFollowUpModal,
    handleConfirmFollowUp,
    handleSaveSiteVisit,
    handleDeleteSiteVisit,
    openSiteVisitModal,
  };
}
