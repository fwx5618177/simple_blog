"use client";

import { useCallback, useMemo } from "react";
import styles from "docs/styles/style.module.scss";
import Paper from "@/components/Paper";
import useParseHTML from "@/hooks/ParseHTML";
import React from "react";
import CodeRender from "@/components/Code/CodeRender";
import { DOMNode } from "html-react-parser";
import { useParams } from "next/navigation";
import { useQuery } from "react-query";
import LoadAnime from "@/components/LoadAnime/LoadAnime";
import { DocContentTypes } from "../../../../types/doc";

export default async function MarkdownPage() {
  const params = useParams();

  const { data, isLoading } = useQuery("docs", async () => {
    const result = await fetch("/api/docs", {
      method: "POST",
      body: JSON.stringify({
        path: Array.isArray(params?.slug)
          ? params?.slug.join("/")
          : params?.slug,
      }),
    });

    const data = await result.json();

    return data;
  });

  const handleNode = (node: DOMNode): any => {
    const { name, attribs, children } = node as any;
    if (name === "code") {
      const { class: className } = attribs;

      const language = className?.split("-")[1];
      const code = children?.[0]?.data;

      return <CodeRender code={code} language={language} />;
    }

    return node;
  };

  const callBackNode = useCallback(handleNode, []);
  const content: DocContentTypes = useMemo(() => data?.data, [data]);

  const parsedHtml = useParseHTML({
    html: content?.content as string,
    options: {
      replace: callBackNode,
    },
  });

  return (
    <main className={styles?.main}>
      {isLoading ? (
        <LoadAnime />
      ) : (
        <Paper title={content?.title} time={content?.time} pageSize="sm">
          <header></header>
          <article
            className="relative w-full"
            // dangerouslySetInnerHTML={{
            //   __html: content?.content,
            // }}
          >
            {parsedHtml}
          </article>
        </Paper>
      )}
    </main>
  );
}
