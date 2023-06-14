import fs from "fs";
import { marked } from "marked";

class Instro {
  public content: string[] = [];
  public language: string = "zh";
  public instro: string = "";

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

  public extractInstro(end: number = 3) {
    this.instro = this.content.slice(0, end).join("\n");
  }

  public render() {
    return marked.parse(this.instro);
  }
}

export default Instro;
