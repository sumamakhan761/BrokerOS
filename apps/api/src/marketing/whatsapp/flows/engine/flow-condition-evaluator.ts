export async function evaluateFlowConditionNode(
  config: Record<string, any>,
  run: any,
  prisma: any,
): Promise<boolean> {
  const subject = config.subject; // 'var' | 'tag' | 'contact_field'
  const subjectKey = config.subject_key;
  const operator = config.operator || 'equals';
  const configValue = config.value || '';

  let actualValue: string | undefined;

  if (subject === 'var') {
    const vars = (run.vars || {}) as Record<string, any>;
    actualValue =
      vars[subjectKey] !== undefined ? String(vars[subjectKey]) : undefined;
  } else if (subject === 'tag') {
    const hasTag = await prisma.whatsAppContactTag.findFirst({
      where: { contactId: run.contactId, tagId: subjectKey },
    });
    actualValue = hasTag ? 'present' : undefined;
  } else if (subject === 'contact_field') {
    const contact = await prisma.whatsAppContact.findUnique({
      where: { id: run.contactId },
    });
    if (contact && (contact as any)[subjectKey] !== undefined) {
      actualValue = String((contact as any)[subjectKey]);
    }
  }

  switch (operator) {
    case 'present':
      return actualValue !== undefined && actualValue !== '';
    case 'absent':
      return actualValue === undefined || actualValue === '';
    case 'equals':
      return actualValue === configValue;
    case 'contains':
      return actualValue !== undefined && actualValue.includes(configValue);
    default:
      return false;
  }
}
