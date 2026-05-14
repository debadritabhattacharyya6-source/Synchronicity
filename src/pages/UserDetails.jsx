import { useState } from "react";
import "./Auth.css";
import logo from "/src/assets/syncspace-logo.png";
import { createPortal } from 'react-dom';
import { auth, db } from "/src/assets/firebase"
import { doc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserDetails({ onComplete, first_name = "", last_name = "", middle_name = "", university_name = "", branch_name = "", mail = "", ph = "" }) {
  const [firstName, setFirstName] = useState(first_name);
  const [lastName, setLastName] = useState(last_name);
  const [middleName, setMiddleName] = useState(middle_name);
  const [university, setUniversity] = useState(university_name);
  const [branch, setBranch] = useState(branch_name);
  const [email, setEmail] = useState(mail);
  const [phone, setPhone] = useState(ph);

  const showError = () => toast.error("Something went wrong!");

  const updateDetails = async () => {
    try {
      const userDoc = doc(db, "users", auth.currentUser.uid);
      updateDoc(userDoc, {
        firstName: firstName,
        lastName: lastName,
        middleName: middleName,
        university: university,
        branch: branch,
        email: email,
        phone: phone
      });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateDetails();
    if (!success) {
      showError();
      return;
    }
    onComplete();
  };

  return createPortal((
    <div className="auth-page" style={{ position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        zIndex: 99999,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding:"40px 0" }}>
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
    </div>)
  , document.getElementById('root-portal'));
}
