"use client";

import { FC } from "react";
import { MidSectionProps } from "../../../types/sideBar";
import { useBase } from "@/contexts/BaseProvider";

const MidSection: FC<MidSectionProps> = ({}) => {
  const { isMidOpen } = useBase();

  return (
    <div
      className={`${
        isMidOpen ? "w-[380px]" : "w-0"
      } h-full transition-all duration-700 ease-in-out`}
    ></div>
  );
};

export default MidSection;
