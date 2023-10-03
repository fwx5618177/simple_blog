import { join } from "path";
import { statSync, readdirSync, writeFileSync, readFileSync } from "fs";
import {
  BASE_DIR,
  BASE_IN_FILE_PATH,
  BASE_OUT_FILE,
  BASE_OUT_FILE_PATH,
} from "../../constants/conf";

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
        year: (file as any)?.year,
      };
    });

    return fileList;
  } catch (err: Error | any) {
    throw new Error("Generate list error:", err?.message);
  }
};

export const writeToFile = (path = BASE_OUT_FILE_PATH, data: any) => {
  try {
    const jsonData = JSON.stringify(data);
    writeFileSync(path, jsonData, "utf-8");
  } catch (err: any) {
    throw new Error("File error:", err?.message);
  }
};

export const readFile = (path = BASE_IN_FILE_PATH) => {
  try {
    const jsonData = readFileSync(path).toString();

    return jsonData;
  } catch (err: any) {
    throw new Error("ReadFile error:", err?.message);
  }
};
