export namespace ExtractType {
  export type heading = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  export type patternType =
    | heading
    | "code"
    | "bold"
    | "italic"
    | "link"
    | "image"
    | "quote"
    | "list"
    | "table"
    | "hr"
    | "li"
    | "table"
    | "text";

  export interface IPattern {
    characterType: "single" | "multiple";
    type: patternType;
    open: string;
    close?: string;
  }

  export interface ITokenizer {
    type: patternType | string;
    level: number;
    child: "left" | "right";
    text: string;
  }

  export interface IToken {
    keywords: string[];
  }
}
