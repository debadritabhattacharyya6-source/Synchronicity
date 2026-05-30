import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { auth, db } from "../assets/firebase";
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
      const deadlines = userData.deadlines || [];

      const now = new Date();
      const generated = [];

      deadlines.forEach((deadline) => {
        const deadlineDateTime = new Date(
          `${deadline.dueDate}T${deadline.time}`
        );

        const diffMs =
          deadlineDateTime.getTime() - now.getTime();

        const hoursLeft =
          diffMs / (1000 * 60 * 60);

        // Deadline within 24 hours
        if (hoursLeft > 0 && hoursLeft <= 24) {
          generated.push({
            id: `urgent-${deadline.id}`,
            title: "🚨 Deadline Approaching",
            message: `${deadline.title} is due in ${Math.ceil(
              hoursLeft
            )} hours`,
            time: "Now",
          });
        }

        // Due today
        const today =
          now.toISOString().split("T")[0];

        if (deadline.dueDate === today) {
          generated.push({
            id: `today-${deadline.id}`,
            title: "📅 Due Today",
            message: `${deadline.title} must be submitted today`,
            time: "Today",
          });
        }

        // High priority
        if (deadline.urgency === "high") {
          generated.push({
            id: `high-${deadline.id}`,
            title: "⚠️ High Priority Task",
            message: `${deadline.title} requires immediate attention`,
            time: "Priority",
          });
        }

        // Exam
        if (deadline.type === "exam") {
          generated.push({
            id: `exam-${deadline.id}`,
            title: "📝 Exam Reminder",
            message: `${deadline.title} exam is coming soon`,
            time: "Upcoming",
          });
        }
      });

      setNotifications(generated);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="notification-wrapper">

      <button
        className="icon-btn"
        onClick={() => setOpen(!open)}
      >
        <Bell size={20} />

        {notifications.length > 0 && (
          <span className="dot">
            {notifications.length}
          </span>
        )}
      </button>

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
              <div className="notification-card">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className="notification-card unread"
                >
                  <div className="notification-content">

                    <div className="notification-top">
                      <h4>{item.title}</h4>
                      <span>{item.time}</span>
                    </div>

                    <p>{item.message}</p>

                  </div>
                </div>
              ))
            )}

          </div>

          <div className="notification-footer">
            View All Notifications
          </div>

        </div>
      )}
    </div>
  );
}