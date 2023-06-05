import { join } from "path";
import { statSync, readdirSync, writeFileSync, readFileSync } from "fs";
import { BASE_DIR, BASE_OUT_FILE } from "../constants/conf.mjs";

export const readDir = (path = BASE_DIR) => {
  try {
    const files = readdirSync(path);

    const fileList = files.map((file) => {
      const filePath = join(path, file);
      const stats = statSync(filePath);

      return {
        title: file,
        path: filePath,
        time: stats?.birthtime?.toString(),
        tags: [],
        year: file.year,
      };
    });

    return fileList;
  } catch (err) {
    throw new Error("Generate list error:", err?.message);
  }
};

export const writeToFile = (path = BASE_OUT_FILE_PATH, data) => {
  try {
    const jsonData = JSON.stringify(data);
    writeFileSync(path, jsonData, "utf-8");
  } catch (err) {
    throw new Error("File error:", err?.message);
  }
};

export const readFile = (path = BASE_IN_FILE_PATH) => {
  try {
    const jsonData = readFileSync(path).toString();

    return jsonData;
  } catch (err) {
    throw new Error("ReadFile error:", err?.message);
  }
};
