import React from "react";

export type Theme = "light" | "dark";

export enum ALERT_SEVERITY {
  ERROR = "ERROR",
  DEBUG = "DEBUG",
  SUCCESS = "SUCCESS",
  INFO = "INFO",
  WARNING = "WARNING",
}

export type AlertMsg = Omit<AlertProps, "key"> & {
  error?: Error;
};

export type SetAlert = (alert: AlertMsg) => string;
export type RemoveAlert = (key: string) => void;

export type AlertContextProps = {
  alert: SetAlert;
};

export interface NotifyProps {
  children: React.ReactNode | string;
  theme?: Theme;
  title: string;
  position?: "top" | "bottom";
  type?: ALERT_SEVERITY;
  duration?: number;
  onClose?: () => void;
}

export type AlertProps = {
  key: string;
  duration?: number;
  type?: ALERT_SEVERITY;
  title: string;
  message: string | React.ReactNode;
};

export interface DurationProps {
  duration?: number;
  severity: ALERT_SEVERITY;
}
