export interface CheckBoxProps {
  label?: string;
  status: boolean;
  onChange: (status: boolean) => void;
}
