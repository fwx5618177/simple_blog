import { FC } from "react";
import { SearchListProps } from "../../../types/searchList";
import dayjs from "dayjs";
import { BsFillTagFill, BsCalendarDate } from "react-icons/bs";

const SearchList: FC<SearchListProps> = ({ data }) => {
  return (
    <div className="relative flex flex-col items-start justify-center w-full gap-1 text-default">
      {data.map((item, index) => (
        <div
          key={index}
          className="border-dashed border-b-[0.5px] border-primary w-full px-5 py-1 flex flex-col justify-around gap-1 hover:bg-hoverSelect"
        >
          <a
            className="whitespace-nowrap overflow-x-hidden text-ellipsis max-w-[200px]"
            href="/"
          >
            <span className="text-xl text-left before:content-['“']">{`${item?.title}_${index}`}</span>
          </a>
          <footer className="flex flex-row items-center gap-2 mb-2">
            <time
              className="flex flex-row items-center gap-2"
              dateTime={dayjs(item?.time).format("YYYY-MM-DD HH:mm")}
            >
              <BsCalendarDate className="text-default" />
              {dayjs(item?.time).format("YYYY-MM-DD HH:mm")}
            </time>
            <p className="flex flex-row items-center gap-2 text-center">
              <BsFillTagFill className="text-default rotate-[-20deg]" />
              <a href="/">{`#${item?.type}`}</a>
            </p>
          </footer>
        </div>
      ))}
    </div>
  );
};

export default SearchList;
