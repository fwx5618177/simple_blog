"use client";

import { FC } from "react";
import { MidSectionProps } from "../../../types/sideBar";
import { useBase } from "@/contexts/BaseProvider";
import Search from "../Search";

const MidSection: FC<MidSectionProps> = ({}) => {
  const { isMidOpen } = useBase();

  return (
    <div
      className={`relative ${
        isMidOpen ? "w-[380px]" : "w-0"
      } h-full transition-all duration-700 ease-in-out`}
    >
      {isMidOpen && (
        <header className="flex items-center justify-center mt-5">
          <Search />
        </header>
      )}
    </div>
  );
};

export default MidSection;
