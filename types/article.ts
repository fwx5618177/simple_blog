import dayjs from "dayjs";
import { DocDir } from "./doc";

export interface ArticleListProps {}

export type ArticlePaginationProps = {
  currentPage: number;
  pageSize: number;
  total: number;
  onNextPage: (page: any) => void;
  onPrevPage: (page: any) => void;
  onPageChange: (page: any) => void;
};

export type ArticleListDataArticles = {
  title: string;
  time: string | dayjs.Dayjs;
  tags?: ArticleListDataTags[];
  desc?: string;
  link?: string;
  blockquote?: string;
};

export type ArticleListDataTags = {
  name: string;
  color: string;
  href: string;
};
export interface ArticleListDataProps {
  year: number | string;
  title: string;
  articles: ArticleListDataArticles[];
}
