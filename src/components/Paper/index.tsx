import { FC } from "react";
import { PaperProps } from "../../../types/paper";
import dayjs from "dayjs";
import { BsCalendarDate } from "react-icons/bs";

const Paper: FC<PaperProps> = ({
  title = "title",
  time = new Date(),
  children,
}) => {
  return (
    <article className="shadow-xl min-h-[60vh] bg-paper m-5 border-default border-[1px] border-solid border-t-primary border-b-primary rounded-[4px] transition-all duration-700 ease">
      <header className="text-primary w-full h-[80px] border-secondary border-l-[5px] border-solid flex flex-row justify-between items-center px-10">
        <h1 className="font-bold text-title">{title}</h1>
        <a href="/">
          <time
            className="flex flex-row items-center gap-2 text-lg"
            dateTime={dayjs(time).format("YYYY-MM-DD")}
          >
            <BsCalendarDate className="text-primary" />
            {dayjs(time).format("YYYY-MM-DD")}
          </time>
        </a>
      </header>
      <div className="mx-10 my-5 text-lg text-primary">{children}</div>
    </article>
  );
};

export default Paper;
