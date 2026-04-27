import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import Intro from "./pages/Intro";
import Sidebar from "./components/Sidebar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import "./pages/global.css";
import "./App.css";
import Navbar from "./components/Navbar";


function App() {
  const [theme, setTheme] = useState("dark");
  const [showIntro, setShowIntro] = useState(true);

  // Theme apply
  useEffect(() => {
    if (theme === "light") {
      document.body.setAttribute("data-theme", "light");
    } else {
      document.body.removeAttribute("data-theme");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setTheme(saved === "light" ? "light" : "dark");
  }, []);

  // 🎬 Intro auto-hide after 3s (you can change this)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // 👉 SHOW INTRO FIRST
  if (showIntro) {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  // 👉 THEN SHOW MAIN APP
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "0 0 20px" }}>
        <Navbar/>
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<h1>Calendar</h1>} />
          <Route path="/deadlines" element={<h1>Deadlines</h1>} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/collaboration" element={<h1>Collaboration</h1>} />
          <Route path="/profile" element={<Profile />} />
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