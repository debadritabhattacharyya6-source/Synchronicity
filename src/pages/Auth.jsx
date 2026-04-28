import { useState } from "react";
import "./Auth.css";
import logo from "/src/assets/syncspace-logo.png"; // adjust path
import { auth, googleProvider, db } from "/src/assets/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { MdErrorOutline } from "react-icons/md";

export default function Auth({ mode, setMode, onComplete }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const createUserDocument = async (userCredential) => {
    try {
      await setDoc(doc(db, "users", userCredential.user.uid), {}, { merge: true });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    };
  }
  const signUpWithEmail = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      createUserDocument(userCredential);
      return true;
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError(true);
      }
      console.error(err);
      return false;
    }
  };
  const signInWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    }
    catch (err) {
      console.log(err);
      setError(true);
      return false;
    }
  };
  const signUpWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      createUserDocument(userCredential);
    } catch (err) {
      console.error(err);
    }
    onComplete(mode === "signup");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    if (mode === "signup") {
      const success = await signUpWithEmail();
      if (!success) {
        setPassword("");
        return;
      }
      onComplete(true);
    }
    else if (mode === "login") {
      const success = await signInWithEmail();
      if (!success) {
        setPassword("");
        return;
      }
      onComplete(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError(false);
    setEmail("");
    setPassword("");
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
          <label htmlFor="error" className="auth-error">{error === false ? "" : <MdErrorOutline />}{(mode === "login" && error === true) ? " Incorrect email or password" : ""}{(mode === "signup" && error === true) ? " Email already in use" : ""}</label>
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
