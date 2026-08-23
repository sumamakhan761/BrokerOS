import { ChannelPartnerLeadTableClient } from "@/features/leads/components/tables/ChannelPartnerLeadTableClient";

export default function CustomerManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Customer Management
        </h1>
        <p className="text-gray-500">
          Manage leads assigned via your Sourcing and Closing Managers.
        </p>
      </div>

      <ChannelPartnerLeadTableClient />
    </div>
  );
}
