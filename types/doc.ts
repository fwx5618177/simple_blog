import { ArticleListDataTags } from "./article";

export interface DocBase {
  year: string;
  title: string;
  path: string;
  tags: ArticleListDataTags[];
}

export interface DocDir extends DocBase {
  time: string;
}

export type DocContentTypes = {
  tags: ArticleListDataTags[];
  title: string;
  time: string;
  content: string;
  blockquote?: string;
  path?: string;
  instro?: string;
};
