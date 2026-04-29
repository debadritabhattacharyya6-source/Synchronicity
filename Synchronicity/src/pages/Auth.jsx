import { useState } from "react";
import "./Auth.css";
import logo from "/src/assets/syncspace-logo.png"; // adjust path

export default function Auth({ mode, setMode, onComplete }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here we bypass real auth and go to dashboard
    onComplete();
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src={logo} alt="syncspace" className="auth-logo" />
        <h2 className="auth-title">{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              placeholder="Enter your username"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="auth-submit">
            {mode === "login" ? "LOG IN" : "SIGN UP"}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode} className="auth-toggle-link">
            {mode === "login" ? "Sign Up" : "Log In"}
          </span>
        </p>
      </div>
    </div>
  );
}
