import { FC } from "react";
import { PaperProps } from "../../../types/paper";
import dayjs from "dayjs";
import { BsCalendarDate } from "react-icons/bs";
import { getContentSize } from "../../../utils/helper";

const Paper: FC<PaperProps> = ({
  title = "title",
  time = new Date(),
  children,
  pageSize = "base",
}) => {
  const size = `min-h-${pageSize}`;

  return (
    <article
      className={`shadow-xl ${size} bg-paper m-5 border-default border-[1px] border-solid border-l-0 border-t-0 border-t-primary border-b-primary rounded-[4px] transition-all duration-700 ease`}
    >
      <header className="text-primary w-full h-[80px] border-secondary border-l-[5px] border-solid flex flex-row justify-between items-center px-10">
        <h1 className="font-bold text-title">{title}</h1>
        <a href="/">
          <time
            className="flex flex-row items-center gap-2 text-lg"
            dateTime={dayjs(time).format("YYYY-MM-DD HH:mm:ss")}
          >
            <BsCalendarDate className="text-primary" />
            {dayjs(time).format("YYYY-MM-DD HH:mm:ss")}
          </time>
        </a>
      </header>
      <div className={`mx-10 my-5 text-lg text-primary`}>{children}</div>
    </article>
  );
};

export default Paper;
