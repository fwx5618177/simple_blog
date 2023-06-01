import React, { FC } from "react";
import Paper from "../Paper";
import { PaperProps } from "../../../types/paper";

const ArticlePost: FC<
  PaperProps & {
    blockquote?: string | React.ReactNode;
  }
> = ({ title, time, children, pageSize = "base", blockquote }) => {
  return (
    <Paper title={title} time={time} pageSize={pageSize}>
      <div className="relative p-0 m-0">
        <blockquote className="break-all px-[20px] w-full bg-blockQuote leading-8 py-[15px] mt-10 border-l-[5px] border-l-solid border-l-blockQuote text-lg text-fourth">
          <p className="line-clamp-3">{blockquote}</p>
        </blockquote>
        <div className="m-2">{children}</div>
        <div className="absolute right-0">
          <footer>222</footer>
        </div>
      </div>
    </Paper>
  );
};

export default ArticlePost;
