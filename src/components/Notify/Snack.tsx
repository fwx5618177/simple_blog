import React, { FC } from "react";

type SnackProps = {
  children?: React.ReactNode;
  open?: boolean;
};

const Snack: FC<SnackProps> = ({ children, open = false }) => {
  return (
    <div className="absolute max-h-[66vw] overflow-hidden right-5 top-5">
      {open && <div className="relative flex flex-col gap-2">{children}</div>}
    </div>
  );
};

export default Snack;
