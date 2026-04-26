import { NavLink } from "react-router-dom";
import "./sidebar.css";
import logo from "../assets/logo.jpeg";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  BarChart3,
  Users,
  Settings
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
  <img src={logo} alt="logo" className="logo-img" />
</div>

      <nav>
        <NavLink
  to="/"
  end
  className={({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`
  }
>
  <LayoutDashboard size={18} />
    <span>Dashboard</span>

</NavLink>

        <NavLink to="/calendar"
        
  className={({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`
  }>
          <Calendar size={18} />
    <span>Calendar</span>
        </NavLink>

        <NavLink to="/deadlines"
        
  className={({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`
  }>
          <Clock size={18} />
    <span>Deadlines</span>
        </NavLink>

        <NavLink   to="/analytics"
        
  className={({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`
  }
>
          <BarChart3 size={18} />
    <span>Analytics</span>
        </NavLink>

        <NavLink   to="/collaboration"
        
  className={({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`
  }
>
          <Users size={18} />
    <span>Collaboration</span>
        </NavLink>

        <NavLink   to="/settings"
        
  className={({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`
  }
>
          <Settings size={18} />
    <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}