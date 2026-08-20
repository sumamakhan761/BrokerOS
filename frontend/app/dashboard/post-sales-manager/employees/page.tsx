"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Announcement } from "../../pre-sales-manager/_components/types";
import { AnnouncementList } from "../../pre-sales-manager/_components/AnnouncementList";
import { PostSalesEmployeeGrid, PostSalesEmployee } from "./_components/PostSalesEmployeeGrid";
import { EmployeePageModals } from "../../pre-sales-manager/_components/EmployeePageModals";
import { toast } from 'sonner';

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
        authClient.$fetch<PostSalesEmployee[]>("/api/dashboard/post-sales-manager/employees", { baseURL: baseUrl }),
        authClient.$fetch<Announcement[]>("/api/dashboard/post-sales-manager/employees/announcements", { baseURL: baseUrl }),
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (annRes.data) setAnnouncements(annRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Poll every 15 seconds so on-call status updates automatically
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, []);

  // ── Announcement Actions ──────────────────────────────────────────────────

  async function handleSaveAnn() {
    if (!annTitle.trim() || !annDesc.trim()) return;
    setAnnSaving(true);
    try {
      if (editAnn) {
        await authClient.$fetch(`/api/dashboard/post-sales-manager/employees/announcements/${editAnn.id}`, {
          method: "PATCH", baseURL: baseUrl, body: { title: annTitle, description: annDesc },
        });
      } else {
        await authClient.$fetch("/api/dashboard/post-sales-manager/employees/announcements", {
          method: "POST", baseURL: baseUrl, body: { title: annTitle, description: annDesc },
        });
      }
      setShowAnnModal(false);
      setEditAnn(null);
      setAnnTitle("");
      setAnnDesc("");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save announcement");
    } finally {
      setAnnSaving(false);
    }
  }

  async function handleDeleteAnn(id: string) {
    if (!confirm("Delete this announcement? It disappears immediately for all employees.")) return;
    await authClient.$fetch(`/api/dashboard/post-sales-manager/employees/announcements/${id}`, { method: "DELETE", baseURL: baseUrl });
    await load();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: "0 0 48px", display: "flex", flexDirection: "column", gap: 32 }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .emp-card { animation: fadeUp 0.3s ease forwards; border: 1px solid #f1f5f9; borderRadius: 20px; }
        .emp-card:hover { box-shadow: 0 12px 32px rgba(99,102,241,0.1); transform: translateY(-2px); transition: all 0.2s; }
        .section-label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
      `}</style>

      {/* ── Page Title ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Employees</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>This month's activity across your team.</p>
        </div>
      </div>

      {/* ── Announcements Section ── */}
      <AnnouncementList
        announcements={announcements}
        onEdit={(ann) => { setEditAnn(ann); setAnnTitle(ann.title); setAnnDesc(ann.description); setShowAnnModal(true); }}
        onDelete={handleDeleteAnn}
        onNew={() => { setEditAnn(null); setAnnTitle(""); setAnnDesc(""); setShowAnnModal(true); }}
      />

      {/* ── Employee Cards Grid ── */}
      <PostSalesEmployeeGrid employees={employees} loading={loading} />

      {/* ── Modals ── */}
      <EmployeePageModals
        // Task logic is removed for Post Sales Manager
        showTaskModal={false}
        setShowTaskModal={() => { }}
        taskTarget={"0"}
        setTaskTarget={() => { }}
        taskAssignAll={true}
        setTaskAssignAll={() => { }}
        availableEmployees={[]}
        taskSelectedUsers={[]}
        setTaskSelectedUsers={() => { }}
        handleCreateTask={async () => { }}
        taskSaving={false}
        editTask={null}
        setEditTask={() => { }}
        editTarget={""}
        setEditTarget={() => { }}
        handleEditTask={async () => { }}

        // Announcements
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
