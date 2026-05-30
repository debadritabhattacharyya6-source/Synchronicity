import { Bell, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { auth, db } from "../assets/firebase";
import "./Navbar.css";

export default function Topbar() {
  const navigate = useNavigate();

  // NOTIFICATION STATE
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(
      db,
      "users",
      auth.currentUser.uid
    );

    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) return;
        const userData = snap.data();
        const deadlines = userData?.deadlines || [];
        const generatedNotifications = [];
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);

        deadlines.forEach((deadline) => {
          try {
            const [year, month, day] = deadline.dueDate.split('-').map(Number);

            const deadlineMidnight = new Date(year, month - 1, day);
            deadlineMidnight.setHours(0, 0, 0, 0);
            
            const diffTime = deadlineMidnight.getTime() - todayMidnight.getTime();
            const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));
            if (daysRemaining === 0 || daysRemaining === 1) {
              let timeText = daysRemaining === 0 ? "today" : "tomorrow";
              generatedNotifications.push({
                id: deadline.id,
                title: "Upcoming Deadline",
                message: `${deadline.title} is due ${timeText}`,
                time: deadline.dueDate,
                read: false,
              });
            }
          } catch (err) {
            console.error(err);
          }
        });

        setNotifications(
          generatedNotifications
        );
      }
    );

    return () => unsubscribe();
  }, []);
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
                  {notifications.length} unread
                </span>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                    }}
                  >
                    No Notifications
                  </div>
                ) : notifications.map(
                  (notification) => (
                    <div
                      key={notification.id}
                      className={`notification-card ${!notification.read
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