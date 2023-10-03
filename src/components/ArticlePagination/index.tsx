import React, { FC } from "react";
import { ArticlePaginationProps } from "../../../types/article";
import styles from "@/styles/style.module.scss";

const ArticlePagination: FC<ArticlePaginationProps> = ({
  currentPage,
  pageSize,
  total,
  onNextPage,
  onPrevPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const generatePaginationArray = (current: number, total: number): any[] => {
    if (total <= 1) {
      return [1];
    }

    const pages = Array.from({ length: total }, (_, index) => index + 1);

    if (total <= 4) {
      return pages;
    }

    if (current <= 3) {
      return [...pages.slice(0, current + 1), "...", total];
    } else if (current >= 4 && current <= total - 3) {
      return [1, "...", ...pages.slice(current - 2, current + 1), "...", total];
    } else if (current > total - 3) {
      return [1, "...", ...pages.slice(current - 3, total)];
    }

    return pages;
  };

  const renderPagination = () => {
    const pageNumbers = generatePaginationArray(currentPage, totalPages);

    return pageNumbers.map((pageNumber, index) => (
      <span
        key={`${pageNumber}_${index}`}
        className={`px-4 py-2 ml-2 rounded-md text-default ${
          pageNumber === currentPage
            ? "bg-select hover:bg-hoverSelect cursor-pointer"
            : pageNumber !== "..."
            ? "bg-unSelect hover:bg-hoverUnSelect cursor-pointer"
            : "bg-default cursor-not-allowed"
        }`}
        onClick={() => {
          if (pageNumber !== "...") {
            onPageChange(pageNumber);
          }
        }}
      >
        {pageNumber}
      </span>
    ));
  };

  return (
    <nav className="flex items-center justify-center mt-4">
      <button
        className={`w-[100px] h-[40px] ml-2 bg-blue-500 rounded-md text-default ${
          currentPage <= 1 ? "cursor-not-allowed" : "cursor-pointer"
        } ${styles.buttonActive}`}
        disabled={currentPage === 1}
        onClick={() => {
          if (currentPage > 1) onPrevPage(currentPage - 1);
          else onPrevPage(1);
        }}
      >
        {"<< Prev"}
      </button>

      {renderPagination()}

      <button
        className={`w-[100px] h-[40px] ml-2 bg-blue-500 rounded-md text-default ${
          currentPage >= totalPages ? "cursor-not-allowed" : "cursor-pointer"
        } ${styles.buttonActive}`}
        disabled={currentPage === totalPages}
        onClick={() => {
          if (currentPage < totalPages) onNextPage(currentPage + 1);
          else onNextPage(totalPages);
        }}
      >
        {"Next >>"}
      </button>
    </nav>
  );
};

export default ArticlePagination;
