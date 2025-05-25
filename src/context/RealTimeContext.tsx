/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

interface RealTimeContextType {
  isRealTime: boolean;
  toggleRealTime: (enabled: boolean) => void;
  subscribeToUpdates: (
    period: string,
    callback: () => Promise<void>
  ) => () => void;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(
  undefined
);

const POLLING_INTERVAL = 30000; // 30 seconds

export const RealTimeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isRealTime, setIsRealTime] = useState<boolean>(false);
  const subscriptions = useRef<
    Map<string, { callback: () => Promise<void>; interval: NodeJS.Timeout }>
  >(new Map());

  const toggleRealTime = useCallback((enabled: boolean) => {
    setIsRealTime(enabled);
  }, []);

  const subscribeToUpdates = useCallback(
    (period: string, callback: () => Promise<void>) => {
      const subscriptionId = `${period}-${Date.now()}`;
      const executeCallback = async () => {
        try {
          await callback();
        } catch (error) {
          console.error("Error in real-time update:", error);
        }
      };

      if (isRealTime && period === "day") {
        executeCallback(); // Immediate execution
        const interval = setInterval(executeCallback, POLLING_INTERVAL);
        subscriptions.current.set(subscriptionId, { callback, interval });
      }

      return () => {
        const sub = subscriptions.current.get(subscriptionId);
        if (sub) {
          clearInterval(sub.interval);
          subscriptions.current.delete(subscriptionId);
        }
      };
    },
    [isRealTime]
  );

  useEffect(() => {
    if (!isRealTime) {
      subscriptions.current.forEach((sub) => clearInterval(sub.interval));
      subscriptions.current.clear();
    } else {
      subscriptions.current.forEach((sub, id) => {
        if (!sub.interval) {
          sub.interval = setInterval(async () => {
            try {
              await sub.callback();
            } catch (error) {
              console.error("Error in real-time update:", error);
            }
          }, POLLING_INTERVAL);
          subscriptions.current.set(id, sub);
        }
      });
    }

    return () => {
      subscriptions.current.forEach((sub) => clearInterval(sub.interval));
      subscriptions.current.clear();
    };
  }, [isRealTime]);

  return (
    <RealTimeContext.Provider
      value={{ isRealTime, toggleRealTime, subscribeToUpdates }}
    >
      {children}
    </RealTimeContext.Provider>
  );
};

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error("useRealTime must be used within a RealTimeProvider");
  }
  return context;
};
