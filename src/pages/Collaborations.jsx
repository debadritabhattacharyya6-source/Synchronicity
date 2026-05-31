import { useEffect, useState } from "react";
import "./Collaborations.css";
import { db, auth } from "../assets/firebase";
import { Trash2 } from "lucide-react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export default function CollaborationPage() {
  const [groups, setGroups] = useState([]);
  const [workspaceTasks, setWorkspaceTasks] = useState({});

  const [activeWorkspace, setActiveWorkspace] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);

  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [completedGroup, setCompletedGroup] = useState(null);

  const activeGroup = groups.find((group) => group.code === activeWorkspace);
  const [newTeam, setNewTeam] = useState({
    title: "",
    members: "",
    deadline: "",
  });
  const [activeGroupMembers, setActiveGroupMembers] = useState([]);
  const fetchGroups = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const q = query(
        collection(db, "groups"),
        where("memberIds", "array-contains", user.uid),
      );

      const querySnapshot = await getDocs(q);

      const loadedGroups = [];

      querySnapshot.forEach((doc) => {
        loadedGroups.push(doc.data());
      });

      setGroups(loadedGroups);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const activeGroup = groups.find((group) => group.code === activeWorkspace);
    const loadMembers = async () => {
      if (!activeGroup) return;

      const members = [];

      const validUids = activeGroup.memberIds.filter(uid => uid && typeof uid === "string" && uid.trim() !== "");

      for (const uid of validUids) {
        const userDoc = await getDoc(doc(db, "users", uid));

        if (userDoc.exists()) {
          members.push({
            uid,
            ...userDoc.data(),
          });
        }
      }

      setActiveGroupMembers(members);
    };
    loadMembers();
  }, [activeWorkspace, groups]);

  useEffect(() => {
    if (!activeWorkspace) return;

    const workspace = workspaceTasks[activeWorkspace];

    if (!workspace) return;

    const totalTasks =
      (workspace.todo?.length || 0) +
      (workspace.inprogress?.length || 0) +
      (workspace.review?.length || 0) +
      (workspace.completed?.length || 0);

    if (totalTasks === 0) return;

    const allCompleted = workspace.completed?.length === totalTasks;

    if (allCompleted) {
      const group = groups.find((g) => g.code === activeWorkspace);

      setCompletedGroup(group);

      setShowCompletionModal(true);
    }
  }, [workspaceTasks, activeWorkspace, groups]);


  useEffect(() => {
    const handleUpdate = () => {
      fetchGroups();
    };
    window.addEventListener("collaborationsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("collaborationsUpdated", handleUpdate);
    };
  }, []);

  const tasks = workspaceTasks[activeWorkspace] || {
    todo: [],
    inprogress: [],
    review: [],
    completed: [],
  };

  const [showTaskModal, setShowTaskModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    assigned: "",
    due: "",
    priority: "",
  });
  const handleAddTask = async () => {
    if (
      !newTask.title ||
      !newTask.assigned ||
      !newTask.due ||
      !newTask.priority
    ) {
      return;
    }

    const updatedTasks = {
      ...workspaceTasks,

      [activeWorkspace]: {
        ...(workspaceTasks[activeWorkspace] || {
          todo: [],
          inprogress: [],
          review: [],
          completed: [],
        }),

        todo: [
          ...(workspaceTasks[activeWorkspace]?.todo || []),
          {
            ...newTask,
          },
        ],
      },
    };

    setWorkspaceTasks(updatedTasks);

    try {
      await setDoc(
        doc(db, "tasks", activeWorkspace),

        updatedTasks[activeWorkspace],
      );
    } catch (error) {
      console.log(error);
      alert(error.message);
    }

    setNewTask({
      title: "",
      assigned: "",
      due: "",
      priority: "",
    });

    setShowTaskModal(false);
  };
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const loadedTasks = {};

        for (const group of groups) {
          const taskRef = doc(db, "tasks", group.code);

          const taskSnap = await getDoc(taskRef);

          if (taskSnap.exists()) {
            loadedTasks[group.code] = taskSnap.data();
          }
        }

        setWorkspaceTasks(loadedTasks);
      } catch (error) {
        console.log(error);
        alert(error.message);
      }
    };

    if (groups.length > 0) {
      fetchTasks();
    }
  }, [groups]);

  const [joinCode, setJoinCode] = useState("");

  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleJoinWorkspace = async () => {
    if (!joinCode.trim()) {
      alert("Enter a code");
      return;
    }

    try {
      const q = query(collection(db, "groups"), where("code", "==", joinCode));

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Invalid workspace code");
        return;
      }

      const groupDoc = snapshot.docs[0];

      const groupData = groupDoc.data();

      await updateDoc(groupDoc.ref, {
        memberIds: arrayUnion(auth.currentUser.uid),
      });

      setGroups((prev) => {
        const exists = prev.some((g) => g.code === groupData.code);

        if (exists) return prev;

        return [
          ...prev,
          {
            ...groupData,
            memberIds: [...(groupData.memberIds || []), auth.currentUser.uid],
          },
        ];
      });

      setActiveWorkspace(groupData.code);

      setShowJoinModal(false);

      setJoinCode("");

      alert("Successfully joined workspace");
    } catch (error) {
      console.log(error);

      alert(error.message);
    }
  };

  const calculateProgress = (workspaceName) => {
    const workspace = workspaceTasks[workspaceName];

    if (!workspace) return 0;

    const totalTasks =
      (workspace.todo?.length || 0) +
      (workspace.inprogress?.length || 0) +
      (workspace.review?.length || 0) +
      (workspace.completed?.length || 0);

    if (totalTasks === 0) return 0;

    return Math.round((workspace.completed.length / totalTasks) * 100);
  };
  const overallProgress =
    groups.length === 0
      ? 0
      : Math.round(
        groups.reduce(
          (total, group) => total + calculateProgress(group.code),
          0,
        ) / groups.length,
      );

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

  const generateCode = async () => {
    let code;
    let exists = true;

    while (exists) {
      const random = Math.floor(1000 + Math.random() * 9000);

      code = `SYNC-${random}`;

      const groupRef = doc(db, "groups", code);

      const snapshot = await getDoc(groupRef);

      exists = snapshot.exists();
    }

    return code;
  };

  const handleCreateTeam = async () => {
    if (!newTeam.title || !newTeam.members || !newTeam.deadline) {
      alert("Fill all fields");
      return;
    }

    const code = await generateCode();

    const user = auth.currentUser;
    const q = query(
      collection(db, "groups"),
      where("memberIds", "array-contains", user.uid),
    );

    const createdTeam = {
      title: newTeam.title,
      maxMembers: Number(newTeam.members),
      deadline: newTeam.deadline,
      progress: 0,
      code,

      ownerId: user.uid,

      memberIds: [user.uid],
    };

    const emptyTasks = {
      todo: [],
      inprogress: [],
      review: [],
      completed: [],
    };

    try {
      await setDoc(doc(db, "groups", code), createdTeam);

      await setDoc(doc(db, "tasks", code), emptyTasks);

      setGroups((prev) => [...prev, createdTeam]);

      setWorkspaceTasks((prev) => ({
        ...prev,
        [code]: emptyTasks,
      }));

      setActiveWorkspace(code);

      setNewTeam({
        title: "",
        members: "",
        deadline: "",
      });

      setShowModal(false);
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  const handleDeleteGroup = async (groupCode) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this study group?",
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "groups", groupCode));

      await deleteDoc(doc(db, "tasks", groupCode));

      setGroups((prev) => prev.filter((group) => group.code !== groupCode));

      setWorkspaceTasks((prev) => {
        const updated = { ...prev };

        delete updated[groupCode];

        return updated;
      });

      if (activeWorkspace === groupCode) {
        setActiveWorkspace(null);
      }
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  const moveTask = async (task, fromColumn, toColumn) => {
    const currentUid = auth.currentUser.uid;

    if (toColumn !== "completed" && task.assignedUid !== currentUid) {
      alert("Only the assigned member can complete this task.");
      return;
    }
    const workspace = workspaceTasks[activeWorkspace];

    if (!workspace) return;

    const updatedWorkspace = {
      ...workspace,

      [fromColumn]: workspace[fromColumn].filter(
        (t) =>
          !(
            t.title === task.title &&
            t.assigned === task.assigned &&
            t.due === task.due
          ),
      ),

      [toColumn]: [...workspace[toColumn], task],
    };

    const updatedTasks = {
      ...workspaceTasks,
      [activeWorkspace]: updatedWorkspace,
    };

    setWorkspaceTasks(updatedTasks);

    try {
      await setDoc(doc(db, "tasks", activeWorkspace), updatedWorkspace);
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  return (
    <div className="collab-page">
      <div className="topbar">
        <div>
          <h1>Collaboration Workspace</h1>
          <p>Manage projects, deadlines, and study groups.</p>
        </div>

        <div className="topbar-right">
          <input type="text" placeholder="Search groups, tasks, files..." />

          <button>Create Workspace</button>
        </div>
      </div>
      <section className="hero">
        <div className="hero-left">
          <span className="badge">Realtime Collaboration</span>

          <h2>Study Better Together</h2>

          <p>
            Organize projects, collaborate with teammates, share resources, and
            never miss deadlines again.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => setShowModal(true)}>
              Create Team
            </button>

            <button
              className="secondary-btn"
              onClick={() => setShowJoinModal(true)}
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
                borderColor: getProgressColor(overallProgress).color,

                boxShadow: `0 0 35px ${getProgressColor(overallProgress).border}`,

                background: `radial-gradient(circle,
            ${getProgressColor(overallProgress).bg},
            transparent 72%)`,
              }}
            >
              <span>{overallProgress}%</span>
            </div>

            <p
              style={{
                color: getProgressColor(overallProgress).color,
              }}
            >
              {overallProgress >= 80
                ? "Excellent Progress"
                : overallProgress >= 50
                  ? "On Track"
                  : overallProgress >= 25
                    ? "Needs Attention"
                    : "Just Started"}
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
            const status = getProgressColor(calculateProgress(group.code));

            return (
              <div
                className={`group-card ${activeWorkspace === group.code ? "active-group" : ""
                  }`}
                key={index}
                onClick={() => setActiveWorkspace(group.code)}
              >
                <div className="group-top">
                  <h3>{group.title}</h3>

                  <span
                    style={{
                      color: status.color,
                    }}
                  >
                    {calculateProgress(group.code)}%
                  </span>

                  <button
                    className="delete-group-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(group.code);
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div>
                  <p>
                    {group.memberIds?.length || 0}/{group.maxMembers} Members •{" "}
                    {group.deadline}
                  </p>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${calculateProgress(group.code)}%`,
                      background: status.gradient,
                      boxShadow: `0 0 18px ${status.border}`,
                    }}
                  />
                </div>

                <small>Click to open workspace</small>
              </div>
            );
          })}
        </div>
      </section>
      <div className="workspace-header">
        {groups.length === 0 ? (
          <div className="empty-state">
            <h2>No Workspaces Yet</h2>
            <p>Create or join a workspace to start collaborating.</p>
          </div>
        ) : !activeWorkspace ? (
          <div className="empty-state">
            <h2>Select a Workspace</h2>
            <p>Choose a group from above to view tasks and collaboration.</p>
          </div>
        ) : (
          <>
            <div>
              <h2>{activeGroup?.title}</h2>
              <p>Active collaboration workspace</p>
            </div>

            <button onClick={() => setShowInviteModal(true)}>
              Invite Members
            </button>
          </>
        )}
      </div>
      {activeWorkspace && (
        <section className="section">
          <div className="section-header">
            <h2>Task Board</h2>

            {activeWorkspace && (
              <button
                className="add-task-btn"
                onClick={() => setShowTaskModal(true)}
              >
                + Add Task
              </button>
            )}
          </div>

          <div className="task-board">
            <div className="task-column">
              <h3>To Do</h3>

              {tasks.todo.map((task, i) => (
                <div className="task-card" key={i}>
                  <div className="task-title">{task.title}</div>
                  <button
                    className="task-move-btn"
                    onClick={() => moveTask(task, "todo", "inprogress")}
                  >
                    Start →
                  </button>

                  <div className="task-hover">
                    <p>
                      <strong>Assigned:</strong> {task.assigned}
                    </p>

                    <p>
                      <strong>Due:</strong> {task.due}
                    </p>

                    <p>
                      <strong>Priority:</strong> {task.priority}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* IN PROGRESS */}

            <div className="task-column">
              <h3>In Progress</h3>

              {tasks.inprogress.map((task, i) => (
                <div className="task-card" key={i}>
                  <div className="task-title">{task.title}</div>
                  <button
                    className="task-move-btn"
                    onClick={() => moveTask(task, "inprogress", "review")}
                  >
                    Send Review →
                  </button>

                  <div className="task-hover">
                    <p>
                      <strong>Assigned:</strong> {task.assigned}
                    </p>

                    <p>
                      <strong>Due:</strong> {task.due}
                    </p>

                    <p>
                      <strong>Priority:</strong> {task.priority}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* REVIEW */}

            <div className="task-column">
              <h3>Review</h3>

              {tasks.review.map((task, i) => (
                <div className="task-card" key={i}>
                  <div className="task-title">{task.title}</div>
                  <button
                    className="task-move-btn"
                    onClick={() => moveTask(task, "review", "completed")}
                  >
                    Complete →
                  </button>

                  <div className="task-hover">
                    <p>
                      <strong>Assigned:</strong> {task.assigned}
                    </p>

                    <p>
                      <strong>Due:</strong> {task.due}
                    </p>

                    <p>
                      <strong>Priority:</strong> {task.priority}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* COMPLETED */}

            <div className="task-column">
              <h3>Completed</h3>

              {tasks.completed.map((task, i) => (
                <div className="task-card completed" key={i}>
                  <div className="task-title">{task.title}</div>

                  <div className="task-hover">
                    <p>
                      <strong>Assigned:</strong> {task.assigned}
                    </p>

                    <p>
                      <strong>Status:</strong> Finished
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      ;
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
              type="date"
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

              <button className="create-btn" onClick={handleCreateTeam}>
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
                <h2>Invite Members</h2>

                <p>Share this workspace code with your teammates.</p>
              </div>

              <button
                className="close-invite"
                onClick={() => setShowInviteModal(false)}
              >
                ×
              </button>
            </div>

            <div className="invite-code-box">
              <span>Workspace Code</span>

              <strong>{activeGroup?.code}</strong>
            </div>

            <button
              className="copy-code-btn"
              onClick={() => {
                navigator.clipboard.writeText(activeGroup?.code);
              }}
            >
              Copy Invite Code
            </button>

            <div className="share-link">
              <span>Share Link</span>

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
              onChange={(e) => setJoinCode(e.target.value)}
            />

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </button>

              <button className="create-btn" onClick={handleJoinWorkspace}>
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
              required
            />

            <select
              value={newTask.assignedUid || ""}
              onChange={(e) => {
                const selectedUid = e.target.value;
                if (!selectedUid) {
                  setNewTask({
                    ...newTask,
                    assignedUid: "",
                    assigned: ""
                  });
                  return;
                }
                const member = activeGroupMembers.find((m) => m.uid === selectedUid);
                if (member) {
                  setNewTask({
                    ...newTask,
                    assignedUid: member.uid,
                    assigned: `${member.firstName || ""} ${member.lastName || ""}`.trim()
                  });
                }
              }}
              required
            >
              <option value="">Assign Member</option>

              {activeGroupMembers.map((member) => (
                <option key={member.uid} value={member.uid}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Due Date"
              value={newTask.due}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  due: e.target.value,
                })
              }
              required
            />

            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value,
                })
              }
              required
            >
              <option value="">Select Priority</option>

              <option value="Low">Low</option>

              <option value="Medium">Medium</option>

              <option value="High">High</option>

              <option value="Critical">Critical</option>
            </select>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowTaskModal(false)}
              >
                Cancel
              </button>

              <button className="create-btn" onClick={handleAddTask}>
                Add Task
              </button>
            </div>
          </div>
        </div>
      )
      }
      {
        showCompletionModal && completedGroup && (
          <div className="modal-overlay">
            <div className="team-modal completion-modal">
              <h2>🎉 Study Group Completed</h2>

              <p>
                All tasks for
                <strong> {completedGroup.title}</strong> have been completed.
              </p>

              <div className="modal-buttons">
                <button
                  className="cancel-btn"
                  onClick={() => setShowCompletionModal(false)}
                >
                  Keep Group
                </button>

                <button
                  className="delete-btn"
                  onClick={() => {
                    handleDeleteGroup(completedGroup.code);

                    setShowCompletionModal(false);
                  }}
                >
                  Delete Group
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
