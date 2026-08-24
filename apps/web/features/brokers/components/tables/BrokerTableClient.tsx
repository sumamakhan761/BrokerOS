"use client";

import React, { useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useBrokerTable } from "@/features/brokers/components/tables/useBrokerTable";
import { BrokerTable } from "@/features/brokers/components/tables/BrokerTable";
import { AddBrokerModal } from "@/features/brokers/components/tables/AddBrokerModal";
import { AssignBrokerModal } from "@/features/brokers/components/tables/AssignBrokerModal";

export function BrokerTableClient() {
  const searchParams = useSearchParams();
  const initialFollowUpDate = searchParams.get("followUpDate") || "";
  const isCP =
    typeof window !== "undefined" &&
    window.location.pathname.includes("/channel-partner");
  const isCM =
    typeof window !== "undefined" &&
    window.location.pathname.includes("/closing-manager");

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
    setFollowUpDate,
  } = useBrokerTable(isCP);

  useEffect(() => {
    if (initialFollowUpDate) {
      setFollowUpDate(initialFollowUpDate);
    }
  }, [initialFollowUpDate, setFollowUpDate]);

  return (
    <div className="space-y-5 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight m-0">
            Broker Network & Partners
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Manage channel partners, sourcing managers, and CP deal card allocations
          </p>
        </div>

        {!isCM && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.96] press-effect shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Add New Broker</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search brokers by agency, contact name, city, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all cursor-pointer w-full sm:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="VISIT">Visit Scheduled</option>
          <option value="DEAL">Deal Active</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
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
