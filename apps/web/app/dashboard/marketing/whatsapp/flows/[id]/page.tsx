'use client';

// ============================================================================
// BrokerOS — WhatsApp Interactive Flow Editor Page
// ============================================================================

import React, { use } from 'react';
import { FlowBuilderView } from '@/features/marketing/whatsapp/components/flows/FlowBuilderView';

export default function FlowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <FlowBuilderView id={id} />;
}
