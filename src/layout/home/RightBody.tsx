"use client";
import { useBase } from "@/contexts/BaseProvider";
import { RightBodyBgStyle } from "@/setting/conf";
import { ReactNode, FC } from "react";

const RightBody: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { isMidOpen } = useBase();

  return (
    <div
      className={`relative flex flex-1 ${
        isMidOpen ? ` ${RightBodyBgStyle?.blue?.bg}` : ""
      }`}
    >
      {children}
    </div>
  );
};

export default RightBody;
