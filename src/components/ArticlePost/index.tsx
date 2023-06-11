import React, { FC } from "react";
import Paper from "../Paper";
import { PaperProps } from "../../../types/paper";
import { getContentSize } from "../../../utils/helper";

const ArticlePost: FC<
  PaperProps & {
    blockquote?: string | React.ReactNode;
    link?: string;
  }
> = ({ title, time, children, pageSize = "base", blockquote, link }) => {
  const contentSize = `min-h-${getContentSize(pageSize)}`;

  return (
    <Paper title={title} time={time} pageSize={pageSize}>
      <div className="h-full p-0 m-0">
        {blockquote && (
          <blockquote className="break-all px-[20px] w-full bg-blockQuote leading-8 py-[15px] mt-10 border-l-[5px] border-l-solid border-l-blockQuote text-lg text-fourth">
            <p className="line-clamp-3">{blockquote}</p>
          </blockquote>
        )}
        <div
          className={`m-3 pr-4 break-all w-full ${contentSize} overflow-hidden line-clamp-[15]`}
        >
          {children}
        </div>

        <footer className="relative flex flex-row justify-between w-full before:content-[''] before:absolute before:w-full before:h-[1px] before:m-0 before:top-[-20px] before:bg-hrLine">
          <a
            href={link}
            className="text-base text-paperRead hover:text-hoverPaperRead"
          >
            {"继续阅读 >>"}
          </a>
          <a
            href={link}
            className="text-default text-sm rounded-[6px] bg-default hover:bg-primary px-2 py-1"
          >
            全文
          </a>
        </footer>
      </div>
    </Paper>
  );
};

export default ArticlePost;
