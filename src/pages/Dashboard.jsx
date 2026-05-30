import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { auth, db } from "/src/assets/firebase";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, runTransaction, onSnapshot } from 'firebase/firestore';

export default function Dashboard({ profileData }) {
  const [userData, setUserData] = useState(null);
  // Dynamic Mock Data
  const [stats, setStats] = useState({
    dueThisWeek: 0,
    highPriority: 0,
    tasksCompleted: 0,
    productivityScore: 0,
  });

  const greetingName = profileData?.firstName ||
    (auth.currentUser?.displayName ? auth.currentUser.displayName.split(" ")[0] :
      (auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : "User"));

  const navigate = useNavigate();
  const viewAll = () => {
    navigate('/deadlines');
  };
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }, (err) => {
        console.error(err);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    const nextWeekDate = new Date();
    nextWeekDate.setDate(today.getDate() + 7);

    const dueThisWeek = userData?.deadlines?.filter((deadline) => {
      const todayMs = today.getTime();
      const nextWeekDateMs = nextWeekDate.getTime();
      const dueDateMs = new Date(deadline.dueDate).getTime();

      if(dueDateMs >= todayMs && dueDateMs <= nextWeekDateMs){
        return deadline;
      }
    }).length;
    const highPriority = userData?.deadlines?.filter((deadline) => deadline.urgency === 'high').length;
    const tasksCompleted = userData?.completedDeadlines?.length;
    const productivityScore = Math.ceil((tasksCompleted*100)/(userData?.deadlines.length + tasksCompleted));

    setStats({
      dueThisWeek: dueThisWeek,
      highPriority: highPriority,
      tasksCompleted: tasksCompleted,
      productivityScore: productivityScore,
    });

    // Generate random heatmap data (35 cells for 7x5 grid)
    // 0 = empty, 1 = low, 2 = medium, 3 = high
    const generatedData = Array(35).fill(0).map(() => {
      const rand = Math.random();
      if (rand > 0.8) return 3; // High stress
      if (rand > 0.5) return 2; // Medium stress
      if (rand > 0.2) return 1; // Low stress/active
      return 0; // Empty
    });
    setHeatmapData(generatedData);
  }, [userData]);

  const deadlines = [
    {
      id: 1,
      title: 'Advanced AI Project Proposal',
      course: 'Machine Learning',
      type: 'assignment',
      timeText: 'Today',
      dateText: 'Apr 28, 7:34 AM',
      color: 'red',
    },
    {
      id: 2,
      title: 'Midterm Exam',
      course: 'Distributed Systems',
      type: 'exam',
      timeText: 'Tomorrow',
      dateText: 'Apr 29, 7:34 AM',
      color: 'red',
    },
    {
      id: 3,
      title: 'HCI Usability Testing Report',
      course: 'HCI',
      type: 'assignment',
      timeText: 'In 3 days',
      dateText: 'May 1, 7:34 AM',
      color: 'blue',
    },
    {
      id: 4,
      title: 'Software Engineering Group Presentation',
      course: 'Software Engineering',
      type: 'presentation',
      timeText: 'In 4 days',
      dateText: 'May 2, 7:34 AM',
      color: 'purple',
    },
  ];

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {greetingName}</h1>
        <p className="dashboard-subtitle">Here's a look at your academic workload this week.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <h3 className="stat-title">Due This Week</h3>
            <div className="stat-icon icon-purple">
              <Clock size={16} />
            </div>
          </div>
          <p className="stat-value">{stats.dueThisWeek}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h3 className="stat-title">High Priority</h3>
            <div className="stat-icon icon-red">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="stat-value">{stats.highPriority}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h3 className="stat-title">Tasks Completed</h3>
            <div className="stat-icon icon-green">
              <CheckCircle size={16} />
            </div>
          </div>
          <p className="stat-value">{stats.tasksCompleted}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h3 className="stat-title">Productivity Score</h3>
            <div className="stat-icon icon-purple">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="stat-value">{stats.productivityScore}%</p>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="section-card">
          <div className="section-header">
            <h2>Upcoming Deadlines</h2>
            <button className="view-all-btn" onClick={viewAll}>View All</button>
          </div>

          <div className="deadlines-list">
            {deadlines.map((item) => (
              <div className="deadline-item" key={item.id}>
                <div className={`deadline-indicator indicator-${item.color}`}></div>
                <div className="deadline-content">
                  <h4 className="deadline-title">{item.title}</h4>
                  <p className="deadline-subtitle">{item.course} • {item.type}</p>
                </div>
                <div className="deadline-time">
                  <p className={`deadline-time-primary ${item.timeText === 'Today' ? 'time-today' : item.timeText === 'Tomorrow' ? 'time-tomorrow' : 'time-future'}`}>
                    {item.timeText}
                  </p>
                  <p className="deadline-time-secondary">{item.dateText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2>Stress Heatmap</h2>
          </div>

          <div className="heatmap-container">
            <div className="heatmap-days">
              {days.map((day, i) => (
                <div key={i} className="heatmap-day-label">{day}</div>
              ))}
            </div>
            <div className="heatmap-grid">
              {heatmapData.map((val, i) => (
                <div key={i} className={`heatmap-cell heat-${val}`} title={`Stress level: ${val}`}></div>
              ))}
            </div>

            <div className="heatmap-legend">
              <span className="legend-text">Low Stress</span>
              <div className="legend-dots">
                <div className="heatmap-cell heat-0 legend-dot"></div>
                <div className="heatmap-cell heat-1 legend-dot"></div>
                <div className="heatmap-cell heat-2 legend-dot"></div>
                <div className="heatmap-cell heat-3 legend-dot"></div>
              </div>
              <span className="legend-text">High Stress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
