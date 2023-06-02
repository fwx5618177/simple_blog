import ArticlePost from "@/components/ArticlePost";
import { ArticleList } from "@/mock/view.main.mock";
import { Suspense } from "react";

const MainPage = () => {
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
    </>
  );
};

export default MainPage;
