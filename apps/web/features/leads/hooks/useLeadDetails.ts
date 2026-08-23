import { useState, useRef } from 'react';

export function useLeadDetails(leadId: string) {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingLeadInfo, setIsEditingLeadInfo] = useState(false);
  const [availableSources, setAvailableSources] = useState<any[]>([]);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    preferredLocation: '',
  });

  const [leadInfoData, setLeadInfoData] = useState({
    budget: '',
    lastContactDate: '',
    nextFollowUpDate: '',
    sourceId: '',
    interestedProjectId: '',
    preferredLocation: '',
    requirements: '',
  });

  const fetchLead = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data);
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          preferredLocation: data.preferredLocation || '',
        });
        setLeadInfoData({
          budget: data.budget || '',
          lastContactDate: data.lastContactDate ? new Date(data.lastContactDate).toISOString().split('T')[0] : '',
          nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate).toISOString().split('T')[0] : '',
          sourceId: data.sourceId || '',
          interestedProjectId: data.interestedProjectId || '',
          preferredLocation: data.preferredLocation || '',
          requirements: data.requirements || '',
        });
      }
    } catch (e) {
      console.error('Failed to fetch lead:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const [sourcesRes, projectsRes] = await Promise.all([
        fetch(`${apiUrl}/sources`),
        fetch(`${apiUrl}/projects`)
      ]);

      if (sourcesRes.ok) {
        setAvailableSources(await sourcesRes.json());
      }
      if (projectsRes.ok) {
        let projects = await projectsRes.json();
        if (typeof window !== 'undefined') {
          const isBrokerage = window.location.pathname.includes('/pre-sales') || 
                              window.location.pathname.includes('/sales-') || 
                              window.location.pathname.includes('/closing-manager') || 
                              window.location.pathname.includes('/post-sales');
          if (isBrokerage) {
            projects = projects.filter((p: any) => !p.isCpProject);
          }
        }
        setAvailableProjects(projects);
      }
    } catch (e) {
      console.error('Failed to fetch metadata:', e);
    }
  };

  const handleSave = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updatedLead = await res.json();
        setLead(updatedLead);
        setIsEditing(false);
      }
    } catch (e) {
      console.error('Failed to update lead:', e);
    }
  };

  const handleLeadInfoSave = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const payload: any = {};
      if (leadInfoData.budget) payload.budget = Number(leadInfoData.budget);
      if (leadInfoData.lastContactDate) payload.lastContactDate = leadInfoData.lastContactDate;
      if (leadInfoData.nextFollowUpDate) payload.nextFollowUpDate = leadInfoData.nextFollowUpDate;
      if (leadInfoData.sourceId) payload.sourceId = leadInfoData.sourceId;
      if (leadInfoData.interestedProjectId) payload.interestedProjectId = leadInfoData.interestedProjectId;
      payload.preferredLocation = leadInfoData.preferredLocation;
      payload.requirements = leadInfoData.requirements;

      const res = await fetch(`${apiUrl}/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updatedLead = await res.json();
        setLead(updatedLead);
        setIsEditingLeadInfo(false);
      }
    } catch (e) {
      console.error('Failed to update lead info:', e);
    }
  };

  const handleTemperatureChange = async (newTemp: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature: newTemp }),
      });
      if (res.ok) {
        setLead({ ...lead, temperature: newTemp });
      }
    } catch (e) {
      console.error('Failed to update temperature:', e);
    }
  };

  const handleSubStatusChange = async (newSubStatus: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subStatus: newSubStatus }),
      });
      if (res.ok) {
        setLead({ ...lead, subStatus: newSubStatus });
      }
    } catch (e) {
      console.error('Failed to update subStatus:', e);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/avatar`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const updatedLead = await res.json();
        setLead(updatedLead);
      }
    } catch (e) {
      console.error('Failed to upload avatar:', e);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return {
    lead,
    setLead,
    loading,
    isEditing,
    setIsEditing,
    uploading,
    fileInputRef,
    isEditingLeadInfo,
    setIsEditingLeadInfo,
    availableSources,
    availableProjects,
    formData,
    setFormData,
    leadInfoData,
    setLeadInfoData,
    fetchLead,
    fetchMetadata,
    handleSave,
    handleLeadInfoSave,
    handleTemperatureChange,
    handleSubStatusChange,
    handleAvatarUpload
  };
}
