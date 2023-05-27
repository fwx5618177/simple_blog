"use client";

import { FC, ReactNode, createContext, useContext, useState } from "react";
import { BaseContextProp } from "../../types/contexts";

export const BaseContext = createContext<BaseContextProp>(
  {} as BaseContextProp
);

export const useBase = () => {
  return useContext(BaseContext);
};

export const BaseProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isMidOpen, setIsMidOpen] = useState<boolean>(false);
  return (
    <BaseContext.Provider
      value={{
        isMidOpen,
        setIsMidOpen,
      }}
    >
      {children}
    </BaseContext.Provider>
  );
};
