import { useState } from "react";
import "./Auth.css";
import logo from "/src/assets/syncspace-logo.png";

export default function UserDetails({ onComplete }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [university, setUniversity] = useState("");
  const [branch, setBranch] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div className="auth-page" style={{ height: "auto", minHeight: "100vh", padding: "40px 0" }}>
      <div className="auth-container" style={{ width: "650px", maxWidth: "95%", margin: "auto" }}>
        <img src={logo} alt="syncspace" className="auth-logo" />
        <h2 className="auth-title">Complete Your Profile</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <div className="input-group" style={{ flex: "1 1 150px" }}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="First Name"
              />
            </div>
            <div className="input-group" style={{ flex: "1 1 150px" }}>
              <label htmlFor="middleName">Middle Name (optional)</label>
              <input
                type="text"
                id="middleName"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Middle Name"
              />
            </div>
            <div className="input-group" style={{ flex: "1 1 150px" }}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Last Name"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="university">University Name</label>
            <input
              type="text"
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
              placeholder="Enter your university"
            />
          </div>

          <div className="input-group">
            <label htmlFor="branch">Branch Name</label>
            <input
              type="text"
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
              placeholder="Enter your branch"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="Enter your phone number"
            />
          </div>

          <button type="submit" className="auth-submit" style={{ marginTop: "20px" }}>
            SAVE DETAILS
          </button>
        </form>
      </div>
    </div>
  );
}
