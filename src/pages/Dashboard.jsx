import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './Deadlines.css';
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { auth, db } from "/src/assets/firebase";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, runTransaction, onSnapshot } from 'firebase/firestore';

export default function Dashboard({ profileData }) {
  const [userData, setUserData] = useState(null);
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

      if (dueDateMs >= todayMs && dueDateMs <= nextWeekDateMs) {
        return deadline;
      }
    }).length || 0;
    const highPriority = userData?.deadlines?.filter((deadline) => deadline.urgency === 'high').length || 0;
    const tasksCompleted = userData?.completedDeadlines?.length || 0;
    const productivityScore = Math.ceil((tasksCompleted * 100) / (userData?.deadlines.length + tasksCompleted)) || 0;

    setStats({
      dueThisWeek: dueThisWeek,
      highPriority: highPriority,
      tasksCompleted: tasksCompleted,
      productivityScore: productivityScore,
    });

    const generatedData = Array(35).fill(0).map((day, index) => {
      const rand = Math.random();
      const today = new Date();
      const dayOfMap = new Date(today);
      dayOfMap.setDate(today.getDate() + index);
      let heat = 0;
      userData?.deadlines?.forEach((deadline) => {
        if (deadline.dueDate === dayOfMap.toLocaleDateString('en-CA')) {
          if (deadline.type === 'exam')
            heat += 3;
          else if (deadline.type === 'assignment')
            heat += 2;
          else
            heat += 1;
        }
      })
      return heat;
    });
    setHeatmapData(generatedData);
  }, [userData]);

  useEffect(() => {
    const unsubscribe = async () => {
      try {
        const userDoc = doc(db, "users", auth.currentUser.uid);
        await runTransaction(db, async (transaction) => {
          const docRef = await transaction.get(userDoc);
          if (!docRef.exists()) throw "User does not exist";
          const existingCompletedDeadlines = docRef.data().completedDeadlines || [];
          const todayMidnight = new Date();
          todayMidnight.setHours(0, 0, 0, 0);
          const newDeadlineArray = existingCompletedDeadlines.filter((deadline) => {
            const [year, month, day] = deadline.dueDate.split('-').map(Number);

            const deadlineMidnight = new Date(year, month - 1, day);
            deadlineMidnight.setHours(0, 0, 0, 0);

            const diffTime = -deadlineMidnight.getTime() + todayMidnight.getTime();
            const daysExceeded = Math.round(diffTime / (1000 * 60 * 60 * 24));
            if (daysExceeded > 7) {
              return false;
            }
            return true;
          });
          transaction.update(userDoc, { completedDeadlines: newDeadlineArray });
        });
      } catch (err) {
        console.error(err);
      }
    };
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = async () => {
      try {
        const userDoc = doc(db, "users", auth.currentUser.uid);
        await runTransaction(db, async (transaction) => {
          const docRef = await transaction.get(userDoc);
          if (!docRef.exists()) throw "User does not exist";
          const existingDeadlines = docRef.data().deadlines || [];
          const todayMidnight = new Date();
          todayMidnight.setHours(0, 0, 0, 0);
          const newDeadlineArray = existingDeadlines.map((deadline) => {
            const [year, month, day] = deadline.dueDate.split('-').map(Number);

            const deadlineMidnight = new Date(year, month - 1, day);
            deadlineMidnight.setHours(0, 0, 0, 0);

            const diffTime = deadlineMidnight.getTime() - todayMidnight.getTime();
            const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));
            if (daysLeft >= 14) {
              return {
                ...deadline,
                urgency: "low"
              }
            }
            else if(daysLeft >= 7 && daysLeft< 14){
              return {
                ...deadline,
                urgency: "medium"
              }
            }
            else{
              return {
                ...deadline,
                urgency: "high"
              }
            }
            return true;
          });
          transaction.update(userDoc, { deadlines: newDeadlineArray });
        });
      } catch (err) {
        console.error(err);
      }
    };
    return () => unsubscribe();
  }, []);

  const getRelativeTimeText = (dateString) => {
    if (!dateString) return "No date";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  const formatCalendarText = (dateString) => {
    if (!dateString) return "N/A";
    const dateObj = new Date(dateString);

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }) + `, ` + dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const colorMap = {
    high: 'red',
    med: 'purple',
    low: 'blue'
  };

  const deadlines = (userData?.deadlines || [])
    .sort((a, b) => {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0;

      return timeA - timeB; // Ascending order (Closest deadline first)
    })
    .slice(0, 4)
    .map((deadline) => {
      return {
        id: deadline.id,
        title: deadline.title,
        course: deadline.course,
        type: deadline.type || 'assignment',
        timeText: getRelativeTimeText(deadline.dueDate),
        dateText: formatCalendarText(deadline.dueDate),
        color: colorMap[deadline.urgency] || 'blue',
      };
    });

  const deadlineExists = deadlines.length !== 0

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
            {deadlineExists && deadlines.map((item) => (
              <div className="deadline-item" key={item.id}>
                <div className={`deadline-indicator indicator-${item.color}`}></div>
                <div className="deadline-content">
                  <h4 className="deadline-title">{item.title}</h4>
                  <p className="deadline-subtitle">{item.course} • {item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                </div>
                <div className="deadline-time">
                  <p className={`deadline-time-primary ${item.timeText === 'Today' ? 'time-today' : item.timeText === 'Tomorrow' ? 'time-tomorrow' : 'time-future'}`}>
                    {item.timeText}
                  </p>
                  <p className="deadline-time-secondary">{item.dateText}</p>
                </div>
              </div>
            ))}
            {!deadlineExists && <div className='no-deadline-container'>
              <img src={`/src/assets/relax.png`} style={{ transform: "scale(0.7)", filter: "none"}} />
              <h2 style={{ fontFamily: "\"Cinzel\", serif", fontSize: "20px"}}>Yay!</h2>
              <p style={{fontSize: "15px"}}>No Deadlines</p></div>}
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
                <div key={i} className={`heatmap-cell heat-${(val <= 3 ? val : 3)}`} title={`Stress level: ${val}`}></div>
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
