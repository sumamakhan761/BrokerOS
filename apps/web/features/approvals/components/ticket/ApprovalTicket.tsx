"use client";

import React, { useState } from "react";
import { ApprovalTicketHeader } from "@/features/approvals/components/ticket/ApprovalTicketHeader";
import { ApprovalTicketMessages } from "@/features/approvals/components/ticket/ApprovalTicketMessages";
import { ApprovalTicketReplyForm } from "@/features/approvals/components/ticket/ApprovalTicketReplyForm";
import { toast } from "sonner";

export default function ApprovalTicket({
  ticket,
  role,
  onBack,
  onUpdate,
}: {
  ticket: any;
  role: string;
  onBack: () => void;
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [replyDesc, setReplyDesc] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);

  const handleReply = async () => {
    if (!replyDesc.trim() && !replyFile) {
      toast.error("Message or file is required.");
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

      let uploadedUrl = "";
      if (replyFile) {
        const formData = new FormData();
        formData.append("file", replyFile);

        const uploadRes = await fetch(`${apiUrl}/api/approvals/upload`, {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedUrl = uploadData.url || "";
        } else {
          toast.error("Failed to upload file");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`${apiUrl}/api/approvals/${ticket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Message",
          description: replyDesc,
          fileUrl: uploadedUrl,
          action: "REPLY",
        }),
      });

      if (!res.ok) {
        toast.error("Failed to submit message");
        setLoading(false);
        return;
      }

      toast.success("Message sent!");
      setReplyDesc("");
      setReplyFile(null);
      onUpdate();
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${apiUrl}/api/approvals/${ticket.id}/close`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.success("Ticket closed");
        onUpdate();
      } else {
        toast.error("Failed to close ticket");
      }
    } catch {
      toast.error("Error closing ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantAction = async (action: "APPROVE" | "REJECT") => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${apiUrl}/api/approvals/${ticket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: action === "APPROVE" ? "Approval" : "Rejection",
          description:
            action === "APPROVE" ? "Request Approved." : "Request Rejected.",
          action,
        }),
      });

      if (!res.ok) {
        toast.error(`Failed to ${action.toLowerCase()} request`);
        setLoading(false);
        return;
      }

      toast.success(
        action === "APPROVE" ? "Request Approved!" : "Request Rejected!"
      );
      onUpdate();
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRedo = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${apiUrl}/api/approvals/${ticket.id}/redo`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Action Undone");
        onUpdate();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to redo decision");
      }
    } catch {
      toast.error("Error undoing action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 h-full flex flex-col transition-all overflow-hidden">
      <ApprovalTicketHeader
        ticket={ticket}
        role={role}
        onBack={onBack}
        handleCloseTicket={handleCloseTicket}
        loading={loading}
      />

      <ApprovalTicketMessages ticket={ticket} role={role} />

      <ApprovalTicketReplyForm
        ticket={ticket}
        role={role}
        replyDesc={replyDesc}
        setReplyDesc={setReplyDesc}
        replyFile={replyFile}
        setReplyFile={setReplyFile}
        handleReply={handleReply}
        handleRedo={handleRedo}
        handleInstantAction={handleInstantAction}
        loading={loading}
      />
    </div>
  );
}
