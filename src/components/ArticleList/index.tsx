"use client";

import { ArticleListDataProps, ArticleListProps } from "../../../types/article";
import dayjs from "dayjs";
import ArticlePagination from "../ArticlePagination";
import { useState } from "react";
import { BsFillTagFill, BsCalendarDate } from "react-icons/bs";
import { articleList } from "@/mock/article.mock";
import { Pagination } from "../../../types/Pagination";
import { useQuery } from "react-query";
import LoadAnime from "../LoadAnime/LoadAnime";

const ArticleList: React.FC<ArticleListProps> = () => {
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 20,
    pageSize: 6,
  });

  const { data, isLoading } = useQuery<{
    data: ArticleListDataProps[];
    total: number;
    current: number;
  }>(
    ["list", pagination],
    async () => {
      const response = await fetch("/api/list", {
        method: "POST",
        body: JSON.stringify({
          pagination,
        }),
      });

      const { data, total, current } = await response.json();

      return {
        data,
        total,
        current,
      };
    },
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

  const handlePagination = (page: number) => {
    setPagination({
      ...pagination,
      current: page,
    });
  };

  if (isLoading) {
    return <LoadAnime />;
  }

  return (
    <>
      <section className="bg-[#fff] rounded-[6px] min-h-sm">
        {data?.data?.map((item, index) => (
          <section
            key={index}
            className={`relative w-full ${
              index === articleList?.length - 1
                ? ""
                : "border-b-[1px] border-dashed border-secondary"
            }`}
          >
            <div className="w-[200px] absolute text-xl font-primary text-primary py-[20px] pl-[60px]">
              <a href={`/year/${item?.year}`}>{item?.year}</a>
            </div>
            {item?.articles.map((citem, cindex) => (
              <article
                key={cindex}
                className={`relative h-[100px] ml-[220px] mr-[60px] py-[20px] ${
                  cindex === item?.articles?.length - 1
                    ? ""
                    : "border-b-[1px] border-solid border-secondary"
                }`}
              >
                <div className="min-h-[36px] flex flex-row justify-between mx-8 text-forth">
                  <h1>
                    <a href={citem?.link}>{citem?.title}</a>
                  </h1>
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
        currentPage={pagination?.current}
        pageSize={pagination?.pageSize}
        total={pagination?.total}
        onNextPage={handlePagination}
        onPrevPage={handlePagination}
        onPageChange={handlePagination}
      />
    </>
  );
};

export default ArticleList;
