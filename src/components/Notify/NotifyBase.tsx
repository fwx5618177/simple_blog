"use client";

import { FC } from "react";
import { ALERT_SEVERITY, NotifyProps } from "../../../types/alert";
import { AiOutlineClose } from "react-icons/ai";
import { NotifyColorDynamic, getAlertColor } from "../../../utils/helper";
import Duration from "./Duration";

const NotifyBase: FC<NotifyProps> = ({
  theme = "dark",
  title = "title",
  children,
  position = "top",
  type = ALERT_SEVERITY.SUCCESS,
  duration = 5000,
  onClose,
}) => {
  const themeClass =
    theme === "light" ? "bg-light text-primary" : "bg-dark text-default";
  const removeIconClass = theme === "light" ? "#696969" : "#fff";
  const topClass = position === "top" ? "top-2" : "bottom-0";
  const color = getAlertColor(type);
  const realColor = NotifyColorDynamic[type];
  const textColor = `text-${color}`;
  const bgColor = `before:bg-${color}`;
  const borderClass = `before:content-[''] before:absolute before:top-0 before:left-0 before:w-[0.4rem] before:h-[100%] before:rounded-tl-[6px] before:rounded-bl-[6px] ${bgColor}`;

  return (
    <div
      className={`z-50 w-[25rem] h-[12rem] rounded-[6px] ${themeClass} ${topClass}`}
    >
      <div className={`relative h-[12rem] px-1 py-1 text-lg ${borderClass}`}>
        <header className="relative w-full h-[4rem] px-5 py-2">
          <h1
            className={`text-xl font-bold ${textColor}`}
            style={{
              color: realColor,
            }}
          >
            {title}
          </h1>
          <AiOutlineClose
            className="absolute top-0 right-0 text-xl cursor-pointer hover:text-secondary"
            style={{
              color: removeIconClass,
            }}
            onClick={onClose}
          />
        </header>
        <div className="w-full px-5 break-all max-h-[7rem] overflow-y-auto h-[7rem]">
          {children}
        </div>
        <div className="bottom-0 left-0 right-0 w-full">
          <Duration duration={duration / 1000} severity={type} />
        </div>
      </div>
    </div>
  );
};

export default NotifyBase;
