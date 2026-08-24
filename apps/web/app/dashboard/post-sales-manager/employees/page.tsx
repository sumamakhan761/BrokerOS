"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Announcement } from "../../pre-sales-manager/_components/types";
import { AnnouncementList } from "../../pre-sales-manager/_components/AnnouncementList";
import {
  PostSalesEmployeeGrid,
  PostSalesEmployee,
} from "./_components/PostSalesEmployeeGrid";
import { EmployeePageModals } from "../../pre-sales-manager/_components/EmployeePageModals";
import { toast } from "sonner";
import { Users } from "lucide-react";

export default function PostSalesManagerEmployees() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const [employees, setEmployees] = useState<PostSalesEmployee[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Announcement modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [annTitle, setAnnTitle] = useState("");
  const [annDesc, setAnnDesc] = useState("");
  const [annSaving, setAnnSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const [empRes, annRes] = await Promise.all([
        authClient.$fetch<PostSalesEmployee[]>(
          "/api/dashboard/post-sales-manager/employees",
          { baseURL: baseUrl }
        ),
        authClient.$fetch<Announcement[]>(
          "/api/dashboard/post-sales-manager/employees/announcements",
          { baseURL: baseUrl }
        ),
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (annRes.data) setAnnouncements(annRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, []);

  // ── Announcement Actions ──────────────────────────────────────────────────

  async function handleSaveAnn() {
    if (!annTitle.trim() || !annDesc.trim()) return;
    setAnnSaving(true);
    try {
      if (editAnn) {
        await authClient.$fetch(
          `/api/dashboard/post-sales-manager/employees/announcements/${editAnn.id}`,
          {
            method: "PATCH",
            baseURL: baseUrl,
            body: { title: annTitle, description: annDesc },
          }
        );
      } else {
        await authClient.$fetch(
          "/api/dashboard/post-sales-manager/employees/announcements",
          {
            method: "POST",
            baseURL: baseUrl,
            body: { title: annTitle, description: annDesc },
          }
        );
      }
      setShowAnnModal(false);
      setEditAnn(null);
      setAnnTitle("");
      setAnnDesc("");
      await load();
      toast.success("Broadcast announcement posted");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save announcement");
    } finally {
      setAnnSaving(false);
    }
  }

  async function handleDeleteAnn(id: string) {
    if (
      !confirm(
        "Delete this announcement? It disappears immediately for all employees."
      )
    )
      return;
    await authClient.$fetch(
      `/api/dashboard/post-sales-manager/employees/announcements/${id}`,
      { method: "DELETE", baseURL: baseUrl }
    );
    await load();
    toast.success("Announcement deleted");
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-enter">
      {/* Page Title */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Users size={18} />
            </div>
            <span>Post-Sales Executives & Team Feed</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Monitor post-sales agent workloads, document processing & key handover milestones
          </p>
        </div>
      </div>

      {/* Announcements Section */}
      <AnnouncementList
        announcements={announcements}
        onEdit={(ann) => {
          setEditAnn(ann);
          setAnnTitle(ann.title);
          setAnnDesc(ann.description);
          setShowAnnModal(true);
        }}
        onDelete={handleDeleteAnn}
        onNew={() => {
          setEditAnn(null);
          setAnnTitle("");
          setAnnDesc("");
          setShowAnnModal(true);
        }}
      />

      {/* Employee Cards Grid */}
      <PostSalesEmployeeGrid employees={employees} loading={loading} />

      {/* Modals */}
      <EmployeePageModals
        showTaskModal={false}
        setShowTaskModal={() => {}}
        taskTarget={"0"}
        setTaskTarget={() => {}}
        taskAssignAll={true}
        setTaskAssignAll={() => {}}
        availableEmployees={[]}
        taskSelectedUsers={[]}
        setTaskSelectedUsers={() => {}}
        handleCreateTask={async () => {}}
        taskSaving={false}
        editTask={null}
        setEditTask={() => {}}
        editTarget={""}
        setEditTarget={() => {}}
        handleEditTask={async () => {}}
        showAnnModal={showAnnModal}
        setShowAnnModal={setShowAnnModal}
        editAnn={editAnn}
        setEditAnn={setEditAnn}
        annTitle={annTitle}
        setAnnTitle={setAnnTitle}
        annDesc={annDesc}
        setAnnDesc={setAnnDesc}
        handleSaveAnn={handleSaveAnn}
        annSaving={annSaving}
      />
    </div>
  );
}
