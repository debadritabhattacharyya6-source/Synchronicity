import React, {useState} from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

export default function Modal({ modalVisible, title, children, onConfirm, onCancel, confirmText = "Confirm" }){
    if(!modalVisible) return null;

    return createPortal(
        <div className = "modal-overlay" onClick={onCancel}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className='modal-title'>
                    <h2>{title}</h2>
                </div>
                <div className='modal-child'>
                    {children}
                </div>
                <div className='modal-buttons'>
                    <button onClick={onCancel} className='modal-cancel'>Cancel</button>
                    <button onClick={onConfirm} className='modal-logout'>{confirmText}</button>
                </div>
            </div>
        </div>
    , document.getElementById('root-portal'));
}