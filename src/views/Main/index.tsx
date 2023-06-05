import ArticlePagination from "@/components/ArticlePagination";
import ArticlePost from "@/components/ArticlePost";
import { ArticleList } from "@/mock/view.main.mock";
import { useEffect, useState } from "react";
import { ArticleListDataArticles } from "../../../types/article";
import { Pagination } from "../../../types/Pagination";

const MainPage = () => {
  const [data, setData] = useState<ArticleListDataArticles[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 20,
    pageSize: 6,
  });

  const handlePagination = (page: number) => {
    setPagination({
      ...pagination,
      current: page,
    });
  };

  const queryData = async () => {
    const response = await fetch("/api/home");
    const { data, total, current } = await response.json();

    console.log(data);

    setData(data);
    setPagination({
      ...pagination,
      total,
      current,
    });
  };

  useEffect(() => {
    queryData();
  }, []);

  return (
    <>
      {data?.map((item, index) => (
        <ArticlePost
          key={index}
          title={item?.title}
          time={item?.time.toString()}
          blockquote={item?.blockquote}
          pageSize="sm"
          link={item?.link}
        >
          {item?.desc}
        </ArticlePost>
      ))}
      <footer>
        <ArticlePagination
          currentPage={pagination?.current}
          pageSize={pagination?.pageSize}
          total={pagination?.total}
          onNextPage={handlePagination}
          onPrevPage={handlePagination}
          onPageChange={handlePagination}
        />
      </footer>
    </>
  );
};

export default MainPage;
