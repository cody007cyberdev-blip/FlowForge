import { createContext, useContext, ReactNode } from "react";
import { Notification, useNotifications } from "@/components/Notifications";

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  success: (title: string, message: string, duration?: number) => string;
  error: (title: string, message: string, duration?: number) => string;
  warning: (title: string, message: string, duration?: number) => string;
  info: (title: string, message: string, duration?: number) => string;
  loading: (title: string, message: string) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { notifications, addNotification, removeNotification } = useNotifications();

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    success: (title, message, duration) =>
      addNotification({ type: "success", title, message, duration }),
    error: (title, message, duration) =>
      addNotification({ type: "error", title, message, duration }),
    warning: (title, message, duration) =>
      addNotification({ type: "warning", title, message, duration }),
    info: (title, message, duration) =>
      addNotification({ type: "info", title, message, duration }),
    loading: (title, message) =>
      addNotification({ type: "loading", title, message, duration: 0 }),
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
}
