"use client";

import { authClient } from "@/lib/auth-client";
import React, { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Building, MapPin, Grid, Plus, MoreVertical, Calendar, UserPlus } from "lucide-react";
import Link from "next/link";
import PossessionModal, {
  ConstructionStatus,
} from "@/features/inventory/components/modals/PossessionModal";
import NewProjectModal from "@/features/inventory/components/modals/NewProjectModal";
import AssignmentModal from "@/features/inventory/components/modals/AssignmentModal";
import { Menu, Transition } from "@headlessui/react";

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
    initialTimeline?: { value: number; unit: "MONTHS" | "YEARS" };
  }>({ isOpen: false, projectId: "", projectName: "" });

  const [assignmentModal, setAssignmentModal] = useState<{
    isOpen: boolean;
    projectId: string;
    projectName: string;
  }>({ isOpen: false, projectId: "", projectName: "" });

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
        .then((res) => res.json())
        .then((roles) => {
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-[var(--brand-600)] animate-spin" />
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            Loading project inventory…
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <div className="p-8 text-xs font-bold text-slate-500">Verifying access…</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen space-y-6 animate-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight m-0">
            {title}
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            {subtitle}
          </p>
        </div>
        {canCreateProject && (
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-xl text-xs font-bold transition-all active:scale-[0.96] press-effect shadow-xs w-full md:w-auto justify-center cursor-pointer"
          >
            <Plus size={14} />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {error ? (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-semibold">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`${linkPrefix}/${project.id}`}
              className="group block bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-200 transform hover:-translate-y-0.5 no-underline shadow-2xs relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-200 text-[var(--brand-700)] group-hover:bg-[var(--brand-600)] group-hover:text-white transition-colors">
                  <Building size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-emerald-200">
                    Active
                  </span>

                  {canSetPossession && (
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button
                        onClick={(e: any) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[var(--brand-700)] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <MoreVertical size={14} />
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
                        <Menu.Items className="absolute right-0 mt-1 w-52 origin-top-right divide-y divide-slate-100 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none z-50 p-1 border border-slate-200/80">
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
                                    initialTimeline: project.possessionTimeline,
                                  });
                                }}
                                className={`${
                                  active
                                    ? "bg-purple-50 text-[var(--brand-700)]"
                                    : "text-[var(--text-primary)]"
                                } flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer`}
                              >
                                <Calendar size={13} />
                                <span>Set Possession Timeline</span>
                              </button>
                            )}
                          </Menu.Item>
                          {["CHANNEL_PARTNER", "SALES_MANAGER"].includes(
                            roleCode
                          ) && (
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e: any) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setAssignmentModal({
                                      isOpen: true,
                                      projectId: project.id,
                                      projectName: project.name,
                                    });
                                  }}
                                  className={`${
                                    active
                                      ? "bg-purple-50 text-[var(--brand-700)]"
                                      : "text-[var(--text-primary)]"
                                  } flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer mt-0.5`}
                                >
                                  <UserPlus size={13} />
                                  <span>Assign Project Team</span>
                                </button>
                              )}
                            </Menu.Item>
                          )}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </div>
              </div>

              <h3 className="text-base font-extrabold text-[var(--text-primary)] group-hover:text-[var(--brand-700)] transition-colors m-0">
                {project.name}
              </h3>
              {project.builder && (
                <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs mt-1 mb-4 font-medium">
                  <MapPin size={12} className="text-slate-400" />
                  <span>{project.builder.name}</span>
                </div>
              )}

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
                <div className="flex items-center gap-1.5">
                  <Grid size={13} className="text-slate-400" />
                  <span className="tabular-nums">
                    {project._count?.towers || 0} Towers
                  </span>
                </div>
                <div className="text-[var(--brand-700)] group-hover:underline flex items-center gap-1 font-bold">
                  <span>View Grid</span> &rarr;
                </div>
              </div>
            </Link>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[var(--text-primary)] m-0">
                {emptyStateTitle}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto font-medium">
                {emptyStateSubtitle}
              </p>
            </div>
          )}
        </div>
      )}

      {canSetPossession && (
        <PossessionModal
          isOpen={possessionModal.isOpen}
          onClose={() =>
            setPossessionModal((prev) => ({ ...prev, isOpen: false }))
          }
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
          onClose={() =>
            setAssignmentModal((prev) => ({ ...prev, isOpen: false }))
          }
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
