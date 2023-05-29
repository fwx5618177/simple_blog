"use client";

import { FC, useState } from "react";
import { MidSectionProps } from "../../../types/sideBar";
import { useBase } from "@/contexts/BaseProvider";
import Search from "../Search";
import CheckBox from "../CheckBox";
import SearchList from "../SearchList";
import { ArticleListDataArticles } from "../../../types/article";
import dayjs from "dayjs";
import Tag from "../Tag";
import { TagProps } from "../../../types/tag";

const MidSection: FC<MidSectionProps> = ({}) => {
  const { isMidOpen } = useBase();
  const [isShowTag, setIsShowTag] = useState<boolean>(true);

  const data: ArticleListDataArticles[] = new Array(100).fill({
    title: "title is the test title of the test",
    time: dayjs(),
    type: "article",
    tags: [
      {
        name: "tag1",
        color: "red",
        href: "/",
      },
      {
        name: "tag2",
        color: "blue",
        href: "/",
      },
    ],
  });

  const tags: TagProps[] = [
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1tag1tag1tag1tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
    {
      label: "tag1",
      color: "#3a3a3a",
      link: "/",
      tailwind: true,
    },
  ];

  return (
    <div
      className={`relative ${
        isMidOpen ? "w-[380px]" : "w-0"
      } h-full transition-all duration-700 ease-in-out overflow-x-hidden`}
    >
      {isMidOpen && (
        <>
          <header className="flex flex-col items-center justify-center gap-5 mt-5">
            <Search />
            <CheckBox
              status={isShowTag}
              onChange={(value) => setIsShowTag(value)}
            />
          </header>
          <div className="w-full h-full mt-5 overflow-y-auto transition-all duration-700 ease-in-out">
            <section
              className={`overflow-x-hidden bg-tagsShow p-[10px] mx-[10px] my-[15px] ${
                isShowTag ? "block" : "hidden"
              }`}
            >
              {tags?.map((item, index) => (
                <Tag
                  key={index}
                  link={item?.link}
                  label={item?.label}
                  color={item?.color}
                  tailwind={item?.tailwind}
                />
              ))}
            </section>

            <SearchList data={data} />
          </div>
        </>
      )}
    </div>
  );
};

export default MidSection;
