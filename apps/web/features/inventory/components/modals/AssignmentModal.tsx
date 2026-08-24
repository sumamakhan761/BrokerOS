"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { useAssignmentModal } from "./useAssignmentModal";
import { AssignmentRoleList } from "./AssignmentRoleList";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: "project" | "tower";
  entityName: string;
  onSuccess?: () => void;
}

export default function AssignmentModal({
  isOpen,
  onClose,
  entityId,
  entityType,
  entityName,
  onSuccess,
}: AssignmentModalProps) {
  const {
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
    handleAssign,
  } = useAssignmentModal({ isOpen, entityId, entityType, onSuccess, onClose });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-slate-200/80 space-y-5">
                {/* Header */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <Dialog.Title
                    as="h3"
                    className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2.5 tracking-tight m-0"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
                      <UserPlus size={16} />
                    </div>
                    <span>
                      Assign {entityType === "project" ? "Project" : "Tower"} Team
                    </span>
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed m-0">
                    Assign responsible managers and sales executives to{" "}
                    <strong className="text-[var(--text-primary)]">
                      {entityName}
                    </strong>
                    . Assigned users will immediately gain operational scoping access.
                  </p>

                  {fetching ? (
                    <div className="flex justify-center p-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-600)]" />
                    </div>
                  ) : (
                    <div
                      className={`grid grid-cols-1 ${
                        sourcingManagers.length > 0 || closingManagers.length > 0
                          ? salesExecutives.length > 0
                            ? "md:grid-cols-3"
                            : "md:grid-cols-2"
                          : "md:grid-cols-1"
                      } gap-4`}
                    >
                      {/* Sourcing Managers */}
                      {(sourcingManagers.length > 0 ||
                        closingManagers.length > 0) && (
                        <AssignmentRoleList
                          title="Sourcing Managers"
                          subordinates={sourcingManagers}
                          selectedIds={selectedSMIds}
                          onToggle={toggleSM}
                          colorScheme="indigo"
                        />
                      )}

                      {/* Closing Managers */}
                      {(sourcingManagers.length > 0 ||
                        closingManagers.length > 0) && (
                        <AssignmentRoleList
                          title="Closing Managers"
                          subordinates={closingManagers}
                          selectedIds={selectedCMIds}
                          onToggle={toggleCM}
                          colorScheme="emerald"
                        />
                      )}

                      {/* Sales Executives */}
                      {salesExecutives.length > 0 && (
                        <AssignmentRoleList
                          title="Sales Executives"
                          subordinates={salesExecutives}
                          selectedIds={selectedSEIds}
                          onToggle={toggleSE}
                          colorScheme="blue"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={loading || fetching}
                    className="px-5 py-2 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all active:scale-[0.96] press-effect shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Scoping Assignments</span>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
