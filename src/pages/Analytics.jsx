import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  LineChart, Line,
  PieChart, Pie, Cell
} from "recharts";

import { useEffect, useState } from "react";
import "./Analytics.css";

// DATA
const workloadData = [
  { day: "Mon", hours: 2 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 1 },
  { day: "Thu", hours: 4 },
  { day: "Fri", hours: 2 },
  { day: "Sat", hours: 5 },
  { day: "Sun", hours: 1 },
];

const productivityData = [
  { day: "Mon", score: 60 },
  { day: "Tue", score: 75 },
  { day: "Wed", score: 50 },
  { day: "Thu", score: 85 },
  { day: "Fri", score: 70 },
];

const pieData = [
  { name: "Math", value: 40 },
  { name: "Physics", value: 30 },
  { name: "Chemistry", value: 20 },
  { name: "CS", value: 10 },
];

export default function Analytics() {
  const [colors, setColors] = useState({});

  useEffect(() => {
    const updateColors = () => {
      const styles = getComputedStyle(document.body);

      setColors({
        grid: styles.getPropertyValue("--chart-grid"),
        axis: styles.getPropertyValue("--chart-axis"),
        bar: styles.getPropertyValue("--chart-bar"),
        line: styles.getPropertyValue("--chart-line"),
        tooltipBg: styles.getPropertyValue("--chart-tooltip-bg"),
      });
    };

    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="analytics">
      

    {/* 🔥 HEADING */}
    <div className="analytics-header">
      <h1 className="page-title">Analytics</h1>
      <div className="analytics-underline"></div>
    </div>

      <div className="grid">
      {/* Workload Chart (UNCHANGED STRUCTURE) */}
      <div className="card">
        <h2>Weekly Workload</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={workloadData}>
            <CartesianGrid stroke={colors.grid} />
            <XAxis dataKey="day" stroke={colors.axis} />
            <YAxis stroke={colors.axis} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "10px"
              }}
            />
            <Bar dataKey="hours" fill={colors.bar} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SECOND Workload Chart (you had duplicate — kept as requested) */}
      <div className="card">
        <h2>Weekly Workload</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={workloadData}>
            <CartesianGrid stroke={colors.grid} />
            <XAxis dataKey="day" stroke={colors.axis} />
            <YAxis stroke={colors.axis} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "10px"
              }}
            />
            <Bar dataKey="hours" fill={colors.bar} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Productivity Line */}
      <div className="card">
        <h2>Productivity Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={productivityData}>
            <CartesianGrid stroke={colors.grid} />
            <XAxis dataKey="day" stroke={colors.axis} />
            <YAxis stroke={colors.axis} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "10px"
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={colors.line}
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="card">
        <h2>Subject Distribution</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={80}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={colors.bar} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "10px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
     </div>
    </div>
  );
}