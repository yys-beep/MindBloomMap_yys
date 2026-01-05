import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addJournal, fetchData, writeData } from '../../firebases/firebaseService';
import NavigationButtons from '../NavigationButtons';
import './Journal.css';
import JournalBG from '../../assets/images/Journal_bg.png';

// --- CONFIG ---
const MOODS = ["happy", "calm", "neutral", "anxious", "sad", "angry"];
const MOOD_EMOJIS = {
  happy: "😊", calm: "😌", neutral: "😐", anxious: "😰", sad: "😢", angry: "😠"
};

/* --- Helper to get the correct Garden Week Key --- */
function getMondayDateKey(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(d.getTime() - diffToMonday * 24 * 3600 * 1000);
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const Journal = () => {
  const { currentUser, loading } = useAuth();
  const [journalText, setJournalText] = useState('');
  
  // NEW: State for Journal-specific Mood
  const [selectedMood, setSelectedMood] = useState('neutral'); 

  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);
  
  const getTodayLocal = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getTodayLocal();

  const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  function showToast(msg, ms = 2000) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), ms);
  }

  async function submitJournal() {
    if (loading) return;

    if (!currentUser) {
      showToast('Please log in to save your progress.');
      return;
    }

    const words = countWords(journalText);
    if (words === 0) {
      showToast('Please write something before saving.');
      return;
    }

    try {
      // 1. Save the Journal Entry with the SELECTED MOOD
      await addJournal(currentUser.uid, { 
        content: journalText, 
        emotionTag: selectedMood, // <--- Using the user selected mood
        date: today 
      });

      // 2. UPDATE GARDEN POINTS
      const weekKey = getMondayDateKey();
      const gardenPath = `GardenProgress/${currentUser.uid}/${weekKey}`;
      
      const pointsEarned = Math.min(30, Math.floor(words / 20) * 5);
      
      if (pointsEarned > 0) {
        const gardenData = await fetchData(gardenPath) || {};
        const currentProgress = gardenData.dailyProgress || 0;
        const currentWords = gardenData.journalWordsToday || 0;
        
        const allowedPoints = Math.min(100 - currentProgress, pointsEarned);
        
        await writeData(gardenPath, {
          journalWordsToday: currentWords + words,
          dailyProgress: currentProgress + allowedPoints,
          updatedAt: Date.now()
        });
        
        showToast(`Saved! You earned points for your garden 🌱`);
      } else {
        showToast('Journal entry saved!');
      }

      setJournalText('');
      setSelectedMood('neutral'); // Reset mood
      
    } catch (err) {
      console.error('Save journal failed:', err);
      showToast('Database Error: Permission denied.');
    }
  }

  if (loading) return <div className="loading-container">Verifying identity...</div>;

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

          {/* --- NEW: Mood Selector Section --- */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display:'block', marginBottom:'5px', color:'#555', fontSize:'0.9rem' }}>
              How do you feel about this entry?
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {MOODS.map(mood => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '20px',
                    border: selectedMood === mood ? '2px solid #8ABAC5' : '1px solid #ddd',
                    backgroundColor: selectedMood === mood ? '#E0F7FA' : 'white',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    transition: 'all 0.2s'
                  }}
                  title={mood}
                >
                  {MOOD_EMOJIS[mood]}
                </button>
              ))}
            </div>
          </div>
          {/* ---------------------------------- */}

          <textarea
            className="journal-textarea"
            placeholder="Write your thoughts here..."
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
          />
          <div className="journal-footer">
            <div className="word-count">
              {countWords(journalText)} words
            </div>
            <div className="journal-actions">
              <button className="journal-btn save-btn" onClick={submitJournal}>Save Entry</button>
              <button className="journal-btn cancel-btn" onClick={() => setJournalText('')}>Clear</button>
            </div>
          </div>
        </div>
      </div>
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
};

export default Journal;