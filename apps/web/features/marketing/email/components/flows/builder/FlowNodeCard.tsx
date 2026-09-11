// ============================================================================
// BrokerOS — Email Flow Node Card Component (WhatsApp Visual Parity)
// ============================================================================

'use client';

import React from 'react';
import { Trash2, MoveUp, MoveDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EmailFlowNode } from './types';
import { EMAIL_NODE_TYPES_META } from './types';
import { FlowNodeConfigEditor } from './FlowNodeConfigEditor';

interface FlowNodeCardProps {
  node: EmailFlowNode;
  index: number;
  totalNodes: number;
  allNodeKeys: string[];
  updateNodeConfig: (nodeKey: string, cfgPatch: Record<string, any>) => void;
  removeNode: (nodeKey: string) => void;
  moveNode: (index: number, direction: 'up' | 'down') => void;
}

export const FlowNodeCard: React.FC<FlowNodeCardProps> = ({
  node,
  index,
  totalNodes,
  allNodeKeys,
  updateNodeConfig,
  removeNode,
  moveNode,
}) => {
  const meta = EMAIL_NODE_TYPES_META[node.nodeType] || EMAIL_NODE_TYPES_META.send_email;
  const Icon = meta.icon;
  const isFirst = index === 0;
  const isLast = index === totalNodes - 1;

  return (
    <div
      className={cn(
        'rounded-2xl border border-border-default bg-bg-surface p-4 shadow-xs border-l-4 transition-all hover:shadow-sm',
        meta.color.split(' ')[2],
      )}
    >
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg shadow-2xs',
              meta.color.split(' ')[1],
              meta.color.split(' ')[0],
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary">
                Step {index + 1}: {meta.label}
              </span>
              <span className="text-[10px] font-mono bg-bg-subtle text-text-muted px-1.5 py-0.5 rounded border border-border-subtle">
                {node.nodeKey}
              </span>
            </div>
            <p className="text-[10px] text-text-tertiary">{meta.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Reorder Buttons */}
          <button
            type="button"
            onClick={() => moveNode(index, 'up')}
            disabled={isFirst}
            title="Move step up"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-text-muted hover:bg-bg-subtle hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <MoveUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => moveNode(index, 'down')}
            disabled={isLast}
            title="Move step down"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-text-muted hover:bg-bg-subtle hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <MoveDown className="h-3.5 w-3.5" />
          </button>

          {/* Delete Node Button */}
          {node.nodeType !== 'start' && (
            <button
              type="button"
              onClick={() => removeNode(node.nodeKey)}
              title="Delete this action step"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-600 hover:bg-red-500/15 hover:text-red-700 transition-colors ml-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Card Body Configuration ── */}
      <FlowNodeConfigEditor
        node={node}
        allNodeKeys={allNodeKeys}
        updateNodeConfig={updateNodeConfig}
      />
    </div>
  );
};
