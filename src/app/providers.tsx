"use client";

import { AlertsProvider } from "@/contexts/AlertContext";
import { BaseProvider } from "@/contexts/BaseProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BaseProvider>
      <AlertsProvider>{children}</AlertsProvider>
    </BaseProvider>
  );
}
