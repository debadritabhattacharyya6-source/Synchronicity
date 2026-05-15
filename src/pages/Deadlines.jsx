import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, FileText, CheckCircle, Search, Filter } from 'lucide-react';
import './Deadlines.css';

export default function Deadlines() {
  const [filter, setFilter] = useState('all'); // all, assignment, exam, project

  const allDeadlines = [
    {
      id: 1,
      title: 'Advanced AI Project Proposal',
      course: 'Machine Learning',
      type: 'project',
      dueDate: 'Apr 28, 2026',
      time: '11:59 PM',
      urgency: 'high',
      progress: 40,
    },
    {
      id: 2,
      title: 'Midterm Exam',
      course: 'Distributed Systems',
      type: 'exam',
      dueDate: 'Apr 29, 2026',
      time: '9:00 AM',
      urgency: 'high',
      progress: 0,
    },
    {
      id: 3,
      title: 'HCI Usability Testing Report',
      course: 'Human-Computer Interaction',
      type: 'assignment',
      dueDate: 'May 1, 2026',
      time: '5:00 PM',
      urgency: 'medium',
      progress: 75,
    },
    {
      id: 4,
      title: 'Software Engineering Group Presentation',
      course: 'Software Engineering',
      type: 'project',
      dueDate: 'May 2, 2026',
      time: '2:30 PM',
      urgency: 'medium',
      progress: 90,
    },
    {
      id: 5,
      title: 'Weekly Math Problem Set 10',
      course: 'Discrete Mathematics',
      type: 'assignment',
      dueDate: 'May 5, 2026',
      time: '11:59 PM',
      urgency: 'low',
      progress: 10,
    },
    {
      id: 6,
      title: 'Final Research Paper',
      course: 'Cybersecurity',
      type: 'project',
      dueDate: 'May 15, 2026',
      time: '11:59 PM',
      urgency: 'low',
      progress: 20,
    }
  ];

  const filteredDeadlines = filter === 'all' 
    ? allDeadlines 
    : allDeadlines.filter(d => d.type === filter);

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'var(--danger, #ff4d4d)';
      case 'medium': return 'var(--warning, #ffa64d)';
      case 'low': return 'var(--mint-strong, #52b788)';
      default: return 'var(--mint, #74c69d)';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'assignment': return <FileText size={18} />;
      case 'exam': return <AlertCircle size={18} />;
      case 'project': return <Calendar size={18} />;
      default: return <FileText size={18} />;
    }
  };

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
            <input type="text" placeholder="Search deadlines..." />
          </div>
          <button className="add-deadline-btn">+ New Deadline</button>
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
        <button className="sort-btn">
          <Filter size={16} /> Sort By
        </button>
      </div>

      <div className="deadlines-grid">
        {filteredDeadlines.map((deadline) => (
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
              <button className="complete-btn" title="Mark as complete">
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
    </div>
  );
}
