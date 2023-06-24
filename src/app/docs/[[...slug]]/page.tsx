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
import lodash from "lodash";
import LoadAnime from "@/components/LoadAnime/LoadAnime";
import { DocContentTypes } from "../../../../types/doc";

const MarkdownPage = () => {
  const params = useParams();

  const { data, isLoading } = useQuery(
    ["docs", params?.slug],
    async () => {
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
    },
    {
      enabled: !!params?.slug,
    }
  );
  const content: DocContentTypes = useMemo(() => data?.data, [data]);

  const callBackNode = useCallback((node: DOMNode): any => {
    const { name, attribs, children } = node as any;

    if (name === "code") {
      try {
        if (lodash.isEqual({}, attribs)) {
          return {
            ...node,
            name: "span",
          };
        }

        const { class: className } = attribs;

        const language = className?.split("-")[1];
        const code = children?.[0]?.data;

        return <CodeRender code={code} language={language} />;
      } catch (err) {
        console.error(err);

        return children;
      }
    }

    return node;
  }, []);

  const parsedHtml = useParseHTML({
    html: content?.content satisfies string,
    options: {
      replace: callBackNode,
    },
  });

  return (
    <main>
      {isLoading ? (
        <LoadAnime />
      ) : (
        <>
          <div className="text-secondary">
            <span>
              <a href="/" className="hover:text-info hover:underline">
                home
              </a>
              {` << ${content?.title}`}
            </span>
          </div>
          <Paper title={content?.title} time={content?.time} pageSize="sm">
            <article
              className={`relative w-full min-h-[480px] ${styles.articles}`}
            >
              <header>
                {content?.tags?.map((item, index) => (
                  <a
                    className={`ml-4 px-4 py-2 rounded-[6px] text-default text-sm`}
                    style={{
                      backgroundColor: item?.color,
                    }}
                    key={index}
                    href={item?.href}
                  >
                    {item?.name}
                  </a>
                ))}
              </header>
              {parsedHtml}
            </article>
            <footer
              className={`mt-4 border-t-[1px] border-t-secondary pt-2 flex items-center justify-end`}
            >
              <span>胡言乱语之言</span>
            </footer>
          </Paper>
        </>
      )}
    </main>
  );
};

export default MarkdownPage;
