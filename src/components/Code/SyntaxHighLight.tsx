import { FC } from "react";
import { Prism as SyntaxHighLighter } from "react-syntax-highlighter";

const SyntaxHighLight: FC<{
  code: string;
  language: string;
  theme?: any;
}> = ({ code, language, theme }) => {
  return (
    <SyntaxHighLighter language={language} style={theme}>
      {code}
    </SyntaxHighLighter>
  );
};

export default SyntaxHighLight;
