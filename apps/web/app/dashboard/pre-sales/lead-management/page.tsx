"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LeadTableClient } from "@/features/leads/components/tables/LeadTableClient";

export default function PreSalesLeadManagement() {
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
        .then((res) => res.json())
        .then((roles) => {
          const role = roles.find((r: any) => r.id === user.roleId);
          if (
            role &&
            ["PRE_SALES", "PRE_SALES_MANAGER", "ADMIN"].includes(role.code)
          ) {
            setIsAuthorized(true);
          } else {
            router.replace("/dashboard");
          }
        })
        .catch(console.error);
    }
  }, [session, isPending, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-100 border-t-[var(--brand-600)] animate-spin" />
        <p className="text-xs font-semibold text-[var(--text-tertiary)]">
          Verifying authorization clearance…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-enter max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight m-0">
          Lead Management Hub
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[var(--text-tertiary)] mt-1 mb-0">
          Filter, triage, and manage active prospects across all inbound sales channels.
        </p>
      </div>

      <LeadTableClient />
    </div>
  );
}
