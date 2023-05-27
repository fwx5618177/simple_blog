import { ArticleListDataProps, ArticleListProps } from "../../../types/article";
import dayjs from "dayjs";
import ArticlePagination from "../ArticlePagination";
import { useState } from "react";
import { BsFillTagFill, BsCalendarDate } from "react-icons/bs";

const ArticleList: React.FC<ArticleListProps> = ({}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const list: ArticleListDataProps[] = [
    {
      year: 2021,
      title: "2021年度总结",
      articles: [
        {
          title: "111",
          time: dayjs(),
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

  return (
    <>
      <section className="bg-[#fff] rounded-[6px]">
        {list?.map((item, index) => (
          <section
            key={index}
            className={`relative w-full ${
              index === list?.length - 1
                ? ""
                : "border-b-[1px] border-dashed border-primary"
            }`}
          >
            <div className="w-[200px] absolute text-xl font-primary text-primary py-[20px] pl-[60px]">
              <a href="">2020</a>
            </div>
            {item?.articles.map((citem, cindex) => (
              <article
                key={cindex}
                className={`relative h-[100px] ml-[220px] mr-[60px] py-[20px] ${
                  cindex === item?.articles?.length - 1
                    ? ""
                    : "border-b-[1px] border-solid border-primary"
                }`}
              >
                <div className="min-h-[36px] flex flex-row justify-between mx-8 text-forth">
                  <h1>{citem?.title}</h1>
                  <p className="flex flex-row gap-2">
                    <BsCalendarDate className="text-secondary" />
                    <time
                      dateTime={dayjs(citem?.time)?.format("YYYY-MM-DD HH:mm")}
                    >
                      {dayjs(citem?.time).format("YYYY-MM-DD HH:mm")}
                    </time>
                  </p>
                </div>
                {Array.isArray(citem?.tags) && citem?.tags.length > 0 && (
                  <div className="flex justify-end items-center mr-[40px] mt-[8px]">
                    <BsFillTagFill className="text-secondary rotate-[-20deg]" />
                    {citem?.tags?.map((tag, tIndex) => (
                      <a
                        className={`ml-4 px-4 py-[0.5px] rounded-[6px] text-default text-sm`}
                        style={{
                          backgroundColor: tag?.color,
                        }}
                        key={tIndex}
                        href={tag?.href}
                      >
                        {tag?.name}
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </section>
        ))}
      </section>
      <ArticlePagination
        currentPage={currentPage}
        totalPages={20}
        onNextPage={(page) => setCurrentPage(page)}
        onPrevPage={(page) => setCurrentPage(page)}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  );
};

export default ArticleList;
