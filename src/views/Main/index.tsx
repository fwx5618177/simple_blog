import ArticlePost from "@/components/ArticlePost";
import Paper from "@/components/Paper";
import dayjs from "dayjs";

const MainPage = () => {
  return (
    <ArticlePost
      title={"第一篇文章"}
      time={dayjs().toString()}
      blockquote={"1213133".repeat(10000)}
    >
      111
    </ArticlePost>
  );
};

export default MainPage;
