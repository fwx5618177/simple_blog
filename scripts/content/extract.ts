import fs from "fs";
import type { ExtractType } from "./ExtractType";
import { tokenizer } from "./conf";

class Extract {
  public content: string[] = [];
  public language: string = "zh";
  public tokens: ExtractType.ITokenizer[] = [];
  public ast: ExtractType.ITokenizer[] = [];
  public level = 0;

  constructor(
    fileName: string,
    type: "utf-8" | "ascii",
    language: "zh" | "en"
  ) {
    this.language = language;
    this.readFileSyncByLine(fileName, type);
  }

  public readFileSyncByLine(fileName: string, type: "utf-8" | "ascii") {
    const line = fs.readFileSync(fileName, type).split("\n");
    this.content = line.filter((line: string) => line.trim() !== "");
  }

  matchKeyWord(text: string) {
    const keywords = tokenizer.keywords;

    for (let keyword of keywords) {
      if (text.startsWith(keyword)) {
        return keyword;
      }
    }

    return null;
  }

  public tokenizer() {
    this.content.forEach((line: string) => {
      const keyword = this.matchKeyWord(line);
      const lineTrim = line.trim();

      if (keyword) {
        this.tokens.push({
          level: this.level,
          type: keyword,
          child: "left",
          text: lineTrim,
        });
      } else {
        this.tokens.push({
          level: this.level,
          type: "text",
          child: "right",
          text: lineTrim,
        });
      }
    });
  }

  parseToken() {
    this.tokens.forEach((token: ExtractType.ITokenizer) => {
      const { type, text } = token;

      switch (type) {
        case "#":
          this.ast.push({
            type: "h1",
            level: this.level,
            child: "left",
            text,
          });
          break;
        case "##":
          this.ast.push({
            type: "h2",
            level: this.level,
            child: "left",
            text,
          });
          break;
        case "###":
          this.ast.push({
            type: "h3",
            level: this.level,
            child: "left",
            text,
          });
          break;
        case "####":
          this.ast.push({
            type: "h4",
            level: this.level,
            child: "left",
            text,
          });
          break;
        case "#####":
          this.ast.push({
            type: "h5",
            level: this.level,
            child: "left",
            text,
          });
          break;
        case "######":
          this.ast.push({
            type: "h6",
            level: this.level,
            child: "left",
            text,
          });
          break;
        case "-":
        case "*":
          this.ast.push({
            type: "li",
            level: this.level,
            child: "left",
            text,
          });
          break;
        case "```":
          this.ast.push({
            type: "code",
            level: this.level,
            child: "left",
            text,
          });
          break;
        case "**":
          this.ast.push({
            type: "bold",
            level: this.level,
            child: "left",
            text,
          });
          break;
        default:
          this.ast.push({
            type: "text",
            level: this.level,
            child: "right",
            text,
          });
          break;
      }
    });
  }

  // 读取的文件内容，把从markdown每一行的内容去掉特殊字符，转换成特殊的字符
  //   public tokenizer() {
  //     let level = 0;
  //     let tokens: ExtractType.ITokenizer[] = [];

  //     this.content.forEach((line: string) => {
  //       const token = line?.trim();
  //       const headingRegex = /^#{1,6}/;
  //       const liRegex = /^(-|\*)/;

  //       if (headingRegex.test(token)) {
  //         const sequence: number = token.match(/^#{1,6}/)?.[0]?.length || 0;
  //         tokens.push({
  //           level,
  //           type: `h${sequence}` as ExtractType.heading,
  //           child: "left",
  //           text: token.replace(/^#{1,6}/, "").trim(),
  //         });
  //       } else if (liRegex.test(token)) {
  //       }
  //     });
  //   }

  public extractHeading(heading: string) {
    return heading?.replace(/^#{1,6}\s/, "").trim();
  }

  public extractText(text: string) {
    return text.trim();
  }

  render() {
    let result: string[] = [];

    for (let node of this.ast) {
      switch (node.type) {
        case "h1":
          result.push(`<h1>${node.text}</h1>`);
          break;
        case "h2":
          result.push(`<h2>${node.text}</h2>`);
          break;
        case "h3":
          result.push(`<h3>${node.text}</h3>`);
          break;
        case "h4":
          result.push(`<h4>${node.text}</h4>`);
          break;
        case "h5":
          result.push(`<h5>${node.text}</h5>`);
          break;
        case "h6":
          result.push(`<h6>${node.text}</h6>`);
          break;
        case "li":
          result.push(`<li>${node.text}</li>`);
          break;
        case "code":
          result.push(`<code>${node.text}</code>`);
          break;
        case "bold":
          result.push(`<strong>${node.text}</strong>`);
          break;
        default:
          result.push(`<p>${node.text}</p>`);
          break;
      }
    }
    return result;
  }
}

export default Extract;
