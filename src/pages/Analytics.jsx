import React, { useEffect, useState } from "react";
import { auth, db } from "../assets/firebase";
import { doc, onSnapshot } from "firebase/firestore";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function DeadlineGraph() {
  const [graphData, setGraphData] = useState([]);

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

      const grouped = {};

      deadlines.forEach((deadline) => {
        const date = deadline.dueDate;

        if (!grouped[date]) {
          grouped[date] = 0;
        }

        grouped[date]++;
      });

      const chartData = Object.keys(grouped)
        .sort()
        .map((date) => ({
          date,
          count: grouped[date],
        }));

      setGraphData(chartData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "320px",
        background: "#1f2b4a",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={graphData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis allowDecimals={false} />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="count"
            stroke="#38d9a9"
            fill="#38d9a9"
            fillOpacity={0.4}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}