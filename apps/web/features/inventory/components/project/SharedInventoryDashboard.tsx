"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building, MapPin, Grid, Plus } from "lucide-react";
import Link from "next/link";
import PossessionModal, { ConstructionStatus } from "@/features/inventory/components/modals/PossessionModal";
import NewProjectModal from "@/features/inventory/components/modals/NewProjectModal";
import AssignmentModal from "@/features/inventory/components/modals/AssignmentModal";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface SharedInventoryDashboardProps {
  roleCode: string;
  title: string;
  subtitle: string;
  linkPrefix: string;
  canCreateProject: boolean;
  canSetPossession: boolean;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
  apiEndpoint?: string;
}

export function SharedInventoryDashboard({
  roleCode,
  title,
  subtitle,
  linkPrefix,
  canCreateProject,
  canSetPossession,
  emptyStateTitle,
  emptyStateSubtitle,
  apiEndpoint = "/api/inventory/projects",
}: SharedInventoryDashboardProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const [possessionModal, setPossessionModal] = useState<{
    isOpen: boolean;
    projectId: string;
    projectName: string;
    initialStatus?: ConstructionStatus;
    initialTimeline?: { value: number; unit: 'MONTHS' | 'YEARS' };
  }>({ isOpen: false, projectId: '', projectName: '' });

  const [assignmentModal, setAssignmentModal] = useState<{
    isOpen: boolean;
    projectId: string;
    projectName: string;
  }>({ isOpen: false, projectId: '', projectName: '' });

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
      return;
    }
    if (isAuthorized) return;

    const user = session?.user as any;
    if (user?.roleId) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      fetch(`${baseUrl}/roles`)
        .then(res => res.json())
        .then(roles => {
          const role = roles.find((r: any) => r.id === user.roleId);
          if (role && role.code === roleCode) {
            setIsAuthorized(true);
            loadProjects(baseUrl);
          } else {
            router.replace("/dashboard");
          }
        })
        .catch(console.error);
    }
  }, [session, isPending, router, isAuthorized, roleCode]);

  const loadProjects = async (baseUrl: string) => {
    try {
      setLoading(true);
      const res = await fetch(baseUrl + apiEndpoint);
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <div className="p-8">Verifying access...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 mt-1">{subtitle}</p>
        </div>
        {canCreateProject && (
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm w-full md:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link
              key={project.id}
              href={`${linkPrefix}/${project.id}`}
              className="group block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Building className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                    Active
                  </span>
                  {canSetPossession && (
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button
                        onClick={(e: any) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-slate-100 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e: any) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPossessionModal({
                                      isOpen: true,
                                      projectId: project.id,
                                      projectName: project.name,
                                      initialStatus: project.constructionStatus,
                                      initialTimeline: project.possessionTimeline
                                    });
                                  }}
                                  className={`${
                                    active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
                                  } group flex w-full items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors`}
                                >
                                  Set Possession Timeline
                                </button>
                              )}
                            </Menu.Item>
                            {['CHANNEL_PARTNER', 'SALES_MANAGER'].includes(roleCode) && (
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={(e: any) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setAssignmentModal({
                                        isOpen: true,
                                        projectId: project.id,
                                        projectName: project.name
                                      });
                                    }}
                                    className={`${
                                      active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
                                    } group flex w-full items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors mt-1`}
                                  >
                                    Assign Project
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1">{project.name}</h3>
              {project.builder && (
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{project.builder.name}</span>
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <Grid className="w-4 h-4 text-slate-400" />
                  <span>{project._count?.towers || 0} Towers</span>
                </div>
                <div className="text-indigo-600 group-hover:underline">
                  View Grid &rarr;
                </div>
              </div>
            </Link>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">{emptyStateTitle}</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">{emptyStateSubtitle}</p>
            </div>
          )}
        </div>
      )}

      {canSetPossession && (
        <PossessionModal
          isOpen={possessionModal.isOpen}
          onClose={() => setPossessionModal(prev => ({ ...prev, isOpen: false }))}
          entityId={possessionModal.projectId}
          entityType="project"
          entityName={possessionModal.projectName}
          initialStatus={possessionModal.initialStatus}
          initialTimeline={possessionModal.initialTimeline}
          onSuccess={() => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
            loadProjects(baseUrl);
          }}
        />
      )}

      {assignmentModal.isOpen && (
        <AssignmentModal
          isOpen={assignmentModal.isOpen}
          onClose={() => setAssignmentModal(prev => ({ ...prev, isOpen: false }))}
          entityId={assignmentModal.projectId}
          entityType="project"
          entityName={assignmentModal.projectName}
          onSuccess={() => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
            loadProjects(baseUrl);
          }}
        />
      )}

      {canCreateProject && (
        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          isCpProject={apiEndpoint.includes("isCpProject=true")}
          onSuccess={() => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
            loadProjects(baseUrl);
          }}
        />
      )}
    </div>
  );
}
