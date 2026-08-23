import React from 'react';

interface AddBrokerModalProps {
  isCP: boolean;
  form: any;
  setForm: (form: any) => void;
  saving: boolean;
  projects: any[];
  sourcingManagers: any[];
  handleCreate: (e: React.FormEvent) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

export function AddBrokerModal({
  isCP,
  form,
  setForm,
  saving,
  projects,
  sourcingManagers,
  handleCreate,
  setIsModalOpen
}: AddBrokerModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Broker</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input required type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name *</label>
              <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border p-2 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input required type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City / Location *</label>
              <input required type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border p-2 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RERA Number</label>
              <input type="text" value={form.reraNumber} onChange={e => setForm({ ...form, reraNumber: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input type="text" value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Areas</label>
            <input type="text" value={form.serviceAreas} onChange={e => setForm({ ...form, serviceAreas: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="e.g. Area 1, Area 2 (comma separated)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Projects</label>
            <div className="border rounded-lg p-2 max-h-32 overflow-y-auto bg-gray-50">
              {projects.length === 0 ? (
                <div className="text-sm text-gray-500 italic p-2">No projects found.</div>
              ) : (
                projects.map(p => (
                  <label key={p.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded">
                    <input
                      type="checkbox"
                      checked={form.assignedProjects.includes(p.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setForm({ ...form, assignedProjects: [...form.assignedProjects, p.id] });
                        } else {
                          setForm({ ...form, assignedProjects: form.assignedProjects.filter((id: string) => id !== p.id) });
                        }
                      }}
                    />
                    <span className="text-sm">{p.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {isCP && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Sourcing Manager</label>
              <select
                value={form.sourcingManagerId}
                onChange={e => setForm({ ...form, sourcingManagerId: e.target.value })}
                className="w-full border p-2 rounded-lg"
              >
                <option value="">-- Unassigned --</option>
                {sourcingManagers.map(sm => (
                  <option key={sm.id} value={sm.id}>{sm.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Broker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
