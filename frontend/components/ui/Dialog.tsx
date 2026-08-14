import React from 'react';

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      {/* Background overlay click handler */}
      <div className="absolute inset-0" onClick={() => onOpenChange(false)}></div>
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-lg max-w-lg w-full p-6 border border-slate-200 ${className || ''}`}>
      {children}
    </div>
  );
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`mb-4 ${className || ''}`}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h2 className={`text-lg font-semibold text-slate-900 ${className || ''}`}>{children}</h2>;
}

export function DialogFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`mt-6 flex justify-end gap-2 ${className || ''}`}>{children}</div>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode, className?: string }) {
  return <p className={`text-sm text-slate-500 mt-2 ${className || ''}`}>{children}</p>;
}
