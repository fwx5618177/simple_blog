import ArticlePagination from "@/components/ArticlePagination";
import ArticlePost from "@/components/ArticlePost";
import { useEffect, useMemo, useState } from "react";
import { ArticleListDataArticles } from "../../../types/article";
import { Pagination } from "../../../types/Pagination";
import { useQuery } from "react-query";
import LoadAnime from "@/components/LoadAnime/LoadAnime";

const MainPage = () => {
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 20,
    pageSize: 6,
  });

  const { data, isLoading, isError } = useQuery(
    ["home", pagination?.current, pagination?.pageSize],
    () =>
      fetch(
        "/api/home" +
          `?pageNumber=${pagination?.current}&pageSize=${pagination?.pageSize}`
      ).then((res) => res.json()),
    {
      onSuccess: (res) => {
        const { total, current } = res;

        setPagination({
          ...pagination,
          total,
          current,
        });
      },
    }
  );

  const articleData: ArticleListDataArticles[] = useMemo(() => {
    return data?.data;
  }, [data]);

  const handlePagination = (page: number) => {
    setPagination({
      ...pagination,
      current: page,
    });
  };

  useEffect(() => {
    const { total, current } = data || {};

    if (total && current) {
      setPagination((prev) => ({
        ...prev,
        total,
        current,
      }));
    }
  }, [data]);

  if (isLoading) {
    return <LoadAnime />;
  }

  return (
    <>
      {isError ? (
        <p>Error occurred while fetching data</p>
      ) : (
        <>
          {articleData &&
            Array.isArray(articleData) &&
            articleData?.map((item, index) => (
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
      )}
    </>
  );
};

export default MainPage;
