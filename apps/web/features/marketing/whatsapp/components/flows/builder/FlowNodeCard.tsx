'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowNode } from './types';
import { NODE_TYPES_META } from './types';
import { FlowNodeConfigEditor } from './FlowNodeConfigEditor';

interface FlowNodeCardProps {
  node: FlowNode;
  index: number;
  allNodeKeys: string[];
  updateNodeConfig: (nodeKey: string, cfgPatch: Record<string, any>) => void;
  removeNode: (nodeKey: string) => void;
}

export const FlowNodeCard: React.FC<FlowNodeCardProps> = ({
  node,
  index,
  allNodeKeys,
  updateNodeConfig,
  removeNode,
}) => {
  const meta = NODE_TYPES_META[node.nodeType] || NODE_TYPES_META.send_message;
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        'rounded-2xl border border-border-default bg-bg-surface p-4 shadow-xs border-l-4 transition-all',
        meta.color.split(' ')[2],
      )}
    >
      {/* Node Card Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg',
              meta.color.split(' ')[1],
              meta.color.split(' ')[0],
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary">
              {index + 1}. {meta.label}
            </span>
            <span className="text-[10px] font-mono text-text-muted ml-2">
              ({node.nodeKey})
            </span>
          </div>
        </div>

        {node.nodeType !== 'start' && (
          <button
            type="button"
            onClick={() => removeNode(node.nodeKey)}
            className="text-text-muted hover:text-red-600 p-1 rounded"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Node Config Body */}
      <FlowNodeConfigEditor
        node={node}
        allNodeKeys={allNodeKeys}
        updateNodeConfig={updateNodeConfig}
      />
    </div>
  );
};
