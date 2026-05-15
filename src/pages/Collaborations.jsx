import { useEffect, useState } from "react";
import "./Collaborations.css";

export default function CollaborationPage() {
  const [groups, setGroups] = useState([
    {
      title: "DBMS Project",
      members: 5,
      deadline: "3 days left",
      progress: 30,
    },
    {
      title: "Operating Systems",
      members: 4,
      deadline: "Tomorrow",
      progress: 62,
    },
    {
      title: "Hackathon Team",
      members: 6,
      deadline: "5 days left",
      progress: 84,
    },
  ]);
const [showModal, setShowModal]= useState(false);

const[newTeam, setNewTeam]=useState({
    title:"",
    members: "",
    deadline:"",
    progress:"",
})
const tasks = {
  todo: [
    {
      title: "Research APIs",
      assigned: "Riya",
      due: "Tomorrow",
      priority: "High",
    },

    {
      title: "Create Wireframes",
      assigned: "Ananya",
      due: "2 days",
      priority: "Medium",
    },
  ],

  progress: [
    {
      title: "Frontend UI",
      assigned: "Arjun",
      due: "Today",
      priority: "High",
    },
  ],

  review: [
    {
      title: "PPT Slides",
      assigned: "Neha",
      due: "3 days",
      priority: "Low",
    },
  ],

  completed: [
    {
      title: "Project Proposal",
      assigned: "Rahul",
      due: "Completed",
      priority: "Done",
    },
  ],
};

const getProgressColor = (progress) => {
  if (progress >= 70) {
    return {
      color: "#4ade80",
      bg: "rgba(34,197,94,0.12)",
      border: "rgba(34,197,94,0.22)",
      gradient: "linear-gradient(90deg,#22c55e,#4ade80)",
    };
  }

  if (progress >= 40) {
    return {
      color: "#fde68a",
      bg: "rgba(250,204,21,0.12)",
      border: "rgba(250,204,21,0.22)",
      gradient: "linear-gradient(90deg,#facc15,#fde68a)",
    };
  }

  return {
    color: "#fca5a5",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.22)",
    gradient: "linear-gradient(90deg,#ef4444,#f87171)",
  };
};

const handleCreateTeam=()=>{
    if(
        !newTeam.title||
        !newTeam.members||
        !newTeam.deadline||
        !newTeam.progress
    ){return;}

    const createdTeam={
        title: newTeam.title,
        members: Number(newTeam.members),
        deadline: newTeam.deadline,
        progress: Number(newTeam.progress),
    }

    setGroups([...groups, createdTeam]);
    setNewTeam({
    title: "",
    members: "",
    deadline: "",
    progress: "",
  });

  setShowModal(false);
};

  return (
    <div className="collab-page">

      <div className="topbar">
        <div>
          <h1>Collaboration Workspace</h1>
          <p>Manage projects, deadlines, and study groups.</p>
        </div>

        <div className="topbar-right">
          <input
            type="text"
            placeholder="Search groups, tasks, files..."
          />

          <button>Create Workspace</button>
        </div>
      </div>


      <section className="hero">
        <div className="hero-left">
          <span className="badge">Realtime Collaboration</span>

          <h2>Study Better Together</h2>

          <p>
            Organize projects, collaborate with teammates,
            share resources, and never miss deadlines again.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn"
            onClick ={()=> setShowModal(true)}>
              Create Team
            </button>

            <button className="secondary-btn">
              Join Workspace
            </button>
          </div>
        </div>

      <div className="hero-right">

        <div className="floating-card">

          <h3>Team Progress</h3>

      <div
        className="progress-circle"
        style={{
          borderColor:
            getProgressColor(84).color,

          boxShadow:
            `0 0 35px ${getProgressColor(84).border}`,

          background:
            `radial-gradient(circle,
            ${getProgressColor(84).bg},
            transparent 72%)`,
        }}
      >
        <span>84%</span>
      </div>

      <p
        style={{
          color:
            getProgressColor(84).color,
        }}
      >
        Low urgency • On track
      </p>

    </div>
  </div>
      </section>

        <section className="section">
        <div className="section-header">
            <h2>Active Study Groups</h2>
        </div>

        <div className="group-grid">

            {groups.map((group, index) => {

            const status =
                getProgressColor(group.progress);

            return (

                <div
                className="group-card"
                key={index}
                >

                <div className="group-top">

                    <h3>{group.title}</h3>

                    <span
                    style={{
                        color: status.color,
                        
                    }}
                    >
                    {group.progress}%
                    </span>

                </div>

                <p>
                    {group.members} Members • {group.deadline}
                </p>

                <div className="progress-bar">

                    <div
                    className="progress-fill"
                    style={{
                        width: `${group.progress}%`,
                        background: status.gradient,
                        boxShadow:
                        `0 0 18px ${status.border}`,
                    }}
                    />

                </div>

                <small>
                    Last updated 12 mins ago
                </small>

                </div>
            );
            })}

        </div>
        </section>



        <section className="section">

        <div className="section-header">
            <h2>Task Board</h2>
        </div>

        <div className="task-board">



            <div className="task-column">

            <h3>To Do</h3>

            {tasks.todo.map((task, i) => (

                <div
                className="task-card"
                key={i}
                >

                <div className="task-title">
                    {task.title}
                </div>

                <div className="task-hover">

                    <p>
                    <strong>Assigned:</strong>
                    {" "}
                    {task.assigned}
                    </p>

                    <p>
                    <strong>Due:</strong>
                    {" "}
                    {task.due}
                    </p>

                    <p>
                    <strong>Priority:</strong>
                    {" "}
                    {task.priority}
                    </p>

                </div>

                </div>

            ))}

            </div>

            {/* IN PROGRESS */}

            <div className="task-column">

            <h3>In Progress</h3>

            {tasks.progress.map((task, i) => (

                <div
                className="task-card"
                key={i}
                >

                <div className="task-title">
                    {task.title}
                </div>

                <div className="task-hover">

                    <p>
                    <strong>Assigned:</strong>
                    {" "}
                    {task.assigned}
                    </p>

                    <p>
                    <strong>Due:</strong>
                    {" "}
                    {task.due}
                    </p>

                    <p>
                    <strong>Priority:</strong>
                    {" "}
                    {task.priority}
                    </p>

                </div>

                </div>

            ))}

            </div>

            {/* REVIEW */}

            <div className="task-column">

            <h3>Review</h3>

            {tasks.review.map((task, i) => (

                <div
                className="task-card"
                key={i}
                >

                <div className="task-title">
                    {task.title}
                </div>

                <div className="task-hover">

                    <p>
                    <strong>Assigned:</strong>
                    {" "}
                    {task.assigned}
                    </p>

                    <p>
                    <strong>Due:</strong>
                    {" "}
                    {task.due}
                    </p>

                    <p>
                    <strong>Priority:</strong>
                    {" "}
                    {task.priority}
                    </p>

                </div>

                </div>

            ))}

            </div>

            {/* COMPLETED */}

            <div className="task-column">

            <h3>Completed</h3>

            {tasks.completed.map((task, i) => (

                <div
                className="task-card completed"
                key={i}
                >

                <div className="task-title">
                    {task.title}
                </div>

                <div className="task-hover">

                    <p>
                    <strong>Assigned:</strong>
                    {" "}
                    {task.assigned}
                    </p>

                    <p>
                    <strong>Status:</strong>
                    {" "}
                    Finished
                    </p>

                </div>

                </div>

            ))}

            </div>

        </div>

        </section>
      <section className="section">
        <div className="section-header">
          <h2>Upcoming Study Sessions</h2>
        </div>

        <div className="session-grid">

          <div className="session-card">
            <h3>Operating Systems Revision</h3>

            <p>Today • 7:30 PM</p>

            <span>4/6 Members Joined</span>

            <button>Join Session</button>
          </div>

          <div className="session-card">
            <h3>DBMS Mock Viva</h3>

            <p>Tomorrow • 5:00 PM</p>

            <span>3/5 Members Joined</span>

            <button>Join Session</button>
          </div>

        </div>
      </section>
      {/* CREATE TEAM MODAL */}

{showModal && (

  <div className="modal-overlay">

    <div className="team-modal">

      <h2>Create New Team</h2>

      <input
        type="text"
        placeholder="Team Name"
        value={newTeam.title}
        onChange={(e) =>
          setNewTeam({
            ...newTeam,
            title: e.target.value,
          })
        }
      />

      <input
        type="number"
        placeholder="Members"
        value={newTeam.members}
        onChange={(e) =>
          setNewTeam({
            ...newTeam,
            members: e.target.value,
          })
        }
      />

      <input
        type="text"
        placeholder="Deadline"
        value={newTeam.deadline}
        onChange={(e) =>
          setNewTeam({
            ...newTeam,
            deadline: e.target.value,
          })
        }
      />

      <input
        type="number"
        placeholder="Progress %"
        value={newTeam.progress}
        onChange={(e) =>
          setNewTeam({
            ...newTeam,
            progress: e.target.value,
          })
        }
      />

      <div className="modal-buttons">

        <button
          className="cancel-btn"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>

        <button
          className="create-btn"
          onClick={handleCreateTeam}
        >
          Create
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  )};
