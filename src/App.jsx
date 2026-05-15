import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '/src/assets/firebase'
import 'bootstrap/dist/css/bootstrap.min.css';
import Intro from "./pages/Intro";
import Sidebar from "./components/Sidebar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Collaborations from "./pages/Collaborations";
import "./pages/global.css";
import "./App.css";
import Navbar from "./components/Navbar";
import Auth from "./pages/Auth";
import UserDetails from "./pages/UserDetails";
import Calendar from "./pages/Calendar";
import Deadlines from "./pages/Deadlines";

function App() {
  const [theme, setTheme] = useState("dark");
  const [currentScreen, setCurrentScreen] = useState("intro"); // 'intro', 'auth', 'app'
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setCurrentScreen("app");
    });

    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    if (location.state?.currentScreen === "intro") {
      setCurrentScreen(location.state?.currentScreen);
    }
    else if(location.state?.currentScreen === 'userdetails'){
      setCurrentScreen(location.state?.currentScreen);
    }
  }, [location]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'black', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#00ff88' }}>
        <p>Loading Sync Space...</p>
      </div>
    );
  }

  // 👉 SHOW INTRO OR AUTH FIRST
  if (currentScreen === "intro") {
    return <Intro onNavigate={(mode) => {
      setAuthMode(mode);
      setCurrentScreen("auth");
    }} />;
  }

  if (currentScreen === "auth") {
    return <Auth mode={authMode} setMode={setAuthMode} onComplete={(isSignup) => {
      if (isSignup) {
        setCurrentScreen("userdetails");
      } else {
        setCurrentScreen("app");
      }
    }} />;
  }

  if (currentScreen === "userdetails") {
    return <UserDetails onComplete={() => {
      setCurrentScreen("app");
    }} />;
  }

  // 👉 THEN SHOW MAIN APP
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar theme={theme} />

      <div style={{ flex: 1, padding: "0 0 20px" }}>
        <Navbar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/deadlines" element={<Deadlines />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/collaboration" element={<Collaborations/>} />
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