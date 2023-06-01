"use client";

import ArticleList from "@/components/ArticleList";
import { useBase } from "@/contexts/BaseProvider";

export default function Page() {
  const { setIsMidOpen, isMidOpen } = useBase();

  return (
    <main
      className="overflow-auto"
      onClick={() => {
        if (isMidOpen) setIsMidOpen(false);
      }}
    >
      <ArticleList />
    </main>
  );
}
