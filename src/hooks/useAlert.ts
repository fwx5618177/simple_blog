import { useAlerts } from "@/contexts/AlertContext";
import React, { useCallback, useMemo } from "react";
import { ALERT_SEVERITY } from "../../types/alert";

function useAlert() {
  const { alert } = useAlerts();

  const alertSuccess = useCallback(
    (message: string | React.ReactNode) => {
      alert({
        title: "Success",
        type: ALERT_SEVERITY.SUCCESS,
        message: message,
      });
    },
    [alert]
  );

  const alertInfo = useCallback(
    (message: string | React.ReactNode) => {
      alert({
        title: "Info",
        type: ALERT_SEVERITY.INFO,
        message: message,
      });
    },
    [alert]
  );

  const alertWarning = useCallback(
    (message: string | React.ReactNode) => {
      alert({
        title: "Warning",
        type: ALERT_SEVERITY.WARNING,
        message: message,
      });
    },
    [alert]
  );

  const alertDebug = useCallback(
    (message: string | React.ReactNode) => {
      alert({
        title: "Debug",
        type: ALERT_SEVERITY.DEBUG,
        message: message,
      });
    },
    [alert]
  );

  const alertFailed = useCallback(
    (message: string | React.ReactNode) => {
      alert({
        title: "Error",
        type: ALERT_SEVERITY.ERROR,
        message: message,
      });
    },
    [alert]
  );

  return useMemo(
    () => ({
      alertSuccess,
      alertFailed,
      alertInfo,
      alertWarning,
      alertDebug,
    }),
    [alertSuccess, alertFailed, alertInfo, alertWarning, alertDebug]
  );
}

export default useAlert;
