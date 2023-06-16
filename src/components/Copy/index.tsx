import ClipboardJS from "clipboard";
import { FC, useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import { FcOk, FcHighPriority } from "react-icons/fc";

type CopyProps = {
  text: string;
  onCopy?: (value: string) => void;
  children: React.ReactNode | string;
};

const Copy: FC<CopyProps> = ({ text, onCopy, children }) => {
  const spanRef = useRef<HTMLDivElement>(null);
  const [status, setStatue] = useState<"success" | "error" | "default">(
    "default"
  );

  const handleCopy = () => {
    const clipboard = new ClipboardJS(spanRef.current as any, {
      text: () => text,
    });

    clipboard.on("success", () => {
      onCopy?.(text);
      setStatue("success");

      setTimeout(() => {
        setStatue("default");
      }, 3000);

      clipboard.destroy();
    });

    clipboard.on("error", () => {
      setStatue("error");

      setTimeout(() => {
        setStatue("default");
      }, 3000);

      clipboard.destroy();
    });
  };

  useEffect(() => {
    spanRef.current?.click();
  }, []);

  return (
    <div
      className={`relative w-full h-full ${styles.copied} flex items-center justify-center`}
      ref={spanRef}
      onClick={handleCopy}
    >
      {status === "success" ? (
        <FcOk />
      ) : status === "error" ? (
        <FcHighPriority />
      ) : (
        children
      )}
    </div>
  );
};

export default Copy;
