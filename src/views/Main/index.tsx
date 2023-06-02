import ArticlePagination from "@/components/ArticlePagination";
import ArticlePost from "@/components/ArticlePost";
import { ArticleList } from "@/mock/view.main.mock";
import { useState } from "react";

const MainPage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  return (
    <>
      {ArticleList?.map((item, index) => (
        <ArticlePost
          key={index}
          title={item?.title}
          time={item?.time}
          blockquote={item?.blockquote}
          pageSize="sm"
          link={item?.link}
        >
          {item?.desc}
        </ArticlePost>
      ))}
      <footer>
        <ArticlePagination
          currentPage={currentPage}
          totalPages={20}
          onNextPage={(page) => setCurrentPage(page)}
          onPrevPage={(page) => setCurrentPage(page)}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </footer>
    </>
  );
};

export default MainPage;
