import { ALERT_SEVERITY, Theme } from "../../types/alert";
import { PaperPageSize } from "../../types/paper";

export const NotifyColorEnum = {
  [ALERT_SEVERITY.SUCCESS]: "success",
  [ALERT_SEVERITY.ERROR]: "error",
  [ALERT_SEVERITY.DEBUG]: "debug",
  [ALERT_SEVERITY.INFO]: "info",
  [ALERT_SEVERITY.WARNING]: "warning",
};

export const NotifyColorDynamic = {
  [ALERT_SEVERITY.SUCCESS]: "#2E8B57",
  [ALERT_SEVERITY.ERROR]: "#f44336",
  [ALERT_SEVERITY.DEBUG]: "#6b21a8",
  [ALERT_SEVERITY.INFO]: "#14b8a6",
  [ALERT_SEVERITY.WARNING]: "#eab308",
};

export const getAlertColor = (severity: ALERT_SEVERITY, _theme?: Theme) => {
  switch (severity) {
    case ALERT_SEVERITY.SUCCESS:
      return NotifyColorEnum[ALERT_SEVERITY.SUCCESS];
    case ALERT_SEVERITY.INFO:
      return NotifyColorEnum[ALERT_SEVERITY.INFO];
    case ALERT_SEVERITY.DEBUG:
      return NotifyColorEnum[ALERT_SEVERITY.DEBUG];
    case ALERT_SEVERITY.WARNING:
      return NotifyColorEnum[ALERT_SEVERITY.WARNING];
    case ALERT_SEVERITY.ERROR:
      return NotifyColorEnum[ALERT_SEVERITY.ERROR];
    default:
      return "success";
  }
};

export const getAlertBasedColor = (severity: ALERT_SEVERITY) => {
  switch (severity) {
    case ALERT_SEVERITY.SUCCESS:
      return NotifyColorDynamic[ALERT_SEVERITY.SUCCESS];
    case ALERT_SEVERITY.INFO:
      return NotifyColorDynamic[ALERT_SEVERITY.INFO];
    case ALERT_SEVERITY.DEBUG:
      return NotifyColorDynamic[ALERT_SEVERITY.DEBUG];
    case ALERT_SEVERITY.WARNING:
      return NotifyColorDynamic[ALERT_SEVERITY.WARNING];
    case ALERT_SEVERITY.ERROR:
      return NotifyColorDynamic[ALERT_SEVERITY.ERROR];
    default:
      return NotifyColorDynamic[ALERT_SEVERITY.SUCCESS];
  }
};

export const getContentSize = (size: PaperPageSize) => {
  switch (size) {
    case "sm":
      return "msm";
    case "base":
      return "sm";
    case "lg":
      return "base";
    case "xl":
      return "lg";
    default:
      return "msm";
  }
};

export const getKey = (() => {
  const MIN = 0;
  let index = MIN;

  return () => {
    const now = new Date().getTime();

    return `${++index}_${now}`;
  };
})();
