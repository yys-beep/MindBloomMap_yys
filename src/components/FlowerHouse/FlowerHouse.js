// src/components/FlowerHouse/FlowerHouse.js

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { getMoodLogsByUser } from '../../firebases/firebaseService'; 
import { processLogData } from './dataProcessor';

// Import all child components
import SummaryChartModal from './SummaryChartModal';
import WeeklyDetailModal from './WeeklyDetailModal'; 
import WeeklyFlowerCard from './WeeklyFlowerCard'; 
import NavigationButtons from '../NavigationButtons'; 

// Import CSS
import '../../pages/MainPage.css';
import './FlowerHouse.css'; 

// Import the correct background image 
import FlowerHouseBG from '../../assets/images/flowerHouse_bg.png'; 

// --- STATIC DATA AND HELPERS ---
const MONTH_NAMES = [ 
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December' 
];

// MOCK DATA 
const mockLogs = [
    // October/November boundary (Oct 27-Nov 2)
    { moodID: 'o1', emotion: 'Calm', date: '2025-10-27', note: 'Oct 27 entry, slow start to the week.', moodScore: 0.5 },
    { moodID: 'o2', emotion: 'Sad', date: '2025-10-30', note: 'Oct 30 entry, feeling tired.', moodScore: -0.5 },
    { moodID: 'o3', emotion: 'Happy', date: '2025-11-02', note: 'Nov 2 entry, fun day out.', moodScore: 1.0 },

    // November Block 1 (Nov 1 - Nov 7, 2025. Nov 1 is Sat)
    { moodID: 'n1', emotion: 'Productive', date: '2025-11-03', note: 'Nov 3 entry, focused work session.', moodScore: 0.7 },
    { moodID: 'n2', emotion: 'Anxious', date: '2025-11-05', note: 'Nov 5 entry, meeting stress.', moodScore: -0.8 },
    { moodID: 'n3', emotion: 'Happy', date: '2025-11-07', note: 'Nov 7 entry, relaxed Friday.', moodScore: 1.0 }, // Added Nov 7
    
    // November Block 2 (Nov 8 - Nov 14, 2025)
    { moodID: 'n4', emotion: 'Calm', date: '2025-11-10', note: 'Nov 10 entry, peaceful morning.', moodScore: 0.5 },
    { moodID: 'n5', emotion: 'Angry', date: '2025-11-14', note: 'Nov 14 entry, traffic was terrible.', moodScore: -1.0 },
    
    // November Block 3 (Nov 15 - Nov 21, 2025)
    { moodID: 'n6', emotion: 'Productive', date: '2025-11-16', note: 'Nov 16 entry, got a lot done.', moodScore: 0.7 },
    { moodID: 'n7', emotion: 'Happy', date: '2025-11-17', note: 'Nov 17 entry, exciting news.', moodScore: 1.0 },
    { moodID: 'n8', emotion: 'Sad', date: '2025-11-20', note: 'Nov 20 entry, missing home.', moodScore: -0.5 },
    
    // November Block 4 (Nov 22 - Nov 28, 2025)
    { moodID: 'n9', emotion: 'Calm', date: '2025-11-23', note: 'Nov 23 entry, slow cook dinner.', moodScore: 0.5 },
    { moodID: 'n10', emotion: 'Anxious', date: '2025-11-24', note: 'Nov 24 entry, exam pressure.', moodScore: -0.8 },
    { moodID: 'n11', emotion: 'Productive', date: '2025-11-26', note: 'Nov 26 entry, solid study day.', moodScore: 0.7 },
    
    // December Block 1 (Dec 1 - Dec 7, 2025. Dec 1 is Mon)
    { moodID: 'd1', emotion: 'Happy', date: '2025-12-01', note: 'Dec 1 entry, feeling great today!', moodScore: 1.0 },
    { moodID: 'd2', emotion: 'Productive', date: '2025-12-02', note: 'Dec 2 entry, long hours but successful.', moodScore: 0.7 },
    { moodID: 'd3', emotion: 'Calm', date: '2025-12-03', note: 'Dec 3 entry, a peaceful afternoon break.', moodScore: 0.5 }, 
    { moodID: 'd4', emotion: 'Anxious', date: '2025-12-04', note: 'Dec 4 entry, worried about project deadlines.', moodScore: -0.8 },
    { moodID: 'd5', emotion: 'Sad', date: '2025-12-05', note: 'Dec 5 entry, rainy day blues.', moodScore: -0.5 },
    { moodID: 'd6', emotion: 'Happy', date: '2025-12-06', note: 'Dec 6 entry, celebrated a small win!', moodScore: 1.0 }, 
    { moodID: 'd7', emotion: 'Happy', date: '2025-12-07', note: 'Dec 7 entry, restful weekend.', moodScore: 1.0 },

    // Dec Block 2 (Dec 8 - Dec 14, 2025)
    { moodID: 'd8', emotion: 'Angry', date: '2025-12-08', note: 'Dec 8 entry, frustrating bug in code.', moodScore: -1.0 },
    { moodID: 'd9', emotion: 'Productive', date: '2025-12-09', note: 'Dec 9 entry, finished the report ahead of schedule.', moodScore: 0.8 },
    { moodID: 'd10', emotion: 'Calm', date: '2025-12-10', note: 'Dec 10 entry, meditation helped today.', moodScore: 0.5 },
    
    // Jan 2026 logs (retained)
    { moodID: 'j1', emotion: 'Angry', date: '2026-01-05', note: 'Jan 5 entry, frustrating bug in code.', moodScore: -1.0 },
    { moodID: 'j2', emotion: 'Calm', date: '2026-01-08', note: 'Jan 8 entry, calm day.', moodScore: 0.5 },
];

/**
 * HELPER: Groups logs into 7-day blocks starting precisely on the 1st of the month.
 */
const groupLogsByMonthBlock = (logs, viewYear, viewMonthIndex) => {
    const weeksMap = new Map();
    const logsByDate = new Map(logs.map(log => [log.date, log])); 
    
    let currentBlockStart = new Date(viewYear, viewMonthIndex, 1);
    currentBlockStart.setHours(0, 0, 0, 0);

    let weekCounter = 1;
    let maxBlockIndex = 6; 

    const endOfMonth = new Date(viewYear, viewMonthIndex + 1, 0);
    endOfMonth.setHours(0, 0, 0, 0);

    while (currentBlockStart.getMonth() === viewMonthIndex && currentBlockStart.getFullYear() === viewYear && weekCounter <= maxBlockIndex) {
        
        const blockEnd = new Date(currentBlockStart);
        blockEnd.setDate(currentBlockStart.getDate() + 6); // 7-day block

        const effectiveBlockEnd = blockEnd > endOfMonth ? endOfMonth : blockEnd;

        const weekKey = currentBlockStart.toISOString().split('T')[0];

        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        const locale = 'en-GB'; 
        
        const formattedStartDate = currentBlockStart.toLocaleDateString(locale, options);
        const formattedEndDate = effectiveBlockEnd.toLocaleDateString(locale, options);

        const blockData = {
            startDate: formattedStartDate, 
            endDate: formattedEndDate,   
            logs: [],
            weekLabel: `Week ${weekCounter}`,
        };

        for (let d = new Date(currentBlockStart); d <= effectiveBlockEnd; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            const log = logsByDate.get(dateKey);
            
            if (log) {
                blockData.logs.push(log);
            }
        }

        weeksMap.set(weekKey, blockData);
        currentBlockStart.setDate(currentBlockStart.getDate() + 7);
        weekCounter++;
    }

    return Array.from(weeksMap.values());
};


const FlowerHouse = () => {
    const { currentUser } = useAuth();
    const userID = currentUser ? currentUser.uid : null;
    
    // --- STATE DEFINITIONS ---
    const [allMoodLogs, setAllMoodLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 
    const [activeSummary, setActiveSummary] = useState(null); 
    const [selectedWeekLogs, setSelectedWeekLogs] = useState(null); 
    
    // Navigation States
    const [viewMonthIndex, setViewMonthIndex] = useState(10); // 10 = November
    const [viewYear, setViewYear] = useState(2025); 
    const [isPickerOpen, setIsPickerOpen] = useState(false); // Month picker toggle
    const [isYearPickerOpen, setIsYearPickerOpen] = useState(false); 
    
    const currentMonthLabel = MONTH_NAMES[viewMonthIndex]; 
    
    // --- Data Fetching ---
    useEffect(() => {
        const fetchLogs = async () => {
            if (!userID) { 
                setAllMoodLogs(mockLogs);
                setIsLoading(false); 
                return;
            }
            try {
                const logs = await getMoodLogsByUser(userID); 
                setAllMoodLogs(logs.length > 0 ? logs : mockLogs); 
            } catch (error) {
                console.error("Error fetching mood logs:", error);
                setAllMoodLogs(mockLogs); 
            } finally {
                setIsLoading(false); 
            }
        };
        fetchLogs();
    }, [userID]); 

    // --- Dynamic Data Analysis & Grouping ---
    const currentMonthLogs = useMemo(() => 
        allMoodLogs.filter(log => {
            if (!log.date) return false;
            const logDate = new Date(log.date);
            return logDate.getFullYear() === viewYear && logDate.getMonth() === viewMonthIndex;
        }), 
        [allMoodLogs, viewYear, viewMonthIndex]
    );
    
    const allYearLogs = useMemo(() => 
        allMoodLogs.filter(log => {
            if (!log.date) return false;
            const logDate = new Date(log.date);
            return logDate.getFullYear() === viewYear;
        }),
        [allMoodLogs, viewYear]
    );

    const weeklyFlowers = useMemo(() => 
        groupLogsByMonthBlock(currentMonthLogs, viewYear, viewMonthIndex), 
        [currentMonthLogs, viewYear, viewMonthIndex]
    );
    
    const yearlyAnalysis = useMemo(() => processLogData(allYearLogs, 52), [allYearLogs]); 
    const monthlyAnalysis = useMemo(() => processLogData(currentMonthLogs, weeklyFlowers.length), [currentMonthLogs, weeklyFlowers]);
    
    // --- Navigation Handlers ---
    
    const toggleMonthPicker = () => {
        setIsPickerOpen(prev => !prev); 
        setIsYearPickerOpen(false); 
    };

    const handleMonthSelect = (monthIndex) => {
        setViewMonthIndex(monthIndex);
        setIsPickerOpen(false); 
    };
    
    const handleMonthChange = (direction) => {
        let newMonth = viewMonthIndex + direction;
        let newYear = viewYear;

        if (newMonth > 11) { newMonth = 0; newYear += 1; } 
        else if (newMonth < 0) { newMonth = 11; newYear -= 1; }

        setViewMonthIndex(newMonth);
        setViewYear(newYear);
        setIsPickerOpen(false); 
    };
    
    // Handle year change with left/right arrows
    const handleYearChange = (direction) => {
        setViewYear(prevYear => prevYear + direction);
    };

    // Open Summary Modal defaulting to Monthly Tab
    const viewMonthlySummary = () => {
        setActiveSummary('monthly');
    };
    
    const handleFlowerClick = (weekObject) => {
        setSelectedWeekLogs(weekObject); 
    };

    // --- Archive Renderer ---
    const renderArchiveView = () => (
        <div className="archive-container">
            <div className="month-header">
                <button className="nav-button" onClick={() => handleMonthChange(-1)}>{'<'}</button>
                
                {/* Display the current month name */}
                <h2 onClick={toggleMonthPicker} style={{ cursor: 'pointer', position: 'relative' }}>
                    {currentMonthLabel} 
                    
                    {/* MONTH PICKER POP-OUT MENU (Alignment Fix) */}
                    {isPickerOpen && (
                        <div 
                            className="month-picker-overlay"
                            style={{
                                position: 'absolute', 
                                top: '100%', 
                                left: '50%', // Centering start point
                                transform: 'translateX(-50%)', // Pull back 50% of the overlay's own width
                                zIndex: 1000, 
                                padding: '10px 0 0 0',
                            }}
                        >
                            <div 
                                className="month-picker-list-container"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '15px',
                                    maxWidth: '380px',
                                    padding: '20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                                    border: '1px solid #ffde59',
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                }}
                            >
                                {MONTH_NAMES.map((month, index) => {
                                    const colors = ['#FFD8E3', '#FFEBAA', '#D8EFFC', '#E4D8FF'];
                                    const bgColor = colors[index % colors.length];
                                    const isActive = viewMonthIndex === index;

                                    return (
                                        <button
                                            key={month}
                                            className={`month-option ${isActive ? 'active-month' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                handleMonthSelect(index);
                                            }}
                                            style={{
                                                backgroundColor: isActive ? '#A3523B' : bgColor,
                                                color: isActive ? 'white' : '#4A4A4A',
                                                border: 'none',
                                                borderRadius: '10px', 
                                                padding: '12px 10px', 
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.3)' : 'none',
                                                transition: 'all 0.1s ease-in-out',
                                            }}
                                        >
                                            {month.substring(0, 3)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </h2>
                
                <button className="nav-button" onClick={() => handleMonthChange(1)}>{'>'}</button>
            </div>
            
            {/* Flower Grid */}
            <div 
                className="flower-grid"
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '20px',
                    padding: '20px 10px',
                    maxWidth: '340px', 
                    margin: '0 auto',
                }}
            >
                {weeklyFlowers.length > 0 ? (
                    weeklyFlowers.map((week, index) => (
                        <WeeklyFlowerCard
                            key={week.startDate} 
                            weekLogs={week.logs} 
                            weekLabel={week.weekLabel} 
                            onClick={() => handleFlowerClick(week)} 
                            style={{ 
                                width: '160px', 
                                height: '220px', 
                                flexGrow: 0 
                            }} 
                        />
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#777' }}>
                        No mood logs found for {currentMonthLabel}. Start logging today!
                    </p>
                )}
            </div>

            {/* Summary Button */}
            <button 
                className="summary-link" 
                onClick={viewMonthlySummary}
                style={{
                    backgroundColor: '#FFD8E3', 
                    color: '#A3523B',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    marginTop: '20px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
            >
                Summary
            </button>
        </div>
    );
    
    // --- Main Render ---
    if (isLoading) {
        return <div className="flowerhouse-container">Loading your Flower House...</div>;
    }

    return (
        <div 
            className="flowerhouse-container"
            style={{
                backgroundImage: `url(${FlowerHouseBG})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                backgroundAttachment: 'fixed',
            }}
        >
            
            <NavigationButtons /> 
            <h1 className="flowerhouse-app-title">Flower House</h1>

            {/* 1. YEARLY NAVIGATION (ARROW SETUP) */}
            <div 
                className="yearly-nav-wrapper"
                style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    margin: '10px auto', 
                    width: '200px', // Set width exactly to the nav bar width
                    backgroundColor: 'transparent' // Ensure no parent background color
                }} 
            > 
                
                {/* Year Display with Arrows */}
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        width: '200px', 
                        padding: '5px 10px',
                        backgroundColor: '#edbaf2ff',
                        borderRadius: '15px',
                        boxShadow: 'none', 
                        border: 'none' 
                    }}
                >
                    <button 
                        onClick={() => handleYearChange(-1)} 
                        type="button"
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            fontSize: '1.5rem', 
                            color: '#ffffffff',
                            fontWeight: 'bold' 
                        }}
                    >
                        {'<'}
                    </button>
                    
                    <h3 style={{ margin: '0', fontSize: '1.5rem', color: '#ffffffff' }}>
                        {viewYear}
                    </h3>
                    
                    <button 
                        onClick={() => handleYearChange(1)} 
                        type="button"
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            fontSize: '1.5rem', 
                            color: '#ffffffff',
                            fontWeight: 'bold'
                        }}
                    >
                        {'>'}
                    </button>
                </div>
            </div>
            
            {/* 2. ARCHIVE VIEW - Calls the fixed archive renderer */}
            {renderArchiveView()}
            
            {/* 4. Modals */}
            {activeSummary && ( 
                <SummaryChartModal
                    currentMonthLabel={currentMonthLabel}
                    viewYear={viewYear}
                    monthlyData={monthlyAnalysis}
                    yearlyData={yearlyAnalysis}
                    defaultTab={activeSummary} // Sets initial tab based on which button was clicked
                    onClose={() => setActiveSummary(null)}
                />
            )}
            
            {selectedWeekLogs && (
                <WeeklyDetailModal
                    weekDetails={selectedWeekLogs} 
                    weeklyLogs={selectedWeekLogs?.logs || []} 
                    onClose={() => setSelectedWeekLogs(null)}
                />
            )}
        </div>
    );
};

export default FlowerHouse;