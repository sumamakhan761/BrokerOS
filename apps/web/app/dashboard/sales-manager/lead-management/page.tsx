"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SalesExecLeadTableClient } from "@/features/leads/components/tables/SalesExecLeadTableClient";

export default function SalesManagerLeadManagement() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
      return;
    }
    if (isAuthorized) return;

    const user = session?.user as any;
    if (user?.roleId) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      fetch(`${baseUrl}/roles`)
        .then(res => res.json())
        .then(roles => {
          const role = roles.find((r: any) => r.id === user.roleId);
          if (role && role.code === 'SALES_MANAGER') {
            setIsAuthorized(true);
          } else {
            router.replace("/dashboard");
          }
        })
        .catch(console.error);
    }
  }, [session, isPending, router, isAuthorized]);

  if (!isAuthorized) {
    return <div className="p-8">Verifying access...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-500 text-sm mt-1">Oversee all leads assigned to your Sales Executives</p>
        </div>
      </div>

      <SalesExecLeadTableClient isManagerView={true} />
    </div>
  );
}
