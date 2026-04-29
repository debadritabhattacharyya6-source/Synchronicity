import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Calendar.css";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month' or 'week'

  const today = new Date();

  // Helper functions
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    }
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    
    const days = [];
    
    // Previous month filler days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month filler days (to make up rows of 7)
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const getWeekDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = currentDate.getDate();
    const dayOfWeek = currentDate.getDay(); // 0 (Sun) to 6 (Sat)
    
    const startOfWeek = new Date(year, month, date - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        date: d,
        isCurrentMonth: d.getMonth() === month
      });
    }
    return days;
  };

  const isToday = (date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Mock events for UI demonstration
  const getMockEvents = (date) => {
    const day = date.getDate();
    const events = [];
    
    if (day === 5 || day === 15) {
      events.push({ title: "Project Meeting", type: "event-blue" });
    }
    if (day === 12) {
      events.push({ title: "Deadline Submission", type: "event-red" });
    }
    if (day === 22) {
      events.push({ title: "Team Sync", type: "event-green" });
    }
    
    return events;
  };

  const renderCells = () => {
    const days = viewMode === "month" ? getMonthDays() : getWeekDays();

    // If week mode, only show 1 row, else show 6 rows (42 days)
    const visibleDays = viewMode === "month" ? days : days.slice(0, 7);

    return visibleDays.map((dayObj, index) => {
      const events = getMockEvents(dayObj.date);
      return (
        <div 
          key={index} 
          className={`calendar-cell ${!dayObj.isCurrentMonth ? 'different-month' : ''} ${isToday(dayObj.date) ? 'today' : ''}`}
        >
          <span className="cell-date">{dayObj.date.getDate()}</span>
          {events.map((ev, i) => (
            <div key={i} className={`calendar-event ${ev.type}`}>
              {ev.title}
            </div>
          ))}
        </div>
      );
    });
  };

  const formatHeaderDate = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const date = currentDate.getDate();
      const start = new Date(year, month, date - currentDate.getDay());
      const end = new Date(year, month, date + (6 - currentDate.getDay()));
      
      const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `${startStr} - ${endStr}`;
    }
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="calendar-page">
      <div className="calendar-header-top">
        <h1 className="calendar-title">Calendar</h1>
        
        <div className="calendar-controls">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
          </div>

          <div className="nav-group">
            <button className="nav-btn" onClick={handlePrev}>
              <ChevronLeft size={20} />
            </button>
            <span className="current-date-label">{formatHeaderDate()}</span>
            <button className="nav-btn" onClick={handleNext}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-grid-header">
          {dayNames.map(day => (
            <div key={day} className="day-name">{day}</div>
          ))}
        </div>
        
        <div className={`calendar-grid-body ${viewMode}-view`}>
          {renderCells()}
        </div>
      </div>
    </div>
  );
}
