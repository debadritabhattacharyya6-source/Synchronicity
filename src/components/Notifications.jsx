import { useState } from "react";
import { Bell, AlertTriangle, Clock, CheckCircle } from "lucide-react";

const sampleNotifications = [
  {
    id: 1,
    type: "urgent",
    title: "AI Project Proposal",
    message: "Deadline is within 12 hours.",
    time: "5 min ago",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    title: "Midterm Exam",
    message: "Exam starts tomorrow morning.",
    time: "20 min ago",
    read: false,
  },
  {
    id: 3,
    type: "success",
    title: "Task Completed",
    message: "You completed HCI Report.",
    time: "1 hour ago",
    read: true,
  },
];

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(
    sampleNotifications
  );

  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "urgent":
        return (
          <AlertTriangle className="text-red-400" size={18} />
        );

      case "warning":
        return <Clock className="text-yellow-400" size={18} />;

      case "success":
        return (
          <CheckCircle className="text-green-400" size={18} />
        );

      default:
        return <Bell size={18} />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full bg-[#0f1f17] hover:bg-[#173126] transition"
      >
        <Bell className="text-white" size={22} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-4 w-[360px] bg-[#08110d] border border-[#1d3a2f] rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#163126] flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">
              Notifications
            </h2>

            <span className="text-sm text-green-400">
              {unreadCount} unread
            </span>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() =>
                  markAsRead(notification.id)
                }
                className={`p-4 border-b border-[#13261f] cursor-pointer transition hover:bg-[#102019]
                  ${
                    !notification.read
                      ? "bg-[#0d1914]"
                      : "bg-transparent"
                  }
                `}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="mt-1">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-white font-medium">
                        {notification.title}
                      </h3>

                      <span className="text-xs text-gray-400">
                        {notification.time}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 text-center border-t border-[#163126]">
            <button className="text-green-400 hover:text-green-300 text-sm">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}