import React, { useEffect, useState, useTransition } from 'react';
import { Calendar, Clock, AlertCircle, FileText, CheckCircle, Search, Filter } from 'lucide-react';
import NewDeadline from './NewDeadline';
import Checkpoints from './Checkpoints';
import CompleteCheckpoints from './CompleteCheckpoints';
import Modal from '../components/Modal';
import './Deadlines.css';
import { auth, db } from '/src/assets/firebase'
import { doc, getDoc, runTransaction, onSnapshot } from 'firebase/firestore';

const URGENCY_WEIGHTS = {
  high: 3,
  medium: 2,
  low: 1
};

export default function Deadlines({ theme }) {
  const [userData, setUserData] = useState(null);
  const [filter, setFilter] = useState('all'); // all, assignment, exam, project
  const [newDeadline, setNewDeadline] = useState(false);
  const [newCheckpoints, setNewCheckpoints] = useState(false);
  const [confirmCompleteVisible, setConfirmCompleteVisible] = useState(false);
  const [deadline, setDeadline] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [sortByUrgency, setSortByUrgency] = useState(false);

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

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }, (err) => {
        console.error("Error listening to user data:", err);
      });
      return () => unsubscribe();
    }
  }, []);

  const allDeadlines = userData?.deadlines || [];

  const deadlineExists = allDeadlines.length > 0;

  const filteredDeadlines = filter === 'all'
    ? allDeadlines
    : allDeadlines.filter(d => d.type === filter);

    const displayedDeadlines = sortByUrgency
     ?[...filteredDeadlines].sort((a,b) => {
      return (URGENCY_WEIGHTS[b.urgency] || 0) - (URGENCY_WEIGHTS[a.urgency] || 0);
     })
     :filteredDeadlines;

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'var(--danger, #ff4d4d)';
      case 'medium': return 'var(--warning, #ffa64d)';
      case 'low': return 'var(--mint-strong, #52b788)';
      default: return 'var(--mint, #74c69d)';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'assignment': return <FileText size={18} />;
      case 'exam': return <AlertCircle size={18} />;
      case 'project': return <Calendar size={18} />;
      default: return <FileText size={18} />;
    }
  };

  const enterNewDeadline = () => {
    setNewDeadline(true);
  };

  const onComplete = async (deadline) => {
    let idToBeDeleted = deadline.id;
    const userDoc = doc(db, "users", auth.currentUser.uid);
    try {
      await runTransaction(db, async (transaction) => {
        const docRef = await transaction.get(userDoc);
        if (!docRef.exists()) throw "User does not exist";
        const existingDeadlines = docRef.data().deadlines || [];

        const newDeadlineArray = existingDeadlines.filter((item) => item.id != idToBeDeleted);

        transaction.update(userDoc, { deadlines: newDeadlineArray });
      });
      setConfirmCompleteVisible(false);
    }
    catch (err) {
      console.error(err);
    }
  };

  const confirmComplete = (deadline) => {
    setConfirmCompleteVisible(true);
    setDeadline(deadline);
  };

  const transition = (data) => {
    setTempData(data);
    setNewDeadline(false);
    setNewCheckpoints(true);
  };

  if (confirmCompleteVisible) {
    return (<CompleteCheckpoints onCancel={() => setConfirmCompleteVisible(false)} deadline={deadline}></CompleteCheckpoints>);
  }

  return (
    <div className="deadlines-container">
      <div className="deadlines-header-section">
        <div className="header-text">
          <h1>My Deadlines</h1>
          <p>Stay on top of your upcoming tasks and exams.</p>
        </div>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search deadlines..."
              
            />

          </div>
          <button className="add-deadline-btn" onClick={enterNewDeadline}>+ New Deadline</button>
          {newDeadline && <NewDeadline onCancel={() => setNewDeadline(false)} onNext={transition} />}
          {newCheckpoints && <Checkpoints data={tempData} onCancel={() => setNewCheckpoints(false)} />}
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Tasks
          </button>
          <button
            className={`filter-tab ${filter === 'assignment' ? 'active' : ''}`}
            onClick={() => setFilter('assignment')}
          >
            Assignments
          </button>
          <button
            className={`filter-tab ${filter === 'project' ? 'active' : ''}`}
            onClick={() => setFilter('project')}
          >
            Projects
          </button>
          <button
            className={`filter-tab ${filter === 'exam' ? 'active' : ''}`}
            onClick={() => setFilter('exam')}
          >
            Exams
          </button>
        </div>
        <button 
          className={`sort-btn ${sortByUrgency ? 'active' : ''}`}
          onClick={() => setSortByUrgency(!sortByUrgency)}
        >
          <Filter size={16} /> {sortByUrgency ? 'Sorted by Urgency' : 'Sort By'}
        </button>
      </div>

      <div className="deadlines-grid">
        {deadlineExists && displayedDeadlines.map((deadline) => (
          <div className="deadline-card" key={deadline.id}>
            <div className="card-top">
              <span
                className="type-badge"
                style={{
                  backgroundColor: `${getUrgencyColor(deadline.urgency)}20`,
                  color: getUrgencyColor(deadline.urgency),
                  border: `1px solid ${getUrgencyColor(deadline.urgency)}40`
                }}
              >
                {getTypeIcon(deadline.type)}
                {deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)}
              </span>
              <button className="complete-btn" title="Mark Checkpoints" onClick={() => confirmComplete(deadline)}>
                <CheckCircle size={20} />
              </button>
            </div>

            <h3 className="card-title">{deadline.title}</h3>
            <p className="card-course">{deadline.course}</p>

            <div className="card-datetime">
              <div className="datetime-item">
                <Calendar size={16} className="icon-mint" />
                <span>{deadline.dueDate}</span>
              </div>
              <div className="datetime-item">
                <Clock size={16} className="icon-mint" />
                <span>{deadline.time}</span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Progress</span>
                <span className="progress-value">{deadline.progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${deadline.progress}%`,
                    backgroundColor: getUrgencyColor(deadline.urgency)
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        position: "relative",
        width: "100%",
        height: "450px"
      }}>
        {!deadlineExists && <div className='no-deadline-container'>
          <img src={`/src/assets/relax${theme === "dark" ? "" : "-light"}.png`} style={{ filter: "none" }} />
          <h2 style={{ fontFamily: "\"Cinzel\", serif" }}>Yay!</h2>
          <p>No Deadlines</p></div>}
      </div>
    </div>
  );
}