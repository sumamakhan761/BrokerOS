'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
  className,
}: {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}) {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('DropdownMenuTrigger must be within DropdownMenu');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    ctx.setOpen(!ctx.open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: ctx.triggerRef,
      onClick: (e: React.MouseEvent) => {
        (children.props as any)?.onClick?.(e);
        handleClick(e);
      },
      'aria-haspopup': 'menu',
      'aria-expanded': ctx.open,
    });
  }

  return (
    <button
      ref={ctx.triggerRef as any}
      type="button"
      onClick={handleClick}
      className={className}
      aria-haspopup="menu"
      aria-expanded={ctx.open}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  className,
  align = 'end',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'end' | 'center';
}) {
  const ctx = useContext(DropdownContext);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctx?.open) return;

    function handlePointerDown(e: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        ctx?.triggerRef.current &&
        !ctx.triggerRef.current.contains(e.target as Node)
      ) {
        ctx.setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        ctx?.setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ctx]);

  if (!ctx?.open) return null;

  const alignClass =
    align === 'start'
      ? 'left-0'
      : align === 'center'
        ? 'left-1/2 -translate-x-1/2'
        : 'right-0';

  return (
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        'absolute z-50 mt-1 min-w-[10rem] origin-top-right rounded-xl border border-border-default bg-bg-surface p-1 shadow-xl focus:outline-hidden animate-in fade-in zoom-in-95 duration-100',
        alignClass,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}) {
  const ctx = useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    onClick?.(e);
    ctx?.setOpen(false);
  };

  return (
    <div
      role="menuitem"
      onClick={handleClick}
      className={cn(
        'flex w-full cursor-pointer items-center rounded-lg px-2.5 py-1.5 text-xs text-text-primary transition-colors hover:bg-bg-subtle focus:bg-bg-subtle focus:outline-hidden disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      {children}
    </div>
  );
}
