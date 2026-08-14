'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { NewLeadsTable } from '@/features/leads/components/tables/NewLeadsTable';

export default function PreSalesManagerNewLeads() {
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
          if (role?.code === 'PRE_SALES_MANAGER') {
            setIsAuthorized(true);
          } else {
            router.replace("/dashboard");
          }
        })
        .catch(() => router.replace("/dashboard"));
    }
  }, [session, isPending, router]);

  if (isPending || !isAuthorized) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and assign leads to your team</p>
        </div>
      </div>
      
      <NewLeadsTable />
    </div>
  );
}
