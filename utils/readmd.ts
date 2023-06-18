import { readFileSync } from "fs";
import { marked } from "marked";
import { BASE_OUT_FILE_PATH } from "../constants/conf";
import {
  ArticleListDataArticles,
  ArticleListDataProps,
} from "../types/article";
import { DocContentTypes, DocDir } from "../types/doc";

export const readMD = (md: string) => {
  try {
    let markdown = readFileSync(md, "utf-8");

    return markdown;
  } catch (err: any) {
    console.error("Error reading markdown file:", err);
    throw new Error("Error reading markdown file:", err.message);
  }
};

export async function queryDocs(
  path = BASE_OUT_FILE_PATH
): Promise<ArticleListDataProps[]> {
  const list = readFileSync(path, "utf-8").toString();
  const data: DocDir[] = JSON.parse(list);

  const yearList = data.reduce((prev, curr) => {
    const year = curr.year;
    const findIndex = prev.findIndex((item) => item.year === year);
    const link = curr?.path?.replace(/\.md$/, "");

    if (findIndex === -1) {
      prev.push({
        year,
        title: curr.title,
        articles: [
          {
            title: curr.title,
            time: curr.time,
            tags: curr.tags,
            link: `/${link}`,
          },
        ],
      });
    } else {
      prev[findIndex].articles.push({
        title: curr.title,
        time: curr.time,
        tags: curr.tags,
        link: `/${link}`,
      });
    }

    return prev;
  }, [] as ArticleListDataProps[]);

  return yearList;
}

export async function queryDesc(
  path = BASE_OUT_FILE_PATH
): Promise<ArticleListDataArticles[]> {
  const list = readFileSync(path, "utf-8").toString();
  const data: DocContentTypes[] = JSON.parse(list);

  const descList = data?.map((item) => {
    const desc = item?.instro;
    const link = item?.path?.replace(/\.md$/, "");

    return {
      title: item.title,
      time: item.time,
      tags: item.tags,
      desc,
      link: `/${link}`,
      blockquote: item?.blockquote,
    };
  });

  return descList;
}

export async function queryMdDocs(
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
  const content = marked.parse(fileContent, {
    mangle: false,
    headerIds: false,
  });

  return {
    ...findData,
    content,
  };
}
