import { AutomationRunContext } from './automation-types.js';

/**
 * Evaluate whether trigger filters match the event context.
 */
export function matchesAutomationTrigger(
  automation: any,
  context: AutomationRunContext,
): boolean {
  const config = (automation.triggerConfig || {}) as Record<string, any>;

  if (automation.triggerType === 'keyword_match') {
    const keywords: string[] = config.keywords || [];
    const matchType: string = config.matchType || 'contains';
    const text = (context.messageText || '').trim().toLowerCase();

    if (!text || keywords.length === 0) return false;

    return keywords.some((kw) => {
      const cleanKw = kw.trim().toLowerCase();
      if (!cleanKw) return false;
      if (matchType === 'exact') return text === cleanKw;
      if (matchType === 'starts_with') return text.startsWith(cleanKw);

      // Unicode word-boundary matching (wacrm engine standard)
      try {
        const escaped = cleanKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const unicodeRegex = new RegExp(
          `(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`,
          'iu',
        );
        if (unicodeRegex.test(text)) return true;
      } catch {
        // Fallback if lookarounds not supported
      }
      return text.includes(cleanKw);
    });
  }

  if (automation.triggerType === 'interactive_reply') {
    const targetId = config.buttonId || config.rowId || config.id;
    if (!targetId || !context.interactiveReplyId) return false;
    return context.interactiveReplyId === targetId;
  }

  if (automation.triggerType === 'tag_added') {
    const targetTagId = config.tagId;
    if (!targetTagId || !context.tagId) return false;
    return context.tagId === targetTagId;
  }

  return true;
}
