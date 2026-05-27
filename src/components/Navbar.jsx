import { Bell, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Navbar.css";

export default function Topbar() {
  const navigate = useNavigate();

  // NOTIFICATION STATE
  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] =
    useState([
      {
        id: 1,
        title: "AI Project Proposal",
        message:
          "Deadline is within 12 hours",
        time: "5m ago",
        read: false,
      },

      {
        id: 2,
        title: "Midterm Exam",
        message:
          "Exam starts tomorrow morning",
        time: "20m ago",
        read: false,
      },

      {
        id: 3,
        title: "Task Completed",
        message:
          "You completed HCI Report",
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

  return (
    <div className="custom-navbar">
      {/* LEFT */}
      <div className="search-wrapper">
        <Search className="search-icon" size={18} />

        <input
          type="text"
          placeholder="Search deadlines, subjects..."
          className="search-input"
        />
      </div>

      {/* RIGHT */}
      <div className="nav-right">
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
                Notifications
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
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div
          className="profile-btn"
          onClick={() => navigate("/profile")}
        >
          <User size={20} />
        </div>
      </div>
    </div>
  );
}