'use client';

import React from 'react';
import { Plus, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useBrokerTable } from './useBrokerTable';
import { BrokerTable } from './BrokerTable';
import { AddBrokerModal } from './AddBrokerModal';
import { AssignBrokerModal } from './AssignBrokerModal';

export function BrokerTableClient() {
  const searchParams = useSearchParams();
  const initialFollowUpDate = searchParams.get('followUpDate') || '';
  const isCP = typeof window !== 'undefined' && window.location.pathname.includes('/channel-partner');
  const isCM = typeof window !== 'undefined' && window.location.pathname.includes('/closing-manager');

  const {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isModalOpen,
    setIsModalOpen,
    form,
    setForm,
    saving,
    assignModalBroker,
    setAssignModalBroker,
    sourcingManagers,
    projects,
    handleCreate,
    handleAssign,
    filteredBrokers,
    followUpDate,
    setFollowUpDate
  } = useBrokerTable(isCP);

  React.useEffect(() => {
    if (initialFollowUpDate) {
      setFollowUpDate(initialFollowUpDate);
    }
  }, [initialFollowUpDate, setFollowUpDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broker Management</h1>
          <p className="text-gray-500">Manage your channel partners and brokerage deals</p>
        </div>
        {!isCM && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Broker
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search brokers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="VISIT">Visit</option>
          <option value="DEAL">Deal</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <BrokerTable
          loading={loading}
          filteredBrokers={filteredBrokers}
          isCP={isCP}
          setAssignModalBroker={setAssignModalBroker}
        />
      </div>

      {isModalOpen && (
        <AddBrokerModal
          isCP={isCP}
          form={form}
          setForm={setForm}
          saving={saving}
          projects={projects}
          sourcingManagers={sourcingManagers}
          handleCreate={handleCreate}
          setIsModalOpen={setIsModalOpen}
        />
      )}

      {assignModalBroker && (
        <AssignBrokerModal
          assignModalBroker={assignModalBroker}
          sourcingManagers={sourcingManagers}
          handleAssign={handleAssign}
          setAssignModalBroker={setAssignModalBroker}
        />
      )}

    </div>
  );
}
