import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from '/src/assets/firebase'
import { doc, getDoc } from "firebase/firestore";
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
  const [profileData, setProfileData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log(currentUser);
        setUser(currentUser);
        
        // Fast optimization: Unblock loading screen instantly!
        setLoading(false);
        
        // Fast optimization: Check local storage cache
        const isCompletedCache = localStorage.getItem(`syncspace_profile_completed_${currentUser.uid}`) === "true";
        if (isCompletedCache) {
          setCurrentScreen("app");
        } else {
          // If not in cache, default to app to avoid delay. The background fetch will redirect if needed.
          setCurrentScreen("app");
        }
        
        try {
          const docSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (docSnap.exists() && docSnap.data()?.firstName) {
            setProfileData(docSnap.data());
            localStorage.setItem(`syncspace_profile_completed_${currentUser.uid}`, "true");
            setCurrentScreen("app");
          } else {
            setProfileData(null);
            localStorage.removeItem(`syncspace_profile_completed_${currentUser.uid}`);
            // Prevent background fetch race conditions from resetting screen once user completed signup details
            setCurrentScreen(prev => prev === "app" ? "app" : "userdetails");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          // If we had a cache hit, we are already in the app, don't kick them out on a network failure!
          if (!isCompletedCache) {
            setProfileData(null);
            setCurrentScreen(prev => prev === "app" ? "app" : "userdetails"); // Safe default on database errors
          }
        }
      }
      else{
        setUser(null);
        setProfileData(null);
        setCurrentScreen("intro");
        setLoading(false);
      }
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
    else if (location.state?.currentScreen === 'userdetails') {
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
        if (auth.currentUser) {
          localStorage.setItem(`syncspace_profile_completed_${auth.currentUser.uid}`, "true");
        }
        setCurrentScreen("app");
      }
    }} />;
  }

  if (currentScreen === "userdetails") {
    const currentUser = auth.currentUser;
    const prefilledFirstName = currentUser?.displayName ? currentUser.displayName.split(" ")[0] : "";
    const prefilledLastName = currentUser?.displayName ? currentUser.displayName.split(" ").slice(1).join(" ") : "";
    const prefilledEmail = currentUser?.email || "";

    return <UserDetails 
      onComplete={(updatedData) => {
        if (updatedData && auth.currentUser) {
          localStorage.setItem(`syncspace_profile_completed_${auth.currentUser.uid}`, "true");
        }
        setProfileData(updatedData);
        setCurrentScreen("app");
      }} 
      first_name={prefilledFirstName}
      last_name={prefilledLastName}
      mail={prefilledEmail}
    />;
  }

  // 👉 THEN SHOW MAIN APP
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar theme={theme} />

      <div style={{ flex: 1, padding: "0 0 20px" }}>
        <Navbar />

        <Routes>
          <Route path="/" element={<Dashboard profileData={profileData} />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/deadlines" element={<Deadlines theme={theme} />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/collaboration" element={<Collaborations />} />
          <Route path="/profile" element={<Profile profileData={profileData} setProfileData={setProfileData} />} />
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