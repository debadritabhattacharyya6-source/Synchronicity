import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Modal from '/src/components/Modal';
import UserDetails from "/src/pages/UserDetails";
import { Mail, Phone, MapPin, Briefcase, Camera } from 'lucide-react';
import { auth, db } from "/src/assets/firebase";
import { signOut } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const navigate = useNavigate();

  const editProfile = () => {
    setShowEditProfile(true);
  }

  const getUserdata = async () => {
    try {
      const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserData(userData);
      }
    }
    catch (err) {
      console.error(err);
    }
  }

  const logout = async () => {
    try {
      setShowModal(false);
      signOut(auth);
      navigate('/', { state: { currentScreen: "intro" } });
    }
    catch (err) {
      console.error(err);
    }
  }

  const confirmLogout = () => {
    setShowModal(true);
  };

  useEffect(() => {
    if (!auth.currentUser) return;
    getUserdata();
  });

  if (!userData) return (<div>Loading profile...</div>)
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="cover-photo">
          <button className="edit-cover-btn">
            <Camera size={16} /> Edit Cover
          </button>
        </div>

        <div className="profile-info-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <span className="avatar-initials">{userData.firstName.charAt(0)}{userData.lastName.charAt(0)}</span>
              <button className="edit-avatar-btn">
                <Camera size={14} />
              </button>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-name-role">
              <h1>{userData.firstName} {userData.middleName} {userData.lastName}</h1>
              <p className="role-badge">Student</p>
            </div>
            <p className="profile-bio">
              Student passionate about building beautiful and interactive web experiences.
              Always eager to learn new technologies and improve my craft.
            </p>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">10</span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">20</span>
                <span className="stat-label">Tasks Done</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">4.9</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-primary" onClick={editProfile}>Edit Profile</button>
            {showEditProfile && 
            <UserDetails
              onComplete={() => { 
                setShowEditProfile(false);
              }}
              first_name={userData.firstName}
              last_name={userData.lastName}
              middle_name={userData.middleName}
              branch_name={userData.branch}
              university_name={userData.university}
              mail={userData.email}
              ph={userData.phone} />}
            <button className="btn-secondary">Share</button>
            <button className="btn-logout" onClick={confirmLogout}>Logout</button>
            <Modal
              modalVisible={showModal}
              title="Are you sure?"
              onConfirm={logout}
              onCancel={() => setShowModal(false)}
              confirmText="Logout">
              <p>You will be redirected to the login page</p>
            </Modal>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="info-card">
          <h2>About Me</h2>
          <div className="info-list">
            <div className="info-row">
              <Briefcase className="info-icon" size={18} />
              <span>Student at {userData.university}</span>
            </div>
            <div className="info-row">
              <MapPin className="info-icon" size={18} />
              <span>Kolkata, West Bengal</span>
            </div>
            <div className="info-row">
              <Mail className="info-icon" size={18} />
              <span>{userData.email}</span>
            </div>
            <div className="info-row">
              <Phone className="info-icon" size={18} />
              <span>+91 {userData.phone}</span>
            </div>
          </div>
        </div>

        <div className="recent-activity-card">
          <h2>Recent Activity</h2>
          <div className="activity-timeline">
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-details">
                <p>Completed project <strong>Dashboard Redesign</strong></p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-details">
                <p>Added a new feature to <strong>Task Manager</strong></p>
                <span className="activity-time">Yesterday</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-details">
                <p>Commented on <strong>Backend API Specs</strong></p>
                <span className="activity-time">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
