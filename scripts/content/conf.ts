import type { ExtractType } from "./ExtractType";

export const chileCharacter: RegExp = /[\u4e00-\u9fa5]/g; // [\u4e00-\u9fa5] 是表示汉字范围的 Unicode 范围
export const fullWidth: RegExp = /[\uFF00-\uFFFF]/g; //表示全角字符范围的 Unicode 范围

export const pattern: ExtractType.IPattern[] = [
  {
    characterType: "single",
    type: "h1",
    open: "#",
  },
  {
    characterType: "single",
    type: "h2",
    open: "##",
  },
  {
    characterType: "single",
    type: "h3",
    open: "###",
  },
  {
    characterType: "single",
    type: "h4",
    open: "####",
  },
  {
    characterType: "single",
    type: "h5",
    open: "#####",
  },
  {
    characterType: "single",
    type: "h6",
    open: "######",
  },
  {
    characterType: "single",
    type: "li",
    open: "-",
  },
  {
    characterType: "single",
    type: "li",
    open: "*",
  },
  {
    characterType: "multiple",
    type: "code",
    open: "```",
    close: "```",
  },
  {
    characterType: "multiple",
    type: "bold",
    open: "**",
    close: "**",
  },
];

export const tokenizer: ExtractType.IToken = {
  keywords: [
    "#",
    "##",
    "###",
    "####",
    "#####",
    "######",
    "*",
    "-",
    "`",
    "```",
    "**",
  ],
};
