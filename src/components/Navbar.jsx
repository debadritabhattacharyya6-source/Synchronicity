import { useState } from "react";
import {
  Bell,
  Search,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Topbar() {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "urgent",
      title: "AI Project Proposal",
      message: "Deadline is within 12 hours",
      time: "5m ago",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "Midterm Exam",
      message: "Exam starts tomorrow morning",
      time: "20m ago",
      read: false,
    },
    {
      id: 3,
      type: "success",
      title: "Task Completed",
      message: "You completed HCI Report",
      time: "1h ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, read: true }
          : n
      )
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "urgent":
        return (
          <AlertTriangle
            size={18}
            color="#ff4d4f"
          />
        );

      case "warning":
        return (
          <Clock
            size={18}
            color="#facc15"
          />
        );

      case "success":
        return (
          <CheckCircle
            size={18}
            color="#4ade80"
          />
        );

      default:
        return <Bell size={18} />;
    }
  };

  return (
    <div className="custom-navbar">
      {/* SEARCH */}
      <div className="search-wrapper">
        <Search
          className="search-icon"
          size={18}
        />

        <input
          type="text"
          placeholder="Search deadlines..."
          className="search-input"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">
        {/* DEADLINE ALERT */}
        <div className="deadline-pill">
          <span className="ping-dot"></span>
          5 deadlines within 48h
        </div>

        {/* NOTIFICATION */}
        <div className="notification-wrapper">
          <button
            className="icon-btn"
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="dot">
                {unreadCount}
              </span>
            )}
          </button>

          {/* DROPDOWN */}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>

                <span>
                  {unreadCount} unread
                </span>
              </div>

              <div className="notification-list">
                {notifications.map(
                  (notification) => (
                    <div
                      key={notification.id}
                      className={`notification-card ${
                        !notification.read
                          ? "unread"
                          : ""
                      }`}
                      onClick={() =>
                        markAsRead(
                          notification.id
                        )
                      }
                    >
                      <div className="notification-icon">
                        {getIcon(
                          notification.type
                        )}
                      </div>

                      <div className="notification-content">
                        <div className="notification-top">
                          <h4>
                            {
                              notification.title
                            }
                          </h4>

                          <span>
                            {
                              notification.time
                            }
                          </span>
                        </div>

                        <p>
                          {
                            notification.message
                          }
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="notification-footer">
                View All Notifications
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <button
          className="profile-btn"
          onClick={() =>
            navigate("/profile")
          }
        >
          <User size={20} />
        </button>
      </div>
    </div>
  );
}