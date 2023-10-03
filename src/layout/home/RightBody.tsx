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
      className={`relative flex px-2 ${
        isMidOpen ? ` ${RightBodyBgStyle?.blue?.bg}` : ""
      }`}
      style={{
        width: "calc(100vw - 300px)",
        left: "300px",
      }}
    >
      {children}
    </div>
  );
};

export default RightBody;
