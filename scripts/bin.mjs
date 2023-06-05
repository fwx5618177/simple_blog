import { BASE_OUT_FILE_PATH, BASE_IN_FILE_PATH } from "../constants/conf.mjs";
import { writeToFile, readFile } from "../utils/readFile.mjs";
import { statSync } from "fs";

const generateJson = () => {
  const json = readFile(BASE_IN_FILE_PATH);

  const jsonData = JSON.parse(json);

  const fileList = jsonData?.map((file) => {
    const stats = statSync(file.path);
    const tags = file?.tags?.map((tag) => ({
      ...tag,
      href: `/tags/${tag.name}`,
    }));

    return {
      year: file?.year,
      title: file?.title,
      path: file?.path,
      tags: tags,
      time: stats.birthtime.toJSON(),
    };
  });

  writeToFile(BASE_OUT_FILE_PATH, fileList);
};

generateJson();
