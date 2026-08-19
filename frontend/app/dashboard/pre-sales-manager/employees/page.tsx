"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Employee, ManagerTask, Announcement } from "../_components/types";
import { AnnouncementList } from "../_components/AnnouncementList";
import { TaskList } from "../_components/TaskList";
import { EmployeeGrid } from "../_components/EmployeeGrid";
import { EmployeePageModals } from "../_components/EmployeePageModals";
import { toast } from 'sonner';

export default function PreSalesManagerEmployees() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<ManagerTask[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTarget, setTaskTarget] = useState("100");
  const [taskAssignAll, setTaskAssignAll] = useState(true);
  const [taskSelectedUsers, setTaskSelectedUsers] = useState<string[]>([]);
  const [taskSaving, setTaskSaving] = useState(false);

  // Edit task modal
  const [editTask, setEditTask] = useState<ManagerTask | null>(null);
  const [editTarget, setEditTarget] = useState("");

  // Announcement modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [annTitle, setAnnTitle] = useState("");
  const [annDesc, setAnnDesc] = useState("");
  const [annSaving, setAnnSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const [empRes, taskRes, annRes] = await Promise.all([
        authClient.$fetch<Employee[]>("/api/dashboard/pre-sales-manager/employees", { baseURL: baseUrl }),
        authClient.$fetch<ManagerTask[]>("/api/dashboard/pre-sales-manager/employees/tasks", { baseURL: baseUrl }),
        authClient.$fetch<Announcement[]>("/api/dashboard/pre-sales-manager/employees/announcements", { baseURL: baseUrl }),
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (taskRes.data) setTasks(taskRes.data);
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

  // ── Task Actions ──────────────────────────────────────────────────────────

  // Users without an active task assignment
  const assignedUserIds = new Set(tasks.flatMap((t) => t.assignees.map((a) => a.userId)));
  const availableEmployees = employees.filter((e) => !assignedUserIds.has(e.id));

  async function handleCreateTask() {
    if (!taskTarget || Number(taskTarget) < 1) return;
    setTaskSaving(true);
    try {
      await authClient.$fetch("/api/dashboard/pre-sales-manager/employees/tasks", {
        method: "POST",
        baseURL: baseUrl,
        body: { coldCallTarget: Number(taskTarget), assignToAll: taskAssignAll, userIds: taskAssignAll ? [] : taskSelectedUsers },
      });
      setShowTaskModal(false);
      setTaskTarget("100");
      setTaskAssignAll(true);
      setTaskSelectedUsers([]);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create task");
    } finally {
      setTaskSaving(false);
    }
  }

  async function handleEditTask() {
    if (!editTask) return;
    setTaskSaving(true);
    try {
      await authClient.$fetch(`/api/dashboard/pre-sales-manager/employees/tasks/${editTask.id}`, {
        method: "PATCH",
        baseURL: baseUrl,
        body: { coldCallTarget: Number(editTarget) },
      });
      setEditTask(null);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update task");
    } finally {
      setTaskSaving(false);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Delete this task? Employees will lose their target.")) return;
    await authClient.$fetch(`/api/dashboard/pre-sales-manager/employees/tasks/${taskId}`, { method: "DELETE", baseURL: baseUrl });
    await load();
  }

  // ── Announcement Actions ──────────────────────────────────────────────────

  async function handleSaveAnn() {
    if (!annTitle.trim() || !annDesc.trim()) return;
    setAnnSaving(true);
    try {
      if (editAnn) {
        await authClient.$fetch(`/api/dashboard/pre-sales-manager/employees/announcements/${editAnn.id}`, {
          method: "PATCH", baseURL: baseUrl, body: { title: annTitle, description: annDesc },
        });
      } else {
        await authClient.$fetch("/api/dashboard/pre-sales-manager/employees/announcements", {
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
    await authClient.$fetch(`/api/dashboard/pre-sales-manager/employees/announcements/${id}`, { method: "DELETE", baseURL: baseUrl });
    await load();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12 w-full animate-[fadeUp_0.4s_ease_forwards]">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── Page Title ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Employees</h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5">This month's activity across your team.</p>
        </div>
      </div>

      {/* ── Announcements Section ── */}
      <AnnouncementList
        announcements={announcements}
        onEdit={(ann) => { setEditAnn(ann); setAnnTitle(ann.title); setAnnDesc(ann.description); setShowAnnModal(true); }}
        onDelete={handleDeleteAnn}
        onNew={() => { setEditAnn(null); setAnnTitle(""); setAnnDesc(""); setShowAnnModal(true); }}
      />

      {/* ── Tasks Section ── */}
      <TaskList
        tasks={tasks}
        employees={employees}
        availableEmployees={availableEmployees}
        onEdit={(task) => { setEditTask(task); setEditTarget(String(task.coldCallTarget)); }}
        onDelete={handleDeleteTask}
        onNew={() => setShowTaskModal(true)}
      />

      {/* ── Employee Cards Grid ── */}
      <EmployeeGrid employees={employees} loading={loading} />

      {/* ── Modals ── */}
      <EmployeePageModals
        showTaskModal={showTaskModal}
        setShowTaskModal={setShowTaskModal}
        taskTarget={taskTarget}
        setTaskTarget={setTaskTarget}
        taskAssignAll={taskAssignAll}
        setTaskAssignAll={setTaskAssignAll}
        availableEmployees={availableEmployees}
        taskSelectedUsers={taskSelectedUsers}
        setTaskSelectedUsers={setTaskSelectedUsers}
        handleCreateTask={handleCreateTask}
        taskSaving={taskSaving}

        editTask={editTask}
        setEditTask={setEditTask}
        editTarget={editTarget}
        setEditTarget={setEditTarget}
        handleEditTask={handleEditTask}

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
