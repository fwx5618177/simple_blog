"use server";

import { marked } from "marked";
import { DocContentTypes, DocDir } from "../../../../types/doc";
import { readMD } from "../../../../utils/readmd";
import { readFileSync } from "fs";
import { BASE_OUT_FILE_PATH } from "../../../../constants/conf";

export async function queryDocs(
  path: string = "instro"
): Promise<DocContentTypes | undefined> {
  const dirName = `docs/${path}.md`;
  const fileData = readFileSync(BASE_OUT_FILE_PATH).toString();
  const findData = JSON.parse(fileData)?.find(
    (item: DocDir) => item?.path === dirName
  );

  if (!findData) {
    return undefined;
  }
  const fileContent = readMD(dirName);
  const content = marked.parse(fileContent);

  return {
    ...findData,
    content,
  };
}
