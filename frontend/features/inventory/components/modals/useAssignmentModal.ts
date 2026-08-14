import { useState, useEffect } from "react";

export interface Subordinate {
  id: string;
  name: string;
  email: string;
  role: { code: string; name: string };
}

interface UseAssignmentModalProps {
  isOpen: boolean;
  entityId: string;
  entityType: "project" | "tower";
  onSuccess?: () => void;
  onClose: () => void;
}

export function useAssignmentModal({
  isOpen,
  entityId,
  entityType,
  onSuccess,
  onClose
}: UseAssignmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [sourcingManagers, setSourcingManagers] = useState<Subordinate[]>([]);
  const [closingManagers, setClosingManagers] = useState<Subordinate[]>([]);
  const [salesExecutives, setSalesExecutives] = useState<Subordinate[]>([]);
  
  const [selectedSMIds, setSelectedSMIds] = useState<string[]>([]);
  const [selectedCMIds, setSelectedCMIds] = useState<string[]>([]);
  const [selectedSEIds, setSelectedSEIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, entityId, entityType]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      
      // Fetch all subordinates
      const subRes = await fetch(`${baseUrl}/api/users/subordinates`);
      let allSubordinates: Subordinate[] = [];
      if (subRes.ok) {
        allSubordinates = await subRes.json();
        setSourcingManagers(allSubordinates.filter(s => s.role.code === "SOURCING_MANAGER"));
        setClosingManagers(allSubordinates.filter(s => s.role.code === "CLOSING_MANAGER"));
        setSalesExecutives(allSubordinates.filter(s => s.role.code === "SALES_EXECUTIVE"));
      }

      // Fetch existing assignments
      let assignmentsUrl = "";
      if (entityType === "project") {
        assignmentsUrl = `${baseUrl}/api/inventory/projects/${entityId}/assignments`;
      } else {
        assignmentsUrl = `${baseUrl}/api/inventory/projects/towers/${entityId}/assignments`;
      }

      const assignRes = await fetch(assignmentsUrl);
      if (assignRes.ok) {
        const assignments = await assignRes.json();
        const smIds: string[] = [];
        const cmIds: string[] = [];
        const seIds: string[] = [];
        
        assignments.forEach((a: any) => {
          if (a.role === "SOURCING_MANAGER") smIds.push(a.userId);
          if (a.role === "CLOSING_MANAGER") cmIds.push(a.userId);
          if (a.role === "SALES_EXECUTIVE") seIds.push(a.userId);
        });
        
        setSelectedSMIds(smIds);
        setSelectedCMIds(cmIds);
        setSelectedSEIds(seIds);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const toggleSM = (id: string) => {
    setSelectedSMIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleCM = (id: string) => {
    setSelectedCMIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSE = (id: string) => {
    setSelectedSEIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAssign = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      
      let url = "";
      if (entityType === "project") {
        url = `${baseUrl}/api/inventory/projects/${entityId}/assign`;
      } else {
        url = `${baseUrl}/api/inventory/projects/towers/${entityId}/assign`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          sourcingManagerIds: selectedSMIds,
          closingManagerIds: selectedCMIds,
          salesExecIds: selectedSEIds
        }),
      });

      if (res.ok) {
        onSuccess?.();
        onClose();
      } else {
        alert("Failed to assign");
      }
    } catch (e) {
      console.error(e);
      alert("Error assigning");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetching,
    sourcingManagers,
    closingManagers,
    salesExecutives,
    selectedSMIds,
    selectedCMIds,
    selectedSEIds,
    toggleSM,
    toggleCM,
    toggleSE,
    handleAssign
  };
}
