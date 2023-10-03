import { FC, useEffect, useMemo, useState } from "react";
import { DurationProps } from "../../../types/alert";
import { getAlertColor } from "../../utils/helper";

const Duration: FC<DurationProps> = ({ duration = 2, severity }) => {
  const bgClass = useMemo(() => `bg-${getAlertColor(severity)}`, [severity]);
  const [width, setWidth] = useState(100);

  useEffect(() => {
    setWidth(0);
  }, []);

  return (
    <div
      className={`mx-2 h-[2px] transition-width ease-out ${bgClass}`}
      style={{
        width: `${width}%`,
        transition: `width ${duration}s ease-out`,
      }}
    ></div>
  );
};

export default Duration;
