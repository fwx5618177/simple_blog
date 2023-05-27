import dayjs from "dayjs";

export interface ArticleListProps {}

export type ArticlePaginationProps = {
  currentPage: number;
  totalPages: number;
  onNextPage: (page: any) => void;
  onPrevPage: (page: any) => void;
  onPageChange: (page: any) => void;
};

export type ArticleListDataArticles = {
  title: string;
  time: string | dayjs.Dayjs;
  tags?: ArticleListDataTags[];
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
