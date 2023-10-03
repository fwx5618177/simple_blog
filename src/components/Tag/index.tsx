import { FC, useRef, useMemo, useEffect } from "react";
import { TagProps } from "../../../types/tag";
import styles from "@/styles/style.module.scss";
import styled from "styled-components";

const Tag: FC<TagProps> = ({
  label = "primary",
  color = "#3b82f6",
  link = "/",
  tailwind = false,
}) => {
  const aRef = useRef<HTMLAnchorElement>(null);

  const bgClass = `bg-${tailwind ? color : `[${color}]`}`;
  const beforeClass = `before:border-r-${tailwind ? color : `[${color}]`} `;

  const StyledAnchor = styled.a`
    background-color: ${color};

    &::before {
      border-right-color: ${color};
    }
  `;

  return (
    <StyledAnchor
      ref={aRef}
      href={link}
      className={`inline-block mx-2 my-1 relative text-default text-center hover:bg-hoverSelect rounded-[4px] ${styles.tagSet} ${bgClass} ${beforeClass} before:hover:border-r-[#4d637f33]`}
    >
      {label}
    </StyledAnchor>
  );
};

export default Tag;
