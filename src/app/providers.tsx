"use client";

import { BaseProvider } from "@/contexts/BaseProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <BaseProvider>{children}</BaseProvider>;
}
