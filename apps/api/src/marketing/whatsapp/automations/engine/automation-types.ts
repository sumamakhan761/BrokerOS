export interface AutomationRunContext {
  messageText?: string;
  conversationId?: string;
  tagId?: string;
  interactiveReplyId?: string;
  agentId?: string;
  vars?: Record<string, any>;
}

export interface ExecuteStepsArgs {
  automation: any;
  contactId: string | null;
  context: AutomationRunContext;
  parentStepId: string | null;
  branch: 'yes' | 'no' | null;
  startPosition: number;
  logId: string | null;
}
