"use client";

import { useCallback, useEffect, useState } from "react";
import { queryDocs } from "./actions";
import styles from "docs/styles/style.module.scss";
import { DocContentTypes } from "../../../../types/doc";
import Paper from "@/components/Paper";
import dayjs from "dayjs";

export default async function MarkdownPage({
  params,
}: {
  params: { slug: string };
}) {
  const [content, setContent] = useState<DocContentTypes>({
    content: "",
    title: "",
    time: "",
    tags: [],
  });
  const { slug } = params;

  const loadData = useCallback(async () => {
    const path = Array.isArray(slug) ? slug.join("/") : slug;
    const result = await queryDocs(path);

    if (!result) {
      setContent({
        content: "404",
        title: "404",
        time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        tags: [],
      });
    } else {
      setContent(result);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <main className={styles?.main}>
      <Paper title={content?.title} time={content?.time} pageSize="sm">
        <article
          className="relative w-full"
          dangerouslySetInnerHTML={{
            __html: content?.content,
          }}
        ></article>
      </Paper>
    </main>
  );
}
