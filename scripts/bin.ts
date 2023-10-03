import { BASE_OUT_FILE_PATH, BASE_IN_FILE_PATH } from "../constants/conf";
import { writeToFile, readFile } from "../src/utils/readFile";
import { statSync } from "fs";
import Instro from "./content/instro";

const generateJson = () => {
  const json = readFile(BASE_IN_FILE_PATH);

  const jsonData = JSON.parse(json);

  const fileList = jsonData?.map((file: any) => {
    const stats = statSync(file.path);
    const tags = file?.tags?.map((tag: any) => ({
      ...tag,
      href: `/tags/${tag.key}`,
    }));
    const instro = new Instro(file.path, "utf-8", "zh");
    instro.extractInstro(4);

    return {
      year: file?.year,
      title: file?.title,
      path: file?.path,
      tags: tags,
      time: stats.birthtime.toJSON(),
      instro: instro.render(),
    };
  });

  writeToFile(BASE_OUT_FILE_PATH, fileList);
};

generateJson();
