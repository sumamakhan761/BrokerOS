import React from 'react';

interface AssignBrokerModalProps {
  assignModalBroker: any;
  sourcingManagers: any[];
  handleAssign: (brokerId: string, smId: string) => void;
  setAssignModalBroker: (broker: any) => void;
}

export function AssignBrokerModal({
  assignModalBroker,
  sourcingManagers,
  handleAssign,
  setAssignModalBroker
}: AssignBrokerModalProps) {
  if (!assignModalBroker) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-xl font-bold mb-4">Assign Sourcing Manager</h2>
        <p className="text-sm text-gray-600 mb-4">
          Assigning broker: <strong>{assignModalBroker.name}</strong>
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {sourcingManagers.map(sm => (
            <button
              key={sm.id}
              onClick={() => handleAssign(assignModalBroker.id, sm.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${assignModalBroker.sourcingManagerId === sm.id
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-gray-200 hover:bg-gray-50'
                }`}
            >
              {sm.name}
            </button>
          ))}
          <button
            onClick={() => handleAssign(assignModalBroker.id, '')}
            className={`w-full text-left px-4 py-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50`}
          >
            Unassign
          </button>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={() => setAssignModalBroker(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
}
