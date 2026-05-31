import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, Trash, Trash2 } from 'lucide-react';
import './Auth.css';
import { auth, db } from "/src/assets/firebase"
import { doc, runTransaction, updateDoc } from "firebase/firestore";
import '/src/components/Modal.css';

export default function Checkpoints({ data, onCancel }) {
    const [checkpoints, setCheckpoints] = useState(data.checkpoints);
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userDoc = doc(db, "users", auth.currentUser.uid);
            await runTransaction(db, async (transaction) => {
                const docRef = await transaction.get(userDoc);
                if (!docRef.exists()) throw "User does not exist";
                const existingDeadlines = docRef.data().deadlines || [];
                const completedCheckpoints = checkpoints.filter((checkpoint) => checkpoint.completed);
                const newProgress = (completedCheckpoints.length / checkpoints.length) * 100;
                const updatedItem = {
                    ...data,
                    progress: newProgress,
                    checkpoints: checkpoints
                }
                const newDeadlineArray = existingDeadlines.map((deadline) => {
                    if (deadline.id === data.id) return updatedItem;
                    else return deadline;
                });
                console.log(newDeadlineArray);
                transaction.update(userDoc, { deadlines: newDeadlineArray });
            });
            onCancel();
        } catch (err) {
            console.error(err);
        }
    }

    const handleDelete = (id) => {
        setCheckpoints(checkpoints.filter((checkpoint) => checkpoint.id !== id));
    };

    const addCheckpoint = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        const nextId = `${Date.now()}`;
        setCheckpoints([
            { id: nextId, label: inputValue.trim(), completed: false },
            ...checkpoints
        ]);
        setInputValue('');
    };

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
                <h2 className='auth-title'>Enter Checkpoints</h2>
                <form className='auth-form' onSubmit={handleSubmit}>
                    <div className='input-container'>
                        <input
                            type='text'
                            className='checkpoint-input'
                            placeholder='+   Add new checkpoint'
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type='button' className="complete-btn" onClick={addCheckpoint}>
                            <CheckCircle size={20} />
                        </button>
                    </div>
                    <ul className='auth-bullets'>
                        {checkpoints.map((checkpoint) => (
                            <li key={checkpoint.id} style={{ fontSize: "20px", fontFamily: "Cinzel, serif", color: "rgba(255,255,255,0.7)", display: "flex", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", gap: "15px", alignItems: "center", justifyContent: "center" }}>
                                    <span className='diamond-bullet'></span>
                                    <span>
                                        {checkpoint.label}
                                    </span>
                                </div>
                                {index !== checkpoints.length - 1 &&
                                    <Trash className='delete-btn' onClick={() => handleDelete(checkpoint.id)} />
                                }
                            </li>
                        ))}
                    </ul>
                    <button type="submit" className="auth-submit" style={{ marginTop: "20px" }}>
                        SAVE CHECKPOINTS
                    </button>
                </form>
            </div>
        </div>
    ), document.getElementById('root-portal'));
}