import { LeadProfileClient } from '@/features/leads/components/profile/LeadProfileClient';

export default async function ClosingManagerLeadProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <LeadProfileClient leadId={resolvedParams.id} />;
}
