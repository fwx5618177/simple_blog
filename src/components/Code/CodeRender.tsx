import { Highlight, themes } from "prism-react-renderer";
import React from "react";
import { FC } from "react";

const CodeRender: FC<{ code: string; language: string; theme?: any }> = ({
  code,
  language,
  theme = themes.nightOwl,
}) => {
  return (
    <React.Fragment>
      <Highlight code={code} language={language} theme={theme}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <div
            className={`${className} text-sm rounded-[4px] overflow-x-auto`}
            style={style}
          >
            {tokens.map((line, i) => (
              <div
                key={i}
                {...getLineProps({
                  line,
                })}
              >
                {line.map((token, key) => (
                  <span
                    key={key}
                    {...getTokenProps({
                      token,
                    })}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </Highlight>
    </React.Fragment>
  );
};

export default CodeRender;
