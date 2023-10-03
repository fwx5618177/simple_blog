"use client";

import { useRef } from "react";

const Comments = () => {
  const divRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-10 h-[500px]">
      <div className="bg-[#fff] w-full h-full my-5"></div>
    </div>
  );
};

export default Comments;
