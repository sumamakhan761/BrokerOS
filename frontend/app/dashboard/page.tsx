"use client";

import { authClient } from "@/lib/auth-client";
import { UserCircle, Shield, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const roleToRouteMap: Record<string, string> = {
  'PRE_SALES': '/dashboard/pre-sales',
  'PRE_SALES_MANAGER': '/dashboard/pre-sales-manager',
  'SALES_EXECUTIVE': '/dashboard/sales-executive',
  'SALES_MANAGER': '/dashboard/sales-manager',
  'POST_SALES': '/dashboard/post-sales',
  'FINANCE': '/dashboard/finance',
  'BUSINESS_MANAGER': '/dashboard/business-manager',
  'DIRECTOR': '/dashboard/director',
  'ADMIN': '/dashboard/admin',
  'SOURCING_MANAGER': '/dashboard/sourcing-manager',
  'CLOSING_MANAGER': '/dashboard/closing-manager',
  'CHANNEL_PARTNER': '/dashboard/channel-partner',
};

export default function DashboardOverview() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      const user = session.user as any;
      if (user?.roleId) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        fetch(`${baseUrl}/roles`)
          .then(res => res.json())
          .then(roles => {
            const role = roles.find((r: any) => r.id === user.roleId);
            if (role && roleToRouteMap[role.code]) {
              router.replace(roleToRouteMap[role.code]);
            }
          })
          .catch(console.error);
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Building className="w-10 h-10 text-blue-600 animate-pulse" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Authenticating...</h1>
      <p className="text-lg text-gray-600 max-w-2xl">
        Redirecting you to your workspace...
      </p>

      <div className="mt-12 inline-flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-full border border-gray-200">
        <UserCircle className="w-5 h-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{session?.user?.email || "Loading..."}</span>
      </div>
    </div>
  );
}
