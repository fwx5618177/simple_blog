import { FC, useEffect, useState } from "react";
import { DurationProps } from "../../../types/alert";
import { getAlertColor } from "@/utils/helper";

const Duration: FC<DurationProps> = ({ duration = 2, severity }) => {
  const color = getAlertColor(severity);
  const bgClass = `bg-${color}`;
  const [width, setWidth] = useState(100);

  useEffect(() => {
    setWidth(0);
  }, []);

  return (
    <div
      className={`h-[2px] transition-width ease-out ${bgClass}`}
      style={{
        width: `${width}%`,
        transition: `width ${duration}s ease-out`,
      }}
    ></div>
  );
};

export default Duration;
