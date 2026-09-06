'use client';

import React from 'react';
import { List, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InteractiveMessagePayload } from '@brokeros/types';

export function InteractivePreview({
  payload,
  className,
}: {
  payload: InteractiveMessagePayload;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-full max-w-[260px] overflow-hidden rounded-xl bg-bg-surface text-text-primary shadow-sm border border-border-default',
        className,
      )}
    >
      <div className="px-3 py-2.5">
        {payload.header ? (
          <p className="mb-1 break-words text-xs font-semibold text-text-primary">
            {payload.header}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">
          {payload.body || (
            <span className="text-text-muted italic">Message body...</span>
          )}
        </p>
        {payload.footer ? (
          <p className="mt-1 break-words text-[10px] text-text-muted">
            {payload.footer}
          </p>
        ) : null}
      </div>

      {payload.kind === 'buttons' ? (
        <div className="flex flex-col border-t border-border-default">
          {payload.buttons.map((b, i) => (
            <button
              key={b.id || i}
              type="button"
              disabled
              className="flex items-center justify-center gap-1.5 border-t border-border-default py-2 text-xs font-medium text-brand-600 first:border-t-0"
            >
              <Reply className="h-3 w-3" />
              <span className="truncate">{b.title || 'Button'}</span>
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-1.5 border-t border-border-default py-2 text-xs font-medium text-brand-600"
        >
          <List className="h-3.5 w-3.5" />
          <span className="truncate">{payload.button_label || 'Menu'}</span>
        </button>
      )}
    </div>
  );
}
