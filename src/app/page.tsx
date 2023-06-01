"use client";

import { useBase } from "@/contexts/BaseProvider";
import MainPage from "@/views/Main";

export default function Page() {
  const { setIsMidOpen, isMidOpen } = useBase();

  return (
    <main
      className="overflow-auto"
      onClick={() => {
        if (isMidOpen) setIsMidOpen(false);
      }}
    >
      <MainPage />
    </main>
  );
}
