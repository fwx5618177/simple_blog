import {
  FC,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  ALERT_SEVERITY,
  AlertContextProps,
  AlertProps,
  RemoveAlert,
  SetAlert,
} from "../../types/alert";
import { getKey } from "../utils/helper";
import Snack from "@/components/Notify/Snack";
import NotifyBase from "@/components/Notify/NotifyBase";

export const AlertsContext = createContext<AlertContextProps>(
  {} as AlertContextProps
);

export const useAlerts = () => {
  return useContext(AlertsContext);
};

export const AlertsProvider: FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertProps[]>([]);

  const alert: SetAlert = useCallback(
    ({ duration = 6000, title, type, error, message }) => {
      if (error) {
        console.error(error);
      }

      const key = getKey();

      setAlerts((state) => {
        return [{ type, title, duration, key, message }, ...state];
      });

      setTimeout(() => {
        // remove alert after timeout
        setAlerts((state) => state.filter((cur) => cur.key !== key));
      }, duration);

      return key;
    },
    []
  );

  const removeAlert: RemoveAlert = (key) => {
    setAlerts((state) => state.filter((cur) => cur.key !== key));
  };

  const filteredAlerts = useMemo(() => {
    if (process.env.NODE_ENV === "development") {
      return alerts;
    }

    return alerts.filter((cur) => cur.type !== ALERT_SEVERITY.DEBUG);
  }, [alerts]);

  return (
    <AlertsContext.Provider
      value={{
        alert,
      }}
    >
      {children}
      <Snack open={filteredAlerts?.length > 0}>
        {filteredAlerts?.map((cur, index) => {
          if (index < 5) {
            return (
              <NotifyBase
                title={cur.title}
                duration={cur.duration}
                key={cur.key}
                onClose={() => {
                  removeAlert(cur.key);
                }}
                type={cur.type}
              >
                {cur.message}
              </NotifyBase>
            );
          } else {
            return null;
          }
        })}
      </Snack>
    </AlertsContext.Provider>
  );
};
