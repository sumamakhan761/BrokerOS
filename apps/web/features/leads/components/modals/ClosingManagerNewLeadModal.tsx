"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface ClosingManagerNewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClosingManagerNewLeadModal({
  isOpen,
  onClose,
  onSuccess,
}: ClosingManagerNewLeadModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    interestedProjectId: "",
    interestedTowerId: "",
    interestedUnitId: "",
    brokerId: "",
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
      setFormData((prev) => ({
        ...prev,
        interestedTowerId: "",
        interestedUnitId: "",
        brokerId: "",
      }));
    }
  }, [formData.interestedProjectId]);

  useEffect(() => {
    if (formData.interestedTowerId) {
      fetchUnits(formData.interestedTowerId);
    } else {
      setUnits([]);
      setFormData((prev) => ({ ...prev, interestedUnitId: "" }));
    }
  }, [formData.interestedTowerId]);

  const fetchProjects = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch<any[]>(
        `/api/inventory/projects?isCpProject=true`,
        { baseURL: apiUrl }
      );
      setProjects(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTowers = async (projectId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch<any[]>(
        `/api/inventory/projects/${projectId}/towers`,
        { baseURL: apiUrl }
      );
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch<any[]>(
        `/api/brokers?projectId=${projectId}`,
        { baseURL: apiUrl }
      );
      setBrokers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      await authClient.$fetch(`/api/leads`, {
        baseURL: apiUrl,
        method: "POST",
        body: formData,
      });
      toast.success("Broker lead registered successfully!");
      onSuccess();
    } catch (error) {
      console.error("Failed to create lead:", error);
      toast.error("Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xl space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <UserPlus size={16} />
            </div>
            <DialogTitle className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
              Register Channel Partner Lead
            </DialogTitle>
          </div>
          <p className="text-xs text-[var(--text-muted)] m-0">
            Link a buyer lead directly to a registered CP Broker and designated project inventory.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                First Name
              </Label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="e.g. Rahul"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Last Name
              </Label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="e.g. Sharma"
              />
            </div>
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Phone Number
              </Label>
              <Input
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Email Address
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="rahul@example.com"
              />
            </div>
          </div>

          {/* Project Selection */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <Label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              CP Project Assignment
            </Label>
            <select
              required
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
              value={formData.interestedProjectId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interestedProjectId: e.target.value,
                })
              }
            >
              <option value="">Select CP Project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tower & Unit Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Tower
              </Label>
              <select
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 disabled:opacity-40 cursor-pointer transition-all"
                value={formData.interestedTowerId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interestedTowerId: e.target.value,
                  })
                }
                disabled={!formData.interestedProjectId}
              >
                <option value="">Select Tower…</option>
                {towers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Unit
              </Label>
              <select
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 disabled:opacity-40 cursor-pointer transition-all"
                value={formData.interestedUnitId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interestedUnitId: e.target.value,
                  })
                }
                disabled={!formData.interestedTowerId}
              >
                <option value="">Select Unit…</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Broker Selection */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <Label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              Attached CP Broker
            </Label>
            <select
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 disabled:opacity-40 cursor-pointer transition-all"
              value={formData.brokerId}
              onChange={(e) =>
                setFormData({ ...formData, brokerId: e.target.value })
              }
              disabled={!formData.interestedProjectId}
              required
            >
              <option value="">Select Broker…</option>
              {brokers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.brokerCode})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant="luxury">
              {loading ? "Creating Record…" : "Register Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
