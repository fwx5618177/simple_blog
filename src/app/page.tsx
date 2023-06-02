"use client";

import { useBase } from "@/contexts/BaseProvider";
import MainPage from "@/views/Main";

export default function Page() {
  const { setIsMidOpen, isMidOpen } = useBase();

  return (
    <main
      onClick={() => {
        if (isMidOpen) setIsMidOpen(false);
      }}
      className="flex flex-col gap-8"
    >
      <MainPage />
    </main>
  );
}
