import { BrokerProfileClient } from '@/features/brokers/components/profile/BrokerProfileClient';

export default async function BrokerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50">
      <BrokerProfileClient brokerId={resolvedParams.id} />
    </div>
  );
}
