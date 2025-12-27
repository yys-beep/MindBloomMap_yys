// src/components/FlowerHouse/WeeklyDetailModal.js

import React, { useMemo } from 'react';
import { getWeeklyFlowerData, MOOD_PALETTE } from './dataProcessor';

// --- STYLING ---
const styles = {
    backdrop: { 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', 
        alignItems: 'center', zIndex: 1000 
    },
    modalCard: { 
        padding: '25px', 
        background: 'white', 
        borderRadius: '25px', 
        maxWidth: '90%',
        width: '450px', 
        maxHeight: '90vh', 
        overflowY: 'auto', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)', 
        position: 'relative', 
        fontFamily: 'Comic Sans MS',
    },
    closeButton: {
        position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none',
        fontSize: '1.5rem', cursor: 'pointer', color: '#A3523B', fontWeight: 'bold',
    },
    // Container style to correctly display left and right panels side-by-side
    contentWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: '20px',
    },
    leftPanel: { // Flower and Average Score
        flex: '0 0 45%', // Sets Left panel to take 45% width
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px',
        borderRight: '1px solid #eee',
    },
    rightPanel: { // Journal Entries
        flex: '1 1 55%', // Takes up the remaining space
        padding: '10px 0 10px 15px', 
    },
    journalHeading: {
        marginTop: '0px', 
        marginBottom: '15px', 
        fontSize: '1.1rem',
    },
    flowerImage: { 
        width: '250px', 
        height: 'auto', 
        marginBottom: '15px',
        objectFit: 'contain',
        filter: 'drop-shadow(2px 2px 5px rgba(0,0,0,0.2))',
    },
    journalEntry: { 
        padding: '10px', 
        marginBottom: '10px', 
        borderLeft: '4px solid #8ABAC5', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '5px' 
    },
    noteText: { 
        fontSize: '0.9rem', 
        marginTop: '5px', 
        color: '#555',
        display: 'block', 
        lineHeight: '1.4',
    }
};

// --- Helper to convert numerical score to teenage-friendly label ---
const getQualitativeMoodLabel = (avgScore) => {
    if (avgScore >= 0.7) return { label: 'Excellent', color: MOOD_PALETTE.Happy.color };
    if (avgScore >= 0.3) return { label: 'Good', color: MOOD_PALETTE.Productive.color };
    if (avgScore >= -0.3) return { label: 'Stable', color: MOOD_PALETTE.Calm.color };
    if (avgScore >= -0.7) return { label: 'Low', color: MOOD_PALETTE.Sad.color };
    return { label: 'Challenging', color: MOOD_PALETTE.Angry.color };
};


const WeeklyDetailModal = ({ weeklyLogs, weekDetails, onClose }) => { 
    
    const logsArray = Array.isArray(weeklyLogs) ? weeklyLogs : []; 

    const { flower, avgScore } = useMemo(() => getWeeklyFlowerData(logsArray), [logsArray]);
    
    const qualitativeMood = getQualitativeMoodLabel(avgScore); 

    const daysOfWeek = useMemo(() => {
        const fullDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const logsMap = new Map(weeklyLogs.map(log => [new Date(log.date).toISOString().split('T')[0], log]));
        const calendarBlock = [];
        
        const [day, month, year] = weekDetails.startDate.split('/');
        let currentDay = new Date(`${year}-${month}-${day}`); 
        currentDay.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const dateKey = currentDay.toISOString().split('T')[0];
            const log = logsMap.get(dateKey);
            
            const dayName = fullDayNames[currentDay.getDay()];
            const dateLabel = currentDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            if (log) {
                calendarBlock.push({
                    dayName: dayName,
                    date: dateLabel,
                    emotion: log.emotion,
                    note: log.note,
                    isLogged: true
                });
            } else {
                 calendarBlock.push({
                    dayName: dayName,
                    date: dateLabel,
                    emotion: 'N/A',
                    note: null,
                    isLogged: false
                });
            }
            currentDay.setDate(currentDay.getDate() + 1);
        }
        return calendarBlock;
    }, [weeklyLogs, weekDetails.startDate]);

    
    const weekLabel = weekDetails?.weekLabel || 'Weekly Archive'; 
    const fullStartDate = weekDetails?.startDate || 'N/A'; 
    const fullEndDate = weekDetails?.endDate || 'N/A';     

    const startParts = fullStartDate.split('/');
    const endParts = fullEndDate.split('/');
    
    const condensedDateRange = (startParts.length >= 2 && endParts.length >= 2) 
        ? `${startParts[0]}/${startParts[1]} – ${endParts[0]}/${endParts[1]}`
        : fullStartDate + ' - ' + fullEndDate; 

    return (
        <div style={styles.backdrop}>
            <div style={styles.modalCard}>
                <button onClick={onClose} style={styles.closeButton}>X</button>
                
                {/* --- HEADER (Week Label and Date Range) --- */}
                <div style={styles.headerContainer}>
                    <h3 style={styles.weekLabel}>{weekLabel}</h3> 
                    <p style={styles.dateRange}>
                        {condensedDateRange}
                    </p>
                </div>
                
                <div style={styles.contentWrapper}>
                    
                    {/* --- LEFT PANEL: FLOWER AND OVERALL STATS --- */}
                    <div style={styles.leftPanel}>
                        <img 
                            src={flower.imagePath} 
                            alt={flower.name} 
                            style={styles.flowerImage} 
                        />
                        
                        {/* Display qualitative label */}
                        <p style={{
                            fontSize: '1.2rem', 
                            fontWeight: 'bold', 
                            color: qualitativeMood.color, 
                            marginTop: '0' 
                        }}>
                            Overall Mood: {qualitativeMood.label}
                        </p>
                    </div>
                    
                    {/* --- RIGHT PANEL: JOURNAL ENTRIES (Daily breakdown) --- */}
                    <div style={styles.rightPanel}>
                        <h4 style={styles.journalHeading}>Daily Mood & Journal</h4>
                        
                        {daysOfWeek.map((dayEntry, index) => {
                            
                            if (dayEntry.isLogged) {
                                
                                let noteContent = dayEntry.note || 'No journal entry.';
                                
                                if (dayEntry.note) {
                                    noteContent = noteContent.replace(/^(?:[A-Za-z]{3}\s\d{1,2}\s(?:entry,)?\s*)/, '').trim();
                                }
                                
                                const dayTitle = `${dayEntry.date}, ${dayEntry.dayName} - ${dayEntry.emotion}`;
                                const moodColor = MOOD_PALETTE[dayEntry.emotion]?.color || '#555';

                                return (
                                    <div key={index} style={{...styles.journalEntry, borderLeftColor: moodColor }}>
                                        
                                        <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', color: moodColor }}>
                                            {dayTitle}
                                        </p>
                                        
                                        <span style={styles.noteText}>
                                            {noteContent}
                                        </span>
                                    </div>
                                );
                            } else {
                                const neutralColor = '#aaa'; 
                                const titleColor = '#777';   

                                const dayTitle = `${dayEntry.date}, ${dayEntry.dayName} - ?`;
                                
                                return (
                                    <div key={index} style={{...styles.journalEntry, borderLeftColor: neutralColor }}>
                                        
                                        <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', color: titleColor }}>
                                            {dayTitle}
                                        </p>
                                        
                                        <span style={{ 
                                            ...styles.noteText, 
                                            color: titleColor, 
                                            fontStyle: 'italic', 
                                            marginTop: '0' 
                                        }}>
                                            No entry
                                        </span>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyDetailModal;