import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './Auth.css';
import { auth, db } from "/src/assets/firebase"
import { doc, runTransaction, updateDoc } from "firebase/firestore";
import '/src/components/Modal.css';

export default function NewDeadline({ onCancel }) {
    const [deadlineName, setDeadlineName] = useState("");
    const [deadlineCourse, setDeadlineCourse] = useState('');
    const [deadlineType, setDeadlineType] = useState("");
    const [deadlineDate, setDeadlineDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [deadlineTime, setDeadlineTime] = useState('');

    const [isSubmitted, setIsSubmitted] = useState(false);

    const getUrgency = () => {
        const today = new Date();
        const deadline = new Date(deadlineDate);
        deadline.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const differenceInMS = deadline - today;
        const differenceInDays = differenceInMS / (1000 * 60 * 60 * 24);
        let urgency = 'low';
        if (differenceInDays <= 7) {
            urgency = 'high';
        }
        else if (differenceInDays <= 14) {
            urgency = 'medium';
        }
        else {
            urgency = 'low';
        }
        return urgency;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const deadlineId = `${Date.now()}`;
        try {
            const userDoc = doc(db, "users", auth.currentUser.uid);
            await runTransaction(db, async (transation) => {
                const docRef = await transation.get(userDoc);
                if (!docRef.exists()) throw "User does not exist";
                const existingDeadlines = docRef.data().deadlines || [];
                const nextId = existingDeadlines.length > 0
                    ? Math.max(...existingDeadlines.map(o => o.id || 0)) + 1
                    : 1;
                const updatedItem = {
                    id: nextId,
                    title: deadlineName,
                    course: deadlineCourse,
                    type: deadlineType,
                    dueDate: deadlineDate,
                    time: deadlineTime,
                    urgency: getUrgency(),
                    progress: 0
                }
                const newDeadlineArray = [...existingDeadlines, updatedItem];
                transation.update(userDoc, { deadlines: newDeadlineArray });
            });
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
        }
    }

    if (isSubmitted) {
        return createPortal((
            <div className="modal-overlay" onClick={onCancel}>
                <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                    <div className='modal-title'>
                        <h2>Deadline Added</h2>
                    </div>
                    <div className='modal-buttons'>
                        <button onClick={onCancel} className='modal-cancel'>Done</button>
                    </div>
                </div>
            </div>
        ), document.getElementById('root-portal'));
    }

    return createPortal((
        <div className='auth-page' style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
            zIndex: 99999,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: "40px 0"
        }} onClick={onCancel}>
            <div className='auth-container' style={{ width: "500px", maxWidth: "95%", margin: "auto" }} onClick={(e) => e.stopPropagation()}>
                <h2 className='auth-title'>Enter details</h2>
                <form onSubmit={handleSubmit} className='auth-form'>
                    <div className='input-group'>
                        <label htmlFor='deadlineName'>Title</label>
                        <input
                            type='text'
                            id='deadlineName'
                            value={deadlineName}
                            onChange={(e) => setDeadlineName(e.target.value)}
                            required
                            placeholder='Enter name of deadline'
                        />
                    </div>
                    <div className='input-group'>
                        <label htmlFor='deadlineCourse'>Course</label>
                        <input
                            type='text'
                            id='deadlineCourse'
                            value={deadlineCourse}
                            onChange={(e) => setDeadlineCourse(e.target.value)}
                            required
                            placeholder='Enter course name'
                        />
                    </div>
                    <div className='input-group'>
                        <label htmlFor='deadlineType'>Type</label>
                        <div id='deadlineType' className='type-group'>
                            <span className='radio-item'>
                                <input
                                    type='radio'
                                    id='Assignment'
                                    value='Assignment'
                                    name='Type'
                                    onChange={(e) => setDeadlineType(e.target.value.toLowerCase())}
                                    required
                                />
                                <label htmlFor='Assignment'>Assignment</label>
                            </span>
                            <span className='radio-item'>
                                <input
                                    type='radio'
                                    id='Project'
                                    value='Project'
                                    name='Type'
                                    onChange={(e) => setDeadlineType(e.target.value.toLowerCase())}
                                    required
                                />
                                <label htmlFor='Project'>Project</label>
                            </span>
                            <span className='radio-item'>
                                <input
                                    type='radio'
                                    id='Exam'
                                    value='Exam'
                                    name='Type'
                                    onChange={(e) => setDeadlineType(e.target.value.toLowerCase())}
                                    required
                                />
                                <label htmlFor='Exam'>Exam</label>
                            </span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                        <div className='input-group' style={{ flex: "1 1 150px" }}>
                            <label htmlFor='lastDate'>Last Date</label>
                            <input
                                type='date'
                                id='lastDate'
                                value={deadlineDate}
                                onChange={(e) => setDeadlineDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className='input-group' style={{ flex: "1 1 150px" }}>
                            <label htmlFor='lastTime'>Time</label>
                            <input
                                type='Time'
                                id='lastTime'
                                value={deadlineTime}
                                onChange={(e) => setDeadlineTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="auth-submit" style={{ marginTop: "20px" }}>
                        SAVE DEADLINE
                    </button>
                </form>
            </div>
        </div>
    ), document.getElementById('root-portal'));
}