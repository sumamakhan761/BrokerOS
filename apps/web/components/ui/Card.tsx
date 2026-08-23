import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[16px] p-[24px] shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
