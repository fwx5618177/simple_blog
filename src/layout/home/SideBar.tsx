"use client";

import Image from "next/image";
import { SideBarProps } from "../../../types/sideBar";
import { FC, useState } from "react";
import { useBase } from "@/contexts/BaseProvider";
import { FaGithubSquare, FaEnvelope } from "react-icons/fa";

const menuList = [
  {
    name: "首页",
    path: "/",
  },
  {
    name: "目录",
    path: "/list",
  },
  {
    name: "关于",
    path: "/about",
  },
];

const SideBar: FC<SideBarProps> = ({}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { setIsMidOpen, isMidOpen } = useBase();

  const openMidSection = () => {
    setIsOpen(!isOpen);
    setIsMidOpen(!isOpen || !isMidOpen);
  };

  return (
    <div className="fixed h-full shadow-md min-w-[280px] w-[300px] bg-[#fff] z-40">
      <div className="text-base">
        <div className="w-full h-[160px] bg-[#4d4d4d]"></div>
        <div className="mt-[-75px]">
          <div className="h-[200px] w-full flex items-center justify-center">
            <div className="w-[80%] h-full flex items-center justify-center">
              <a className="w-[200px] h-[200px] rounded-[50%] my-0 mx-[auto] border-[5px] border-[#fff]">
                <Image
                  priority
                  src="/fatBlack.JPG"
                  alt=""
                  width={200}
                  height={200}
                  className="h-full w-full rounded-[50%] object-cover rotate-[20deg] transform-gpu hover:rotate-0 transition-all duration-500 ease-in-out cursor-pointer"
                />
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto my-0 text-center">
          <hgroup className="text-title text-primary">
            <a href="/">莫西</a>
          </hgroup>
          <p className="text-secondary text-ellipsis my-[2rem] text-lg">
            “踏踏实实做事”
          </p>
        </div>

        <nav className="text-center text-secondary">
          <ul>
            {menuList?.map((item, index) => (
              <li key={index} className="py-2 text- hover:text-hoverPrimary">
                <a href={item?.path}>{item?.name}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="text-sm my-[2rem] flex justify-center gap-2 text-secondary">
          {/* <a
            className="cursor-pointer hover:text-hoverPrimary"
            onClick={openMidSection}
          >
            推荐
          </a>
          / */}
          <a
            className="cursor-pointer hover:text-hoverPrimary"
            onClick={openMidSection}
          >
            搜索
          </a>
          {">>"}
        </nav>

        <nav className="flex flex-row items-center justify-center gap-2 text-secondary">
          <a
            target="_blank"
            title="github"
            href="https://github.com/fwx5618177"
          >
            <FaGithubSquare className="cursor-pointer text-primary hover:text-hoverPrimary" />
          </a>
          <a
            title="email"
            target="_blank"
            href="mailto:fengwenxuan2006@126.com"
          >
            <FaEnvelope className="cursor-pointer text-primary hover:text-hoverPrimary" />
          </a>
        </nav>
      </div>
    </div>
  );
};

export default SideBar;
