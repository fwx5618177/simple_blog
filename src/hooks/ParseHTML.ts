import parse, { HTMLReactParserOptions } from "html-react-parser";
import { useMemo } from "react";

const useParseHTML = ({
  html,
  options = {},
}: {
  html: string;
  options?: HTMLReactParserOptions;
}) => {
  const parsedHTML = useMemo(() => parse(html, options), [html, options]);

  return parsedHTML;
};

export default useParseHTML;
