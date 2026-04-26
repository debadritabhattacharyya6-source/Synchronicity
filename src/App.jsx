import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import "./pages/global.css";

function App() {
  const [theme, setTheme] = useState("dark");

  // Apply theme
  useEffect(() => {
    if (theme === "light") {
      document.body.setAttribute("data-theme", "light");
    } else {
      document.body.removeAttribute("data-theme");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Load saved theme
useEffect(() => {
  const saved = localStorage.getItem("theme");

  if (saved === "light" || saved === "dark") {
    setTheme(saved);
  } else {
    setTheme("dark"); // force default
  }
}, []);

const [colors, setColors] = useState({});

useEffect(() => {
  const updateColors = () => {
    const styles = getComputedStyle(document.body);

    setColors({
      grid: styles.getPropertyValue("--chart-grid"),
      axis: styles.getPropertyValue("--chart-axis"),
      bar: styles.getPropertyValue("--chart-bar"),
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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route path="/" element={<h1>Dashboard</h1>} />
          <Route path="/calendar" element={<h1>Calendar</h1>} />
          <Route path="/deadlines" element={<h1>Deadlines</h1>} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/collaboration" element={<h1>Collaboration</h1>} />

          <Route
            path="/settings"
            element={<Settings theme={theme} setTheme={setTheme} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
