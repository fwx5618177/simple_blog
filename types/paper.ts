export type PaperPageSize = "sm" | "base" | "lg" | "xl";

export interface PaperProps {
  title: string;
  time: string;
  children?: React.ReactNode;
  pageSize?: PaperPageSize;
}
