import { Bell, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Topbar() {
  const navigate = useNavigate();

  return (
    <div className="custom-navbar">
      {/* LEFT */}
      <div className="search-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search deadlines, subjects..."
          className="search-input"
        />
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        <div className="deadline-pill">
          <span className="ping-dot"></span>
          5 deadlines within 48h
        </div>

        <button className="icon-btn">
          <Bell size={20} />
          <span className="dot"></span>
        </button>

        <div
          className="profile-btn"
          onClick={() => navigate("/profile")}
        >
          <User size={20} />
        </div>
      </div>
    </div>
  );
}