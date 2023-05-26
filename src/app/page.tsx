"use client";

import ArticleList from "@/components/ArticleList";

export default function Home() {
  return (
    <main className="w-full h-[100vh] p-5 overflow-auto">
      <ArticleList />
    </main>
  );
}
