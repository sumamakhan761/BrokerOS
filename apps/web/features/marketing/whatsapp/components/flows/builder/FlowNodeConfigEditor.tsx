'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { FlowNode } from './types';

interface FlowNodeConfigEditorProps {
  node: FlowNode;
  allNodeKeys: string[];
  updateNodeConfig: (nodeKey: string, cfgPatch: Record<string, any>) => void;
}

export const FlowNodeConfigEditor: React.FC<FlowNodeConfigEditorProps> = ({
  node,
  allNodeKeys,
  updateNodeConfig,
}) => {
  return (
    <div className="space-y-3 pt-2 border-t border-border-default">
      {node.nodeType === 'send_message' && (
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1">Message Body:</label>
          <Textarea
            value={node.config.text || ''}
            onChange={(e) => updateNodeConfig(node.nodeKey, { text: e.target.value })}
            placeholder="Type message text..."
            className="text-xs bg-bg-subtle min-h-16"
          />
        </div>
      )}

      {node.nodeType === 'send_buttons' && (
        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Prompt Body:</label>
            <Textarea
              value={node.config.body || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { body: e.target.value })}
              placeholder="Select an option:"
              className="text-xs bg-bg-subtle min-h-14"
            />
          </div>
          <label className="text-[11px] font-bold text-text-muted block">Buttons:</label>
          {(node.config.buttons || []).map((btn: any, bIdx: number) => (
            <div key={bIdx} className="flex items-center gap-2">
              <Input
                value={btn.title || ''}
                onChange={(e) => {
                  const nextBtns = [...(node.config.buttons || [])];
                  nextBtns[bIdx] = { ...btn, title: e.target.value };
                  updateNodeConfig(node.nodeKey, { buttons: nextBtns });
                }}
                placeholder="Button label"
                className="text-xs bg-bg-subtle flex-1"
              />
              <select
                value={btn.next_node_key || ''}
                onChange={(e) => {
                  const nextBtns = [...(node.config.buttons || [])];
                  nextBtns[bIdx] = { ...btn, next_node_key: e.target.value };
                  updateNodeConfig(node.nodeKey, { buttons: nextBtns });
                }}
                className="rounded-lg border border-border-default bg-bg-subtle px-2 py-1.5 text-xs text-text-primary"
              >
                <option value="">-- Then go to node --</option>
                {allNodeKeys
                  .filter((k) => k !== node.nodeKey)
                  .map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {node.nodeType === 'collect_input' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Question Prompt:</label>
            <Input
              value={node.config.prompt || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { prompt: e.target.value })}
              placeholder="e.g. What is your preferred location?"
              className="text-xs bg-bg-subtle"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Save Answer As Variable:</label>
            <Input
              value={node.config.var_name || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { var_name: e.target.value })}
              placeholder="e.g. preferred_location"
              className="text-xs bg-bg-subtle font-mono"
            />
          </div>
        </div>
      )}

      {node.nodeType === 'condition' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Variable:</label>
            <Input
              value={node.config.variable || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { variable: e.target.value })}
              placeholder="budget"
              className="text-xs bg-bg-subtle font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">If TRUE go to:</label>
            <select
              value={node.config.if_true_node_key || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { if_true_node_key: e.target.value })}
              className="w-full rounded-lg border border-border-default bg-bg-subtle px-2 py-1.5 text-xs text-text-primary"
            >
              <option value="">-- Select node --</option>
              {allNodeKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">If FALSE go to:</label>
            <select
              value={node.config.if_false_node_key || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { if_false_node_key: e.target.value })}
              className="w-full rounded-lg border border-border-default bg-bg-subtle px-2 py-1.5 text-xs text-text-primary"
            >
              <option value="">-- Select node --</option>
              {allNodeKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* General Next Node transition for linear nodes */}
      {node.nodeType !== 'send_buttons' &&
        node.nodeType !== 'condition' &&
        node.nodeType !== 'end' && (
          <div className="pt-2 flex items-center gap-2">
            <ArrowDown className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-[11px] font-medium text-text-muted">Then proceed to:</span>
            <select
              value={node.config.next_node_key || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { next_node_key: e.target.value })}
              className="rounded-lg border border-border-default bg-bg-subtle px-2.5 py-1 text-xs text-text-primary"
            >
              <option value="">-- Select next step --</option>
              {allNodeKeys
                .filter((k) => k !== node.nodeKey)
                .map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
            </select>
          </div>
        )}
    </div>
  );
};
