import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addJournal } from '../../firebases/firebaseService';
import NavigationButtons from '../NavigationButtons';
import './Journal.css';
import JournalBG from '../../assets/images/Journal_bg.png';

const Journal = () => {
  const { currentUser } = useAuth();
  const userID = currentUser ? currentUser.uid : 'guest';

  const [journalText, setJournalText] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function showToast(msg, ms = 2000) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), ms);
  }

  async function submitJournal() {
    const words = countWords(journalText);
    
    if (words === 0) {
      showToast('Please write something before saving.');
      return;
    }

    try {
      await addJournal(userID, { 
        content: journalText, 
        emotionTag: '', 
        date: today 
      });
      showToast('Journal entry saved! 📝');
      setJournalText('');
    } catch (err) {
      console.warn('Save journal failed', err);
      showToast('Failed to save journal entry.');
    }
  }

  return (
    <div className="journal-container" style={{ backgroundImage: `url(${JournalBG})` }}>
      <NavigationButtons />

      <div className="journal-viewport">
        <h1 className="journal-title">Journal</h1>

        <div className="journal-card">
          <div className="journal-header">
            <h2>Today's Entry</h2>
            <span className="journal-date">{today}</span>
          </div>

          <textarea
            className="journal-textarea"
            placeholder="Write your thoughts here... (Every 20 words → +5 growth points, max +30)"
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
          />

          <div className="journal-footer">
            <div className="word-count">
              {countWords(journalText)} words
            </div>
            <div className="journal-actions">
              <button className="journal-btn save-btn" onClick={submitJournal}>
                Save Entry
              </button>
              <button className="journal-btn cancel-btn" onClick={() => setJournalText('')}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
};

export default Journal;
