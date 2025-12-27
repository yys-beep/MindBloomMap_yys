// src/components/FlowerHouse/SummaryChartModal.js
import React, { useRef, useState, useMemo } from 'react';
import { toJpeg } from 'html-to-image';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { MOOD_PALETTE } from './dataProcessor'; 

// --- STYLING ---
const styles = {
    backdrop: { 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 10000 
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
    summaryHeader: { 
        textAlign: 'center', 
        padding: '5px 0 15px 0', 
        borderBottom: '1px solid #ffde59', 
    },
    messageContainer: {
        textAlign: 'center',
        backgroundColor: '#E6F0F8', 
        padding: '10px 15px',
        borderRadius: '15px',
        margin: '15px 0',
        border: '1px solid #B2DFEE',
        fontSize: '1.1rem',
        color: '#4A4A4A',
    },
    insightsContainer: { 
        display: 'flex', 
        justifyContent: 'space-around', 
        padding: '15px 0', 
        borderBottom: '1px solid #ffde59' 
    },
    insightBox: { 
        textAlign: 'center',
        padding: '5px',
        borderRadius: '8px',
        minWidth: '100px',
    },
    insightValue: { 
        fontSize: '1.6rem', 
        fontWeight: 'extrabold', 
        color: '#8ABAC5', 
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    },
    insightLabel: { 
        fontSize: '0.8rem', 
        color: '#A3523B', 
        fontWeight: 'bold',
    },
    chartSection: { 
        marginTop: '20px',
        paddingBottom: '10px',
    },
    chartTitle: { 
        textAlign: 'center', 
        marginBottom: '10px', 
        fontSize: '1.2rem',
        color: '#4A4A4A',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
    },
    shareButton: {
        width: '100%', 
        padding: '12px', 
        marginTop: '25px', 
        background: '#8ABAC5', 
        color: 'white', 
        border: 'none', 
        borderRadius: '15px', 
        cursor: 'pointer', 
        fontSize: '1.1rem',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'background-color 0.2s',
    },
    // NEW TAB STYLES
    tabBar: {
        display: 'flex',
        justifyContent: 'center', // FIX: Center the tab buttons
        marginBottom: '10px',
        borderBottom: '2px solid #f0f0f0',
    },
    tabButton: {
        padding: '10px 15px',
        marginRight: '10px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        border: 'none',
        backgroundColor: 'transparent',
        borderBottom: '3px solid transparent',
        color: '#777',
        transition: 'all 0.3s ease',
    },
    activeTab: {
        color: '#A3523B',
        borderBottomColor: '#FFD8E3',
    }
};


// --- Custom Tooltips ---
const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', fontSize: '0.8rem' }}>
                <p style={{ fontWeight: 'bold' }}>{payload[0].name}</p>
                <p>Entries: {payload[0].value}</p>
                <p>{`${(payload[0].percent * 100).toFixed(1)}%`}</p>
            </div>
        );
    }
    return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', fontSize: '0.8rem' }}>
                <p style={{ fontWeight: 'bold' }}>{label}</p>
                <p>Count: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};

// --- Personalized Messages ---
const getPersonalizedMessage = (avgMood) => {
    switch(avgMood) {
        case 'Excellent':
            return "✨ Wow! You truly flourished this period! Keep that joyful momentum going! 🎉";
        case 'Good':
            return "🌱 Great job! Lots of growth and positivity here. Celebrate those good days!";
        case 'Stable':
            return "🧘‍♀️ Your emotions found a good rhythm. Stability is the way to go!";
        case 'Low':
            return "🌧️ A few tough spots, but remember that growth happens even on rainy days. You got this!";
        case 'Challenging':
            return "💪 This was a tough patch. Be extra kind to yourself and look forward to sunnier moments!";
        default:
            return "Looking forward to seeing your mood grow and bloom! 🌸";
    }
};


// --- SummaryChartModal ---
const SummaryChartModal = ({ currentMonthLabel, viewYear, monthlyData, yearlyData, defaultTab, onClose }) => {
    const modalRef = useRef(null); 
    const [activeTab, setActiveTab] = useState(defaultTab || 'monthly');

    const { periodTitle, periodDisplay, currentData } = useMemo(() => {
        const data = activeTab === 'monthly' ? monthlyData : yearlyData;
        
        const display = activeTab === 'monthly' 
            ? `of ${currentMonthLabel} ${viewYear}`
            : `of ${viewYear}`;

        const title = "Summary";

        return {
            periodTitle: title,
            periodDisplay: display,
            currentData: data
        };
    }, [activeTab, monthlyData, yearlyData, currentMonthLabel, viewYear]);


    // Destructure data and generate personalized message from the currently active dataset
    const { moodBreakdown, avgMood, avgMoodPercentage, entriesPerWeek } = currentData;
    const totalEntries = moodBreakdown.reduce((sum, entry) => sum + entry.value, 0);
    const chartData = moodBreakdown.filter(d => d.value > 0);
    const personalizedMessage = getPersonalizedMessage(avgMood); 

    
    // --- handleShare function ---
    const handleShare = () => {
        if (modalRef.current === null) {
            console.error('Modal reference not attached.');
            return;
        }

        const originalMaxHeight = modalRef.current.style.maxHeight;
        const originalOverflowY = modalRef.current.style.overflowY;
        
        modalRef.current.style.maxHeight = 'none'; 
        modalRef.current.style.overflowY = 'visible'; 

        const filename = `MindBloomMap_Summary_${periodDisplay.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.jpeg`;

        toJpeg(modalRef.current, { 
            quality: 0.95, 
            filter: (node) => {
                return node !== modalRef.current.querySelector('.exclude-capture'); 
            }
        })
        .then((dataUrl) => {
            modalRef.current.style.maxHeight = originalMaxHeight;
            modalRef.current.style.overflowY = originalOverflowY;

            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch((err) => {
            if (modalRef.current) {
                modalRef.current.style.maxHeight = originalMaxHeight;
                modalRef.current.style.overflowY = originalOverflowY;
            }
            console.error('Image export failed:', err);
            alert('Failed to export summary image. Check console for details.');
        });
    };
    
    // --- Render ---
    return (
        <div style={styles.backdrop}>
            <div style={styles.modalCard} ref={modalRef}>
                
                <button 
                    onClick={onClose} 
                    style={styles.closeButton}
                    className="exclude-capture" 
                >
                    X
                </button>
                
                {/* 1. TAB NAVIGATION (Centered) */}
                <div style={styles.tabBar} className="exclude-capture">
                    <button
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'monthly' ? styles.activeTab : {}),
                        }}
                        onClick={() => setActiveTab('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'yearly' ? styles.activeTab : {}),
                        }}
                        onClick={() => setActiveTab('yearly')}
                    >
                        Yearly
                    </button>
                </div>

                {/* 2. SUMMARY HEADER (Uses dynamic title) */}
                <div style={styles.summaryHeader}>
                    <h2>{periodTitle} {periodDisplay} 🌼</h2>
                    <p style={{ color: '#777', fontSize: '0.9rem' }}>Analysing {totalEntries} total entries.</p>
                </div>
                
                {/* 3. INSIGHTS CONTAINER (Uses dynamic data) */}
                <div style={styles.insightsContainer}>
                    <div style={styles.insightBox}>
                        <div style={{...styles.insightValue, color: MOOD_PALETTE[avgMood]?.color || '#8ABAC5'}}>{avgMood}</div>
                        <div style={styles.insightLabel}>Overall Vibe</div>
                    </div>
                    <div style={styles.insightBox}>
                        <div style={styles.insightValue}>{avgMoodPercentage}%</div>
                        <div style={styles.insightLabel}>Sunny Days</div>
                    </div>
                    {/* ONLY show Logs/Week for Monthly view */}
                    {activeTab === 'monthly' ? (
                        <div style={styles.insightBox}>
                            <div style={styles.insightValue}>{entriesPerWeek}</div>
                            <div style={styles.insightLabel}>Logs/Week</div>
                        </div>
                    ) : null}
                </div>

                {/* 4. PERSONALIZED MESSAGE (Uses dynamic message) */}
                <div style={styles.messageContainer}>
                    {personalizedMessage}
                </div>


                {/* 5. CHARTS (Renders dynamic data) */}
                {chartData.length > 0 ? (
                    <div style={styles.chartSection}>
                        
                        {/* PIE CHART */}
                        <h4 style={styles.chartTitle}>Mood Distribution 🎨</h4>
                        <ResponsiveContainer width="100%" height={250}>
                             <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                 <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false}>
                                    {chartData.map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))} 
                                 </Pie>
                                 <Tooltip content={<CustomPieTooltip />} />
                                 <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* BAR CHART */}
                        <h4 style={styles.chartTitle}>Mood Frequency 📈</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                                <Tooltip content={<CustomBarTooltip />} />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                                    ))} 
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', marginTop: '30px', color: '#777' }}>No data to generate charts for this period.</p>
                )}

                {/* 6. SHARE BUTTON */}
                <button onClick={handleShare} style={styles.shareButton} className="exclude-capture">
                    Download Summary 
                </button>

            </div>
        </div>
    );
};

export default SummaryChartModal;