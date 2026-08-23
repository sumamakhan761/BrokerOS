import { ClosingManagerLeadTableClient } from "@/features/leads/components/tables/ClosingManagerLeadTableClient";

export default function ClosingManagerLeadManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Lead Management
        </h1>
        <p className="text-gray-500">
          Manage leads assigned via your active Channel Partner Brokers.
        </p>
      </div>

      <ClosingManagerLeadTableClient />
    </div>
  );
}
