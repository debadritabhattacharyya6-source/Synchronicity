import { useState } from "react";
import "./Auth.css";
import logo from "/src/assets/syncspace-logo.png"; // adjust path
import { auth, googleProvider } from "/src/assets/firebase"
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

export default function Auth({ mode, setMode, onComplete }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
    }
  };
  const signUpWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    }
    onComplete();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "signup") {
      signUp();
    }
    else if (mode === "login") {

    }
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
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
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
        <p className="auth-or">Or</p>
        <button className="auth-google" onClick={signUpWithGoogle}><FcGoogle className="logo-img-google" />Sign in With Google</button>

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
