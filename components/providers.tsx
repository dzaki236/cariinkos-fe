"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toast";

function AuthRedirectHandler() {
  useEffect(() => {
    let redirecting = false;
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (
        !redirecting &&
        response.headers.get("X-Session-Invalid") === "true"
      ) {
        redirecting = true;
        void signOut({ callbackUrl: "/login" });
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 0, gcTime: 0, retry: 1 },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthRedirectHandler />
        {children}
        <Toaster />
      </QueryClientProvider>
    </SessionProvider>
  );
}
