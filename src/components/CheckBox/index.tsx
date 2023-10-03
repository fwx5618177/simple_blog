import styles from "@/styles/style.module.scss";
import { FC } from "react";
import { CheckBoxProps } from "../../../types/checkBox";

const CheckBox: FC<CheckBoxProps> = ({ label, status, onChange }) => {
  return (
    <div className="flex gap-2">
      <label htmlFor="showTag" className="text-base text-default">
        {label || "ShowTag"}:{" "}
      </label>
      <input
        type="checkbox"
        id="showTag"
        className={`${styles.checkBoxButton}`}
        checked={status}
        onChange={() => {
          onChange && onChange(!status);
        }}
      />
    </div>
  );
};

export default CheckBox;
