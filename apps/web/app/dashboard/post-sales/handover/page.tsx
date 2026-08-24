"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PostSalesLeadTableClient } from "@/features/leads/components/tables/PostSalesLeadTableClient";
import { Key, Loader2 } from "lucide-react";

export default function PostSalesHandoverManagement() {
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
          if (role && ["POST_SALES", "ADMIN"].includes(role.code)) {
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
        <p className="text-xs font-semibold text-[var(--text-muted)]">
          Verifying access…
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-enter">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Key size={18} />
            </div>
            <span>Completed Handovers & Possession Archive</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Historical ledger of leads that have finalized agreements and received possession keys
          </p>
        </div>
      </div>

      <PostSalesLeadTableClient completedHandoversOnly={true} />
    </div>
  );
}
