import React, { useEffect, useState } from 'react' ;
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "/src/assets/firebase";
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Modal from '/src/components/Modal';
import UserDetails from "/src/pages/UserDetails";
import { Mail, Phone, MapPin, Briefcase, Camera } from 'lucide-react';
import { auth } from "/src/assets/firebase";
import { signOut } from 'firebase/auth';

export default function Profile({ profileData, setProfileData }) {
  const [userData, setUserData] = useState(() => {
    const user = auth.currentUser;
    return {
      firstName: profileData?.firstName || user?.displayName?.split(" ")[0] || "User",
      middleName: profileData?.middleName || "",
      lastName: profileData?.lastName || user?.displayName?.split(" ").slice(1).join(" ") || "",
      university: profileData?.university || "Not Set",
      branch: profileData?.branch || "Not Set",
      email: profileData?.email || user?.email || "",
      phone: profileData?.phone || "Not Set"
    };
  });
  const [showModal, setShowModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);

  const navigate = useNavigate();

  const editProfile = () => {
    setShowEditProfile(true);
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
    const user = auth.currentUser;
    setUserData({
      firstName: profileData?.firstName || user?.displayName?.split(" ")[0] || "User",
      middleName: profileData?.middleName || "",
      lastName: profileData?.lastName || user?.displayName?.split(" ").slice(1).join(" ") || "",
      university: profileData?.university || "Not Set",
      branch: profileData?.branch || "Not Set",
      email: profileData?.email || user?.email || "",
      phone: profileData?.phone || "Not Set"
    });
     }, [profileData]);
     useEffect(() => {
  if (!auth.currentUser) return;

  const userRef = doc(
    db,
    "users",
    auth.currentUser.uid
  );

  const unsubscribe = onSnapshot(userRef, (snap) => {
    if (!snap.exists()) return;

    const userData = snap.data();

    const completed =
      userData.completedDeadlines || [];

    const latestThree = [...completed]
      .sort(
        (a, b) =>
          (b.completedAt || 0) -
          (a.completedAt || 0)
      )
      .slice(0, 3);

    setRecentActivities(latestThree);
  });

  return () => unsubscribe();
}, []);

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
              <span className="avatar-initials">{(userData.firstName?.charAt(0) || '')}{(userData.lastName?.charAt(0) || '')}</span>
              <button className="edit-avatar-btn">
                <Camera size={14} />
              </button>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-name-role">
              <h1>{userData.firstName} {userData.middleName} {userData.lastName}</h1>
             <span>Student at {userData.university}</span>
            </div>
           
          </div>

          <div className="profile-actions">
            <button className="btn-primary" onClick={editProfile}>Edit Profile</button>
            {showEditProfile && 
            <UserDetails
              onComplete={(updatedData) => { 
                setShowEditProfile(false);
                if (updatedData) {
                  setProfileData(updatedData);
                }
              }}
              first_name={userData.firstName}
              last_name={userData.lastName}
              middle_name={userData.middleName}
              branch_name={userData.branch}
              university_name={userData.university}
              mail={userData.email}
              ph={userData.phone} />}
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
              <Phone className="info-icon" size={18} />
              <span>+91 {userData.phone}</span>
            </div>
            <div className="info-row">
              <Mail className="info-icon" size={18} />
              <span>{userData.email}</span>
            </div>
             <div className="info-row">
              <Briefcase className="info-icon" size={18} />
              <span>Student at {userData.university}</span>
            </div>
          </div>
        </div>
    </div>  

       <div className="recent-activity-card">
  <h2>Recent Activity</h2>

  <div className="activity-timeline">
    {recentActivities.length === 0 ? (
      <div className="activity-empty">
        <p>No Recent Activities</p>
      </div>
    ) : (
      recentActivities.map((activity) => (
        <div
        className="activity-item"
        key={activity.id}
        >
          <div className="activity-dot"></div>

          <div className="activity-details">
            <p>
              Completed{" "}
              <strong>{activity.title}</strong>
            </p>

            <span className="activity-time">
              {activity.course}
            </span>
          </div>
        </div>
      ))
    )}
  </div>
</div>
</div>
  );
}
