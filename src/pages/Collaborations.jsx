import { useEffect, useState } from "react";
import "./Collaborations.css";

export default function CollaborationPage() {

  const [groups, setGroups] = useState([]);
  const [workspaceTasks, setWorkspaceTasks] =
  useState({});

  const [activeWorkspace, setActiveWorkspace] =
  useState(null);

const [showModal, setShowModal]= useState(false);

const [showInviteModal, setShowInviteModal] =
  useState(false);

const[newTeam, setNewTeam]=useState({
    title:"",
    members: "",
    deadline:"",
    
})

const tasks =
  workspaceTasks[activeWorkspace] || {
    todo: [],
    progress: [],
    review: [],
    completed: [],
  };

  const [showTaskModal, setShowTaskModal] =
  useState(false);

const [newTask, setNewTask] =
  useState({
    title: "",
    assigned: "",
    due: "",
    priority: "",
  });
  const handleAddTask = () => {

  if (
    !newTask.title ||
    !newTask.assigned ||
    !newTask.due ||
    !newTask.priority
  ) {
    return;
  }

  setWorkspaceTasks(prev => ({

    ...prev,

    [activeWorkspace]: {

      ...prev[activeWorkspace],

      todo: [
        ...prev[activeWorkspace].todo,

        {
          ...newTask,
        },
      ],
    },
  }));

  setNewTask({
    title: "",
    assigned: "",
    due: "",
    priority: "",
  });

  setShowTaskModal(false);
};

 
const [joinCode, setJoinCode] =
  useState("");

const [showJoinModal, setShowJoinModal] =
  useState(false);

  const handleJoinWorkspace = () => {

  const foundGroup =
    groups.find(
      group =>
        group.code === joinCode
    );

  if (!foundGroup) {
    alert("Invalid workspace code");
    return;
  }

  setActiveWorkspace(
    foundGroup.title
  );

  setShowJoinModal(false);

  setJoinCode("");
};

const calculateProgress = (workspaceName) => {

  const workspace =
    workspaceTasks[workspaceName];

  if (!workspace) return 0;

  const totalTasks =
    workspace.todo.length +
    workspace.progress.length +
    workspace.review.length +
    workspace.completed.length;

  if (totalTasks === 0) return 0;

  return Math.round(
    (workspace.completed.length /
      totalTasks) * 100
  );
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

const generateCode = () => {

  const random =
    Math.floor(
      1000 + Math.random() * 9000
    );

  return `SYNC-${random}`;
};

const handleCreateTeam=()=>{
    if(
        !newTeam.title||
        !newTeam.members||
        !newTeam.deadline
        
    ){return;}

    const createdTeam={
        title: newTeam.title,
        members: Number(newTeam.members),
        deadline: newTeam.deadline,
        progress: 0,
        code: generateCode(),
    }

    setGroups([...groups, createdTeam]);

     setWorkspaceTasks(prev => ({
  ...prev,

  [newTeam.title]: {
    todo: [],
    progress: [],
    review: [],
    completed: [],
  },
}));
    setActiveWorkspace(newTeam.title);

    setNewTeam({
    title: "",
    members: "",
    deadline: "",
    progress: "",
  });

  setShowModal(false);
};
const activeGroup =
  groups.find(
    group =>
      group.title === activeWorkspace
  );
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

            <button
  className="secondary-btn"
  onClick={() =>
    setShowJoinModal(true)
  }
>
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
                getProgressColor(calculateProgress(group.title));

            return (

                <div
                className={`group-card ${
                  activeWorkspace === group.title
                    ? "active-group"
                    : ""
                }`}
                key={index}
                 onClick={() =>
                  setActiveWorkspace(group.title)
                }
                >

                <div className="group-top">

                    <h3>{group.title}</h3>

                    <span
                    style={{
                        color: status.color,
                        
                    }}
                    >
                    {calculateProgress(group.title)}%
                    </span>

                </div>

                <p>
                    {group.members} Members • {" "}{group.deadline}
                </p>

                <div className="progress-bar">

                    <div
                    className="progress-fill"
                    style={{
                        width: `${calculateProgress(group.title)}%`,
                        background: status.gradient,
                        boxShadow:
                        `0 0 18px ${status.border}`,
                    }}
                    />

                </div>

               

                <small>
                  Click to open workspace
                </small>

                </div>
            );
            })}

        </div>
        </section>
        
        <div className="workspace-header">

        
          {groups.length === 0 ? (

  <div className="empty-state">

    <h2>No Workspaces Yet</h2>

    <p>
      Create or join a workspace to start collaborating.
    </p>

  </div>

) :(

  <>
     <div>

          <h2>{activeWorkspace}</h2>

          <p>
            Active collaboration workspace
          </p>

        </div>
<button
  onClick={() =>
    setShowInviteModal(true)
  }
>
  Invite Members
</button>
</>
)}
</div>

        <section className="section">

        <div className="section-header">
            <h2>Task Board</h2>

              {activeWorkspace && (

    <button
      className="add-task-btn"
      onClick={() =>
        setShowTaskModal(true)
      }
    >
      + Add Task
    </button>

  )}
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
{/* INVITE MODAL */}

{showInviteModal && (

  <div className="invite-overlay">

    <div className="invite-modal">

      <div className="invite-top">

        <div>

          <h2>
            Invite Members
          </h2>

          <p>
            Share this workspace code
            with your teammates.
          </p>

        </div>

        <button
          className="close-invite"
          onClick={() =>
            setShowInviteModal(false)
          }
        >
          ×
        </button>

      </div>

      <div className="invite-code-box">

        <span>
          Workspace Code
        </span>

        <strong>
          {activeGroup?.code}
        </strong>

      </div>

      <button
        className="copy-code-btn"
        onClick={() => {

          navigator.clipboard.writeText(
            activeGroup?.code
          );
        }}
      >
        Copy Invite Code
      </button>

      <div className="share-link">

        <span>
          Share Link
        </span>

        <p>
          syncsphere.app/join/
          {activeGroup?.code}
        </p>

      </div>

    </div>

  </div>
)}

{showJoinModal && (

  <div className="modal-overlay">

    <div className="team-modal">

      <h2>Join Workspace</h2>

      <input
        type="text"
        placeholder="Enter Invite Code"
        value={joinCode}
        onChange={(e) =>
          setJoinCode(e.target.value)
        }
      />

      <div className="modal-buttons">

        <button
          className="cancel-btn"
          onClick={() =>
            setShowJoinModal(false)
          }
        >
          Cancel
        </button>

        <button
          className="create-btn"
          onClick={handleJoinWorkspace}
        >
          Join
        </button>

      </div>

    </div>

  </div>
)}

{showTaskModal && (

  <div className="modal-overlay">

    <div className="team-modal">

      <h2>Add New Task</h2>

      <input
        type="text"
        placeholder="Task Title"
        value={newTask.title}
        onChange={(e) =>
          setNewTask({
            ...newTask,
            title: e.target.value,
          })
        }
      />

      <input
        type="text"
        placeholder="Assigned To"
        value={newTask.assigned}
        onChange={(e) =>
          setNewTask({
            ...newTask,
            assigned: e.target.value,
          })
        }
      />

      <input
        type="text"
        placeholder="Due Date"
        value={newTask.due}
        onChange={(e) =>
          setNewTask({
            ...newTask,
            due: e.target.value,
          })
        }
      />

      <select
        value={newTask.priority}
        onChange={(e) =>
          setNewTask({
            ...newTask,
            priority: e.target.value,
          })
        }
      >

        <option value="">
          Select Priority
        </option>

        <option value="Low">
          Low
        </option>

        <option value="Medium">
          Medium
        </option>

        <option value="High">
          High
        </option>

        <option value="Critical">
          Critical
        </option>

      </select>

      <div className="modal-buttons">

        <button
          className="cancel-btn"
          onClick={() =>
            setShowTaskModal(false)
          }
        >
          Cancel
        </button>

        <button
          className="create-btn"
          onClick={handleAddTask}
        >
          Add Task
        </button>

      </div>

    </div>

  </div>

)}

    </div>

  
  )};
