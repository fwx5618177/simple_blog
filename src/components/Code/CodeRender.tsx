import { Highlight, themes } from "prism-react-renderer";
import React, { FC } from "react";
import styles from "./index.module.scss";
import Copy from "../Copy";

const CodeRender: FC<{ code: string; language: string; theme?: any }> = ({
  code,
  language,
  theme = themes.nightOwl,
}) => {
  return (
    <React.Fragment>
      <Highlight code={code} language={language} theme={theme}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <div className={`${className} ${styles.codeHighLight}`} style={style}>
            <div className={styles.clipboard}>
              <Copy onCopy={console.log} text={code}>
                {language}
              </Copy>
            </div>
            {tokens.map((line, i) =>
              i !== tokens.length - 1 ? (
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
              ) : null
            )}
          </div>
        )}
      </Highlight>
    </React.Fragment>
  );
};

export default CodeRender;
