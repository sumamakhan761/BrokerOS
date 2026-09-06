import { AutomationRunContext } from './automation-types.js';

/**
 * Evaluate if a condition step passes based on contact tags, message text, or contact fields.
 */
export function evaluateAutomationCondition(
  config: Record<string, any>,
  contact: any,
  context: AutomationRunContext,
): boolean {
  const field = config.field;
  const operator = config.operator || 'equals';
  const expected = config.value;

  let actual: any = null;
  if (field === 'tag') {
    const hasTag = contact?.tags?.some((t: any) => t.tagId === expected);
    return operator === 'not_has' ? !hasTag : hasTag;
  } else if (field === 'message_text') {
    actual = context.messageText || '';
  } else if (contact && contact[field] !== undefined) {
    actual = contact[field];
  }

  if (operator === 'equals') return actual === expected;
  if (operator === 'not_equals') return actual !== expected;
  if (operator === 'contains') {
    return String(actual)
      .toLowerCase()
      .includes(String(expected).toLowerCase());
  }
  return Boolean(actual);
}
