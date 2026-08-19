import React from 'react';
import { FileText } from 'lucide-react';

interface ApprovalTicketMessagesProps {
  ticket: any;
  role: string;
}

export function ApprovalTicketMessages({ ticket, role }: ApprovalTicketMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
      {ticket.messages.map((msg: any) => {
        const isManager = msg.sender.role.code === 'SALES_MANAGER';
        const alignRight = (role === 'SALES_MANAGER' && isManager) || (role === 'SALES_EXECUTIVE' && !isManager);

        return (
          <div key={msg.id} className={`flex flex-col ${alignRight ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-xs font-semibold text-slate-700">{msg.sender.name}</span>
              <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleString()}</span>
            </div>
            <div
              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm ${alignRight
                ? 'bg-indigo-600 text-white rounded-tr-sm'
                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
                }`}
            >
              <div className={`text-sm whitespace-pre-wrap font-medium ${alignRight ? 'text-indigo-50' : 'text-slate-600'}`}>
                {msg.description}
              </div>
              {msg.metadata?.documents && msg.metadata.documents.length > 0 ? (
                <div className={`mt-3 pt-3 border-t flex flex-col gap-2 ${alignRight ? 'border-indigo-500/50' : 'border-slate-100'}`}>
                  {msg.metadata.documents.map((doc: any, i: number) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center text-xs font-bold transition-colors ${alignRight ? 'text-indigo-100 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      View {doc.name || 'Attachment'}
                    </a>
                  ))}
                </div>
              ) : msg.fileUrl && (
                <div className={`mt-3 pt-3 border-t ${alignRight ? 'border-indigo-500/50' : 'border-slate-100'}`}>
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center text-xs font-bold transition-colors ${alignRight ? 'text-indigo-100 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}
                  >
                    <FileText className="w-4 h-4 mr-1.5" />
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
