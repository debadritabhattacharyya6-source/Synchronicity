import React, { useEffect, useState } from "react";
import { Bell, AlertTriangle } from "lucide-react";
import { auth, db } from "/src/assets/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(
      db,
      "users",
      auth.currentUser.uid
    );

    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) return;

      const userData = snap.data();

      const deadlines =
        userData.deadlines || [];

      const generatedNotifications = [];

      deadlines.forEach((deadline) => {
        try {
          const deadlineDate = new Date(
            `${deadline.dueDate}T${deadline.time}`
          );

          const now = new Date();

          const hoursRemaining =
            (deadlineDate - now) /
            (1000 * 60 * 60);

          if (
            hoursRemaining > 0 &&
            hoursRemaining <= 24
          ) {
            generatedNotifications.push({
              id: deadline.id,
              title: "Upcoming Deadline",
              message: `${deadline.title} is due in ${Math.ceil(
                hoursRemaining
              )} hour(s).`,
              time: deadline.dueDate,
            });
          }
        } catch (err) {
          console.error(err);
        }
      });

      setNotifications(
        generatedNotifications
      );
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="notification-wrapper">
      {/* Bell */}

      <button
        className="icon-btn"
        onClick={() => setOpen(!open)}
      >
        <Bell size={22} />

        {notifications.length > 0 && (
          <span className="dot">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>

            <span>
              {notifications.length} unread
            </span>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                No Notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  className="notification-card"
                  key={notification.id}
                >
                  <div className="notification-icon">
                    <AlertTriangle
                      size={18}
                    />
                  </div>

                  <div className="notification-content">
                    <div className="notification-top">
                      <h4>
                        {notification.title}
                      </h4>

                      <span>
                        {notification.time}
                      </span>
                    </div>

                    <p>
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notification-footer">
            View All
          </div>
        </div>
      )}
    </div>
  );
}