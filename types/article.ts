export interface ArticleListProps {}

export type ArticlePaginationProps = {
  currentPage: number;
  totalPages: number;
  onNextPage: (page: any) => void;
  onPrevPage: (page: any) => void;
  onPageChange: (page: any) => void;
};
