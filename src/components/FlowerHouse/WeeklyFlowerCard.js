// src/components/FlowerHouse/WeeklyFlowerCard.js
import React, { useMemo } from 'react';
import { getWeeklyFlowerData } from './dataProcessor';

const styles = {
    flowerContainer: {
        width: '100%',
        height: '150px', // Fixed height for the image area
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: '10px',
    },
    flowerImage: {
        maxWidth: '100%', 
        maxHeight: '100%', 
        objectFit: 'contain',
        filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.1))',
    },
    flowerLabel: {
        fontSize: '1.2rem', fontWeight: 'bold', margin: '0', 
        color: '#000000', textShadow: '0 0 1px rgba(255, 255, 255, 0.7)',
    },
};

const WeeklyFlowerCard = ({ weekLogs, weekLabel, onClick, style }) => {
    const { flower } = useMemo(() => getWeeklyFlowerData(weekLogs), [weekLogs]);
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div 
            className="flower-card" 
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
                ...style, // Applies fixed dimensions from the parent component
                backgroundColor: flower.backgroundColor,
                ...(isHovered ? {transform: 'scale(1.05)'} : {}), 
                borderRadius: '15px', 
                padding: '15px 5px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer'
            }}
        >
            <div className="flower-container" style={styles.flowerContainer}>
                <img src={flower.imagePath} alt={flower.name} style={styles.flowerImage}/>
            </div>
            
            <p style={styles.flowerLabel}>{weekLabel}</p>
        </div>
    );
};

export default WeeklyFlowerCard;