import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SquarePen } from 'lucide-react';
import './Auth.css';
import { auth, db } from "/src/assets/firebase"
import { doc, runTransaction, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import '/src/components/Modal.css';
import Modal from '../components/Modal';
import EditCheckpoints from './EditCheckpoints';
import './deadlines.css';

export default function CompleteCheckpoints({ onCancel, deadline: initialDeadline }) {
    const [deadline, setDeadline] = useState(initialDeadline);
    const [isCompleteVisible, setIsCompleteVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!auth.currentUser) {
                    setLoading(false);
                    return;
                }

                const userDoc = doc(db, "users", auth.currentUser.uid);
                const docSnap = await getDoc(userDoc);

                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                    setDeadline(docSnap.data().deadlines.filter((deadline) => deadline.id === initialDeadline.id)[0]);
                } else {
                    console.log("User document not found");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    });

    const [editCheckpointsVisible, setEditCheckpointsVisible] = useState(false);

    const handleToggle = async (deadlineId, checkpointId) => {
        try {
            setDeadline((prevDeadline) => {
                const updatedCheckpoints = prevDeadline.checkpoints.map((checkpoint, index) => {
                    if (checkpoint.id !== checkpointId) return checkpoint;
                    return {
                        ...checkpoint,
                        completed: !checkpoint.completed
                    };
                });
                const totalCheckpoints = updatedCheckpoints.length;
                const completedCount = updatedCheckpoints.filter(cp => cp.completed).length;
                const newProgress = totalCheckpoints > 0
                    ? Math.round((completedCount / totalCheckpoints) * 100)
                    : 0;

                return {
                    ...prevDeadline,
                    checkpoints: updatedCheckpoints,
                    progress: newProgress
                };
            });

            const userDoc = doc(db, "users", auth.currentUser.uid);
            await runTransaction(db, async (transaction) => {
                const docRef = await transaction.get(userDoc);
                if (!docRef.exists()) throw "User does not exist";

                const existingDeadlines = docRef.data().deadlines || [];
                const newDeadlineArray = existingDeadlines.map((item) => {
                    if (item.id !== deadlineId) return item;

                    const updatedCheckpoints = item.checkpoints.map((checkpoint) => {
                        if (checkpoint.id !== checkpointId) return checkpoint;
                        return {
                            ...checkpoint,
                            completed: !checkpoint.completed
                        };
                    });

                    const totalCheckpoints = updatedCheckpoints.length;
                    const completedCount = updatedCheckpoints.filter(cp => cp.completed).length;
                    const newProgress = totalCheckpoints > 0
                        ? Math.round((completedCount / totalCheckpoints) * 100)
                        : 0;

                    return {
                        ...item,
                        checkpoints: updatedCheckpoints,
                        progress: newProgress
                    };
                });

                transaction.update(userDoc, { deadlines: newDeadlineArray });
            });
        } catch (err) {
            console.error(err);
        }
    };

    const onComplete = async (deadline) => {
        let idToBeDeleted = deadline.id;
        const userDoc = doc(db, "users", auth.currentUser.uid);
        try {
            await runTransaction(db, async (transaction) => {
                const docRef = await transaction.get(userDoc);
                if (!docRef.exists()) throw "User does not exist";
                const existingDeadlines = docRef.data().deadlines || [];
                const completedDeadlines = docRef.data().completedDeadlines || [];

                const newDeadlineArray = existingDeadlines.filter((item) => item.id !== idToBeDeleted);
                const deadlineToBeDeleted = existingDeadlines.find((item) => item.id === idToBeDeleted);
                const newCompletedDeadlines = [...completedDeadlines];

                if (deadlineToBeDeleted) {
                    const updatedCheckpoints = deadlineToBeDeleted.checkpoints.map((checkpoint, index) => {
                        const isLast = index === deadlineToBeDeleted.checkpoints.length - 1;

                        if (isLast) {
                            return { ...checkpoint, completed: true };
                        }
                        return checkpoint;
                    });

                    const updatedItem = {
                        ...deadlineToBeDeleted,
                        completed: true,
                        checkpoints: updatedCheckpoints,
                        progress: 100,
                        urgency: "low"
                    }
                    newCompletedDeadlines.push(updatedItem);
                }

                transaction.update(userDoc, { deadlines: newDeadlineArray, completedDeadlines: newCompletedDeadlines });
            });
            setIsCompleteVisible(false);
            onCancel();
        }
        catch (err) {
            console.error(err);
        }
    };

    const handleComplete = () => {
        setIsCompleteVisible(true);
    };

    if (isCompleteVisible) {
        return (<Modal
            modalVisible={isCompleteVisible}
            title="Complete Task?"
            onConfirm={() => onComplete(deadline)}
            onCancel={() => setIsCompleteVisible(false)}
            confirmText='Delete'
        >
            <p>This Deadline will be deleted after 7 days</p>
        </Modal>);
    }

    if (loading) return <div>Loading Profile Data...</div>;
    if (!userData) return <div>No user profile found.</div>;

    const handleEditToggle = () => {
        setEditCheckpointsVisible(true);
    };

    if (editCheckpointsVisible) {
        const deadlineData = userData.deadlines.filter((deadline) => deadline.id === initialDeadline.id)[0];
        return (<EditCheckpoints data={deadlineData} onCancel={() => setEditCheckpointsVisible(false)} />);
    }

    return createPortal((
        <div className='auth-page' style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 99999,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: "40px 0"
        }} onClick={onCancel}>
            <div className='auth-container' style={{ width: "500px", maxWidth: "95%", margin: "auto" }} onClick={(e) => e.stopPropagation()}>
                <fieldset>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "14px"
                    }}>
                        <legend className='auth-title' align="center" style={{ marginBottom: "0px" }}>Checkpoints</legend>
                        <SquarePen className='complete-btn' style={{ width: "100%", height: "100%", borderRadius: "20%" }} onClick={handleEditToggle} />
                    </div>
                    {deadline.checkpoints.map((checkpoint, index) => {
                        const isCompleteCheckpoint = index === deadline.checkpoints.length - 1;
                        const isLastCheckpoint = isCompleteCheckpoint && index != 0;
                        const hasIncompleteCheckpoints = deadline.checkpoints
                            .slice(0, -1)
                            .some(cp => !cp.completed);

                        const isLocked = isCompleteCheckpoint && hasIncompleteCheckpoints;
                        return (
                            <label style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                fontSize: "20px",
                                fontFamily: "Cinzel, serif",
                                color: "rgba(255,255,255,0.7)",
                                borderTop: isLastCheckpoint ? "1px dashed rgba(168, 255, 203, 0.2)" : "none",
                                paddingTop: isLastCheckpoint ? "14px" : "0",
                                marginTop: isLastCheckpoint ? "18px" : "14px",
                                color: isLocked ? "rgba(255,255,255,0.25)" : isLastCheckpoint ? "#a8ffcb" : "rgba(255,255,255,0.7)",
                                transition: "all 0.25s ease"
                            }} key={checkpoint.id}>
                                <input
                                    type='checkbox'
                                    className="real-checkbox"
                                    onChange={isCompleteCheckpoint ? handleComplete : () => handleToggle(deadline.id, checkpoint.id)}
                                    checked={checkpoint.completed}
                                    disabled={isLocked}
                                />
                                <span className={`diamond-bullet
                                    ${isLocked ? 'is-locked' : ''}`}></span>
                                <span style={{
                                    fontWeight: isCompleteCheckpoint ? "600" : "normal",
                                    letterSpacing: isCompleteCheckpoint ? "0.5px" : "normal"
                                }}>
                                    {checkpoint.label}
                                </span>
                            </label>
                        )
                    })}
                </fieldset>
                <button className="auth-submit" style={{ marginTop: "30px", width: "100%" }} onClick={onCancel}>
                    SAVE PROGRESS
                </button>
            </div>
        </div>
    ), document.getElementById('root-portal'));
}