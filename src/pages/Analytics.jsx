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
  Tooltip
} from "recharts";

import "./Analytics.css";

export default function CompletedDeadlinesGraph() {
  const [graphData, setGraphData] = useState([]);

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

        const completedDeadlines =
          userData.completedDeadlines || [];

        const groupedData = {};

        completedDeadlines.forEach((deadline) => {
          if (!deadline.completedAt) return;

          const date = new Date(
            deadline.completedAt
          )
            .toISOString()
            .split("T")[0];

          groupedData[date] =
            (groupedData[date] || 0) + 1;
        });

        const formattedData = Object.keys(
          groupedData
        )
          .sort()
          .map((date) => ({
            date,
            completed: groupedData[date]
          }));

        setGraphData(formattedData);
      }
    );

    return () => unsubscribe();
  }, []);

  const CustomTooltip = ({
    active,
    payload,
    label
  }) => {
    if (
      active &&
      payload &&
      payload.length
    ) {
      return (
        <div className="custom-tooltip">
          <p>{label}</p>
          <p>
            Completed:{" "}
            {payload[0].value}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="graph-card">
      <div className="graph-header">
        <div>
          <h3 className="graph-title">
            Completed Deadlines
          </h3>

          <p className="graph-subtitle">
            Daily completion trend
          </p>
        </div>
      </div>

      <div className="graph-container">
        {graphData.length === 0 ? (
          <div className="graph-empty">
            No completed deadlines yet
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart data={graphData}>
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
              />

              <YAxis
                allowDecimals={false}
              />

              <Tooltip
                content={<CustomTooltip />}
              />

              <Area
                type="monotone"
                dataKey="completed"
                stroke="#52b788"
                fill="#52b788"
                fillOpacity={0.35}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}