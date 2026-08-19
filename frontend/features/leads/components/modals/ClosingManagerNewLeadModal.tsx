'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

interface ClosingManagerNewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClosingManagerNewLeadModal({ isOpen, onClose, onSuccess }: ClosingManagerNewLeadModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    interestedProjectId: '',
    interestedTowerId: '',
    interestedUnitId: '',
    brokerId: '',
  });

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [towers, setTowers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.interestedProjectId) {
      fetchTowers(formData.interestedProjectId);
      fetchBrokers(formData.interestedProjectId);
    } else {
      setTowers([]);
      setBrokers([]);
      setFormData(prev => ({ ...prev, interestedTowerId: '', interestedUnitId: '', brokerId: '' }));
    }
  }, [formData.interestedProjectId]);

  useEffect(() => {
    if (formData.interestedTowerId) {
      fetchUnits(formData.interestedTowerId);
    } else {
      setUnits([]);
      setFormData(prev => ({ ...prev, interestedUnitId: '' }));
    }
  }, [formData.interestedTowerId]);

  const fetchProjects = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await authClient.$fetch<any[]>(`/api/inventory/projects?isCpProject=true`, { baseURL: apiUrl });
      setProjects(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTowers = async (projectId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await authClient.$fetch<any[]>(`/api/inventory/projects/${projectId}/towers`, { baseURL: apiUrl });
      setTowers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUnits = (towerId: string) => {
    try {
      const tower = towers.find((t: any) => t.id === towerId);
      if (!tower) return;
      const allUnits = tower.floors?.flatMap((f: any) => f.units) || [];
      setUnits(allUnits);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBrokers = async (projectId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      // Fetch brokers assigned to this project
      const res = await authClient.$fetch<any[]>(`/api/brokers?projectId=${projectId}`, { baseURL: apiUrl });
      setBrokers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      await authClient.$fetch(`/api/leads`, {
        baseURL: apiUrl,
        method: 'POST',
        body: formData,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create lead:', error);
      toast.error('Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            New Broker Lead
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="transition-all focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="transition-all focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91..."
                className="transition-all focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="transition-all focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100">
            <Label>Project Interest</Label>
            <select
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={formData.interestedProjectId}
              onChange={e => setFormData({ ...formData, interestedProjectId: e.target.value })}
            >
              <option value="">Select Project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tower</Label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                value={formData.interestedTowerId}
                onChange={e => setFormData({ ...formData, interestedTowerId: e.target.value })}
                disabled={!formData.interestedProjectId}
              >
                <option value="">Select Tower...</option>
                {towers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                value={formData.interestedUnitId}
                onChange={e => setFormData({ ...formData, interestedUnitId: e.target.value })}
                disabled={!formData.interestedTowerId}
              >
                <option value="">Select Unit...</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.unitNumber}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100">
            <Label>Attached Broker</Label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
              value={formData.brokerId}
              onChange={e => setFormData({ ...formData, brokerId: e.target.value })}
              disabled={!formData.interestedProjectId}
              required
            >
              <option value="">Select Broker...</option>
              {brokers.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.brokerCode})</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Only brokers assigned to the selected project are listed.</p>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20">
              {loading ? 'Creating...' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
