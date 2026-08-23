import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Briefcase, Plus, FileText, Check, Lock, Unlock, Upload, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { usePathname } from 'next/navigation';

interface BrokerDealCardProps {
  brokerId: string;
  broker: any;
  onRefresh: () => void;
}

export function BrokerDealCard({ brokerId, broker, onRefresh }: BrokerDealCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    projectId: '',
    towerId: '',
    brokeragePercent: '',
    brokerageFlat: '',
    isLocked: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const pathname = usePathname() || '';
  const isCP = pathname.includes('/channel-partner');

  useEffect(() => {
    // Load projects for the dropdown
    const loadProjects = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
        const res = await fetch(`${baseUrl}/api/inventory/projects?isCpProject=true`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (e) {
        console.error('Failed to load projects', e);
      }
    };
    loadProjects();
  }, []);

  const handleSave = async () => {
    if (!formData.projectId) {
      setError('Please select a project');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers/${brokerId}/deal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsAdding(false);
        setFormData({ projectId: '', towerId: '', brokeragePercent: '', brokerageFlat: '', isLocked: false });
        onRefresh();
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to save deal');
      }
    } catch (e) {
      setError('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const assignments = broker?.projectAssignments || [];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          Deal Cards & Assignments
        </h3>
        {broker.status === 'DEAL' && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {broker.status !== 'DEAL' && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4">
          To add or update a Deal Card, the broker's status must be set to <strong>DEAL</strong>.
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
          {error}
        </div>
      )}

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-4 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-sm font-semibold text-gray-700">Add/Update Project Deal</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tower (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Tower A"
                value={formData.towerId}
                onChange={(e) => setFormData({ ...formData, towerId: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Brokerage (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 2.5"
                value={formData.brokeragePercent}
                onChange={(e) => setFormData({ ...formData, brokeragePercent: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Brokerage (Flat Amount)</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={formData.brokerageFlat}
                onChange={(e) => setFormData({ ...formData, brokerageFlat: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          {isCP && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isLocked"
                checked={formData.isLocked}
                onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isLocked" className="text-sm font-medium text-gray-700">Lock this deal card (Only CP can edit)</label>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Deal'}
            </button>
          </div>
        </div>
      )}

      {assignments.length === 0 ? (
        !isAdding && (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No deal cards found.</p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment: any) => (
            <div key={assignment.id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {assignment.project?.name || 'Unknown Project'}
                  </h4>
                  {assignment.towerId && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md mt-1 inline-block">
                      Tower: {assignment.towerId}
                    </span>
                  )}
                </div>
                {assignment.isLocked ? (
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" /> Locked
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Unlock className="w-3 h-3" /> Open
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
                <div>
                  <div className="text-xs text-gray-500">Brokerage Percentage</div>
                  <div className="font-semibold text-gray-900">
                    {assignment.brokeragePercent ? `${assignment.brokeragePercent}%` : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Flat Brokerage Amount</div>
                  <div className="font-semibold text-gray-900">
                    {assignment.brokerageFlat ? `₹${assignment.brokerageFlat.toLocaleString()}` : '-'}
                  </div>
                </div>
              </div>

              {(!assignment.isLocked || isCP) && broker.status === 'DEAL' && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setFormData({
                        projectId: assignment.projectId,
                        towerId: assignment.towerId || '',
                        brokeragePercent: assignment.brokeragePercent?.toString() || '',
                        brokerageFlat: assignment.brokerageFlat?.toString() || '',
                        isLocked: assignment.isLocked
                      });
                      setIsAdding(true);
                    }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Deal Card
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}


