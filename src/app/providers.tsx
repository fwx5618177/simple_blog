"use client";

import { AlertsProvider } from "@/contexts/AlertContext";
import { BaseProvider } from "@/contexts/BaseProvider";
import { QueryClientProvider, QueryClient } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BaseProvider>
        <AlertsProvider>{children}</AlertsProvider>
        {process.env.NODE_ENV !== "development" && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </BaseProvider>
    </QueryClientProvider>
  );
}
