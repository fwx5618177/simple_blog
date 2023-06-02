import dayjs from "dayjs";
import { ArticleListDataProps } from "../../types/article";

export const articleList: ArticleListDataProps[] = [
  {
    year: 2021,
    title: "2021年度总结",
    articles: [
      {
        title: "111",
        time: dayjs(),
        type: "article",
        tags: [
          {
            name: "JavaScript",
            color: "#aa3aaa",
            href: "/",
          },
          {
            name: "PHP",
            color: "#aa3aaa",
            href: "/",
          },
          {
            name: "JS",
            color: "#aa3aaa",
            href: "/",
          },
        ],
      },
      {
        title: "111",
        time: dayjs().format("YYYY-MM-DD"),
      },
      {
        title: "111",
        time: dayjs().format("YYYY-MM-DD"),
      },
    ],
  },
  {
    year: 2022,
    title: "2022年度总结",
    articles: [
      {
        title: "111",
        time: dayjs().format("YYYY-MM-DD"),
      },
      {
        title: "111",
        time: dayjs().format("YYYY-MM-DD"),
      },
      {
        title: "111",
        time: dayjs().format("YYYY-MM-DD"),
      },
    ],
  },
];
