import type { WhatsAppStepType, InteractiveMessagePayload } from '@brokeros/types';
import { blankButtonsPayload, blankListPayload } from '../../interactive/InteractiveBuilder';
import { interactivePayloadPreviewText } from '../../../lib/interactive';
import type { BuilderStep, ServerStepNode } from './types';

export function cid(): string {
  return (
    'c_' +
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36))
  );
}

export function blankConfig(type: WhatsAppStepType): Record<string, unknown> {
  switch (type) {
    case 'send_message':
      return { text: '' };
    case 'send_buttons':
      return blankButtonsPayload() as unknown as Record<string, unknown>;
    case 'send_list':
      return blankListPayload() as unknown as Record<string, unknown>;
    case 'send_template':
      return { template_name: '', language: 'en_US' };
    case 'add_tag':
    case 'remove_tag':
      return { tag_id: '' };
    case 'assign_conversation':
      return { mode: 'round_robin' };
    case 'update_contact_field':
      return { field: 'name', value: '' };
    case 'create_deal':
      return { pipeline_id: '', stage_id: '', title: '', value: 0 };
    case 'wait':
      return { amount: 1, unit: 'hours' };
    case 'condition':
      return { subject: 'tag_presence', operand: '', value: '' };
    case 'send_webhook':
      return { url: '', headers: {}, body_template: '' };
    case 'close_conversation':
      return {};
    default:
      return {};
  }
}

export function toApiSteps(steps: BuilderStep[]): any[] {
  return steps.map((s, idx) => ({
    stepType: s.step_type,
    stepConfig: s.step_config,
    position: idx,
    branches: s.branches
      ? {
        yes: toApiSteps(s.branches.yes),
        no: toApiSteps(s.branches.no),
      }
      : undefined,
  }));
}

export function fromServerSteps(nodes: ServerStepNode[]): BuilderStep[] {
  return nodes.map((n) => ({
    cid: cid(),
    step_type: (n.stepType || n.step_type || 'send_message') as WhatsAppStepType,
    step_config: (n.stepConfig || n.step_config || {}) as Record<string, unknown>,
    branches:
      (n.stepType === 'condition' || n.step_type === 'condition')
        ? {
          yes: fromServerSteps(n.branches?.yes ?? []),
          no: fromServerSteps(n.branches?.no ?? []),
        }
        : undefined,
  }));
}

export function previewFor(step: BuilderStep): string {
  switch (step.step_type) {
    case 'send_message':
      return (step.step_config.text as string) || 'Click to compose text...';
    case 'send_buttons':
    case 'send_list':
      return (
        interactivePayloadPreviewText(
          step.step_config as unknown as InteractiveMessagePayload,
        ) || 'Interactive options'
      );
    case 'send_template':
      return (step.step_config.template_name as string) || 'Select approved template';
    case 'add_tag':
      return `Tag: ${(step.step_config.tag_id as string) || 'unassigned'}`;
    case 'remove_tag':
      return `Remove tag: ${(step.step_config.tag_id as string) || 'unassigned'}`;
    case 'assign_conversation':
      return `Mode: ${(step.step_config.mode as string) || 'round_robin'}`;
    case 'update_contact_field':
      return `Update ${(step.step_config.field as string) || 'field'}`;
    case 'create_deal':
      return `Create deal in pipeline`;
    case 'wait':
      return `Wait for ${step.step_config.amount ?? 1} ${step.step_config.unit ?? 'hours'}`;
    case 'condition':
      return `Check if ${step.step_config.subject ?? 'condition'} holds`;
    case 'send_webhook':
      return (step.step_config.url as string) || 'Configure webhook endpoint';
    case 'close_conversation':
      return 'Mark conversation as closed';
    default:
      return '';
  }
}
