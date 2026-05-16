import { AlertCircle, CheckCircle, Info, AlertTriangle, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";

export type NotificationType = "success" | "error" | "warning" | "info" | "loading";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const notificationStyles = {
  success: {
    border: "border-l-4 border-emerald-500",
    bg: "bg-gradient-to-r from-emerald-950/40 to-emerald-900/20",
    icon: "text-emerald-400",
    title: "text-emerald-100",
    glow: "shadow-lg shadow-emerald-500/20",
  },
  error: {
    border: "border-l-4 border-red-500",
    bg: "bg-gradient-to-r from-red-950/40 to-red-900/20",
    icon: "text-red-400",
    title: "text-red-100",
    glow: "shadow-lg shadow-red-500/20",
  },
  warning: {
    border: "border-l-4 border-amber-500",
    bg: "bg-gradient-to-r from-amber-950/40 to-amber-900/20",
    icon: "text-amber-400",
    title: "text-amber-100",
    glow: "shadow-lg shadow-amber-500/20",
  },
  info: {
    border: "border-l-4 border-blue-500",
    bg: "bg-gradient-to-r from-blue-950/40 to-blue-900/20",
    icon: "text-blue-400",
    title: "text-blue-100",
    glow: "shadow-lg shadow-blue-500/20",
  },
  loading: {
    border: "border-l-4 border-purple-500",
    bg: "bg-gradient-to-r from-purple-950/40 to-purple-900/20",
    icon: "text-purple-400",
    title: "text-purple-100",
    glow: "shadow-lg shadow-purple-500/20",
  },
};

const getIcon = (type: NotificationType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="w-5 h-5" />;
    case "error":
      return <AlertCircle className="w-5 h-5" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5" />;
    case "info":
      return <Info className="w-5 h-5" />;
    case "loading":
      return <Loader2 className="w-5 h-5 animate-spin" />;
  }
};

export function NotificationItem({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const style = notificationStyles[notification.type];

  return (
    <div
      className={`
        rounded-lg backdrop-blur-md border border-white/10
        ${style.border} ${style.bg} ${style.glow}
        p-4 mb-3 flex items-start gap-3 animate-in fade-in slide-in-from-right-4 duration-300
      `}
    >
      <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${style.title}`}>{notification.title}</p>
        <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="mt-2 text-xs font-medium text-slate-200 hover:text-white transition-colors underline"
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function NotificationContainer({ notifications, onRemove }: { notifications: Notification[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onClose={() => onRemove(notification.id)} />
      ))}
    </div>
  );
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = { ...notification, id };

    setNotifications((prev) => [...prev, newNotification]);

    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, addNotification, removeNotification };
}
