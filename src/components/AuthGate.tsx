"use client";

import { AuthScreen } from "@/components/AuthScreen";
import { useSession } from "@/lib/useSession";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}
