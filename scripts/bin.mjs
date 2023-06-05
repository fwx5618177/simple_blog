import { BASE_OUT_FILE_PATH, BASE_IN_FILE_PATH } from "../constants/conf.mjs";
import { writeToFile, readFile } from "../utils/readFile.mjs";
import { statSync } from "fs";

const generateJson = () => {
  const jsonData = readFile(BASE_IN_FILE_PATH);

  const fileList = JSON.parse(jsonData)?.map((file) => {
    const stats = statSync(file.path);

    return {
      title: file?.title,
      path: file?.path,
      tags: file?.tags,
      time: stats.birthtime.toJSON(),
    };
  });

  writeToFile(BASE_OUT_FILE_PATH, fileList);
};

generateJson();
