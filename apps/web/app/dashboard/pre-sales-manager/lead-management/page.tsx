"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LeadTableClient } from "@/features/leads/components/tables/LeadTableClient";

export default function PreSalesManagerLeadManagement() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
      return;
    }

    const user = session?.user as any;
    if (user?.roleId) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      fetch(`${baseUrl}/roles`)
        .then(res => res.json())
        .then(roles => {
          const role = roles.find((r: any) => r.id === user.roleId);
          if (role && role.code === 'PRE_SALES_MANAGER') {
            setIsAuthorized(true);
          } else {
            router.replace("/dashboard");
          }
        })
        .catch(console.error);
    }
  }, [session, isPending, router]);

  if (!isAuthorized) {
    return <div className="p-8">Verifying access...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Team Leads Overview</h1>
      </div>

      <LeadTableClient isManagerView={true} />
    </div>
  );
}
