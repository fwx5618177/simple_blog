"use client";

import { useCallback, useEffect, useState } from "react";
import { queryDocs } from "./actions";
import styles from "docs/styles/style.module.scss";
import { DocContentTypes } from "../../../../types/doc";
import Paper from "@/components/Paper";
import dayjs from "dayjs";
import useParseHTML from "@/hooks/ParseHTML";
import React from "react";
import CodeRender from "@/components/Code/CodeRender";
import { DOMNode } from "html-react-parser";
import { useParams } from "next/navigation";

export default async function MarkdownPage() {
  const params = useParams();
  const [content, setContent] = useState<DocContentTypes>({
    content: "",
    title: "",
    time: "",
    tags: [],
  });

  const handleNode = (node: DOMNode): any => {
    const { name, attribs, children } = node as any;
    if (name === "code") {
      const { class: className } = attribs;

      const language = className?.split("-")[1];
      const code = children?.[0]?.data;

      console.log(
        "attribs:",
        name,
        attribs,
        children,
        className,
        language,
        code
      );
      return <CodeRender code={code} language={language} />;
    }

    return node;
  };

  const callBackNode = useCallback(handleNode, []);

  const parsedHtml = useParseHTML({
    html: content?.content as string,
    options: {
      replace: callBackNode,
    },
  });

  const loadData = useCallback(async () => {
    const path = Array.isArray(params?.slug)
      ? params?.slug.join("/")
      : params?.slug;
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

    console.log(result?.content);
  }, [params?.slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <main className={styles?.main}>
      <Paper title={content?.title} time={content?.time} pageSize="sm">
        <article
          className="relative w-full"
          // dangerouslySetInnerHTML={{
          //   __html: content?.content,
          // }}
        >
          {parsedHtml}
        </article>
      </Paper>
    </main>
  );
}
