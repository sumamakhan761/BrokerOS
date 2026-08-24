import React from "react";
import { FileText, Download } from "lucide-react";

interface ApprovalTicketMessagesProps {
  ticket: any;
  role: string;
}

export function ApprovalTicketMessages({
  ticket,
  role,
}: ApprovalTicketMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
      {ticket.messages.map((msg: any) => {
        const isManager = msg.sender.role?.code === "SALES_MANAGER";
        const alignRight =
          (role === "SALES_MANAGER" && isManager) ||
          (role === "SALES_EXECUTIVE" && !isManager);

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${
              alignRight ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                {msg.sender.name}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-2xs ${
                alignRight
                  ? "bg-[var(--brand-600)] text-white rounded-tr-xs"
                  : "bg-white border border-slate-200/80 text-[var(--text-primary)] rounded-tl-xs"
              }`}
            >
              <div
                className={`text-xs whitespace-pre-wrap font-medium leading-relaxed ${
                  alignRight ? "text-purple-50" : "text-[var(--text-secondary)]"
                }`}
              >
                {msg.description}
              </div>

              {msg.metadata?.documents && msg.metadata.documents.length > 0 ? (
                <div
                  className={`mt-2.5 pt-2.5 border-t flex flex-col gap-1.5 ${
                    alignRight
                      ? "border-purple-400/40"
                      : "border-slate-100"
                  }`}
                >
                  {msg.metadata.documents.map((doc: any, i: number) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center text-xs font-bold transition-colors ${
                        alignRight
                          ? "text-purple-100 hover:text-white"
                          : "text-[var(--brand-700)] hover:underline"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      View {doc.name || "Attachment"}
                    </a>
                  ))}
                </div>
              ) : (
                msg.fileUrl && (
                  <div
                    className={`mt-2.5 pt-2.5 border-t ${
                      alignRight
                        ? "border-purple-400/40"
                        : "border-slate-100"
                    }`}
                  >
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center text-xs font-bold transition-colors ${
                        alignRight
                          ? "text-purple-100 hover:text-white"
                          : "text-[var(--brand-700)] hover:underline"
                      }`}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Download Attachment
                    </a>
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
