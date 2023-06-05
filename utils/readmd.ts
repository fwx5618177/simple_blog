import { readFileSync } from "fs";

export const readMD = (md: string) => {
  try {
    let markdown = readFileSync(md, "utf-8");

    return markdown;
  } catch (err: any) {
    console.error("Error reading markdown file:", err);
    throw new Error("Error reading markdown file:", err.message);
  }
};
