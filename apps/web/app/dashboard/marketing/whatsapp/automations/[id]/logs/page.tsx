'use client';

import React, { use } from 'react';
import { AutomationLogsView } from '@/features/marketing/whatsapp/components/automations/AutomationLogsView';

export default function AutomationLogsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <AutomationLogsView id={id} />;
}
