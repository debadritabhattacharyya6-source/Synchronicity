import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { auth, db } from "/src/assets/firebase";
import { doc, onSnapshot } from "firebase/firestore";

import "./Analytics.css";

const COLORS = [
  "#52b788",
  "#4a7e64",
  "#52b78840",
];

export default function Analytics() {
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);

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

        const completed =
          userData.completedDeadlines || [];

        //----------------------------------
        // PIE CHART DATA
        //----------------------------------

        let assignments = 0;
        let exams = 0;
        let projects = 0;

        completed.forEach((item) => {
          if (item.type === "assignment")
            assignments++;

          else if (item.type === "exam")
            exams++;

          else if (item.type === "project")
            projects++;
        });

        setPieData([
          {
            name: "Assignments",
            value: assignments,
          },
          {
            name: "Exams",
            value: exams,
          },
          {
            name: "Projects",
            value: projects,
          },
        ]);

        //----------------------------------
        // LINE GRAPH DATA
        //----------------------------------

        const dateMap = {};

        completed.forEach((item) => {
          if (!item.completedAt) return;

          const date =
            new Date(item.completedAt)
              .toISOString()
              .split("T")[0];

          dateMap[date] =
            (dateMap[date] || 0) + 1;
        });

        const graphData = Object.keys(
          dateMap
        )
          .sort()
          .map((date) => ({
            date,
            completed: dateMap[date],
          }));

        setLineData(graphData);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="analytics-container">
      {/* GRAPH */}

      <div className="analytics-card">
        <h2>
          Completed Deadlines Per Day
        </h2>

        {lineData.length === 0 ? (
          <div className="empty-state">
            No completed deadlines
          </div>
        ) : (
          <ResponsiveContainer
  width="100%"
  height={350}
>
  <LineChart data={lineData}>
    <XAxis
      dataKey="date"
      axisLine={true}
      tickLine={false}
    />

    <YAxis
      axisLine={true}
      tickLine={false}
      allowDecimals={false}
    />

    <Tooltip />

    <Line
      type="monotone"
      dataKey="completed"
      stroke="#52b788"
      strokeWidth={3}
      dot={{ r: 4 }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>
        )}
      </div>

      {/* PIE */}

      <div className="analytics-card">
        <h2>
          Completion Distribution
        </h2>

        {pieData.every(
          (item) => item.value === 0
        ) ? (
          <div className="empty-state">
            No completed deadlines
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={350}
          >
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={120}
                label
              >
                {pieData.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}