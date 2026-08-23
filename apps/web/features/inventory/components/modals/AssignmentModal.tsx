"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
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
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-600" />
                    Assign {entityType === "project" ? "Project" : "Tower"}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-slate-600 mb-6">
                    Assign multiple managers to <strong>{entityName}</strong>. 
                    They will immediately gain access to this {entityType}.
                  </p>

                  {fetching ? (
                    <div className="flex justify-center p-12">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                  ) : (
                      <div className={`grid grid-cols-1 ${(sourcingManagers.length > 0 || closingManagers.length > 0) ? (salesExecutives.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2') : 'md:grid-cols-1'} gap-6`}>
                        
                        {/* Sourcing Managers */}
                        {(sourcingManagers.length > 0 || closingManagers.length > 0) && (
                          <AssignmentRoleList
                            title="Sourcing Managers"
                            subordinates={sourcingManagers}
                            selectedIds={selectedSMIds}
                            onToggle={toggleSM}
                            colorScheme="indigo"
                          />
                        )}

                        {/* Closing Managers */}
                        {(sourcingManagers.length > 0 || closingManagers.length > 0) && (
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

                <div className="flex gap-3 justify-end mt-8 border-t border-slate-100 pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={loading || fetching}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2 shadow-sm shadow-indigo-600/20"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Assignments
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
