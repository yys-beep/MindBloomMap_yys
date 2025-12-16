// src/components/FlowerHouse/dataProcessor.js

import HappyFlower from '../../assets/images/flowerHouse_happyFlower.png'; 
import GoodFlower from '../../assets/images/flowerHouse_goodFlower.png';
import CalmFlower from '../../assets/images/flowerHouse_calmFlower.png';
import SadFlower from '../../assets/images/flowerHouse_sadFlower.png';
import BudFlower from '../../assets/images/flowerHouse_flowerBud.png';

// --- MOOD SCORING AND COLORING ---
export const MOOD_PALETTE = {
  Happy: { color: '#97c94b', score: 1.0 },   
  Calm: { color: '#9782ce', score: 0.5 },     
  Productive: { color: '#66CDBB', score: 0.7 }, 
  Sad: { color: '#8ABAC5', score: -0.5 },     
  Anxious: { color: '#D49F44', score: -0.8 }, 
  Angry: { color: '#A3523B', score: -1.0 },   
};

// --- FLOWER MAPPING ---
export const FLOWER_MAPPING = [
    { name: "Happy Flower", moodRange: [0.7, 1.0], imagePath: HappyFlower, backgroundColor: '#fff4cc' },
    { name: "Good Flower", moodRange: [0.3, 0.69], imagePath: GoodFlower, backgroundColor: '#ffe0e0' },
    { name: "Calm Flower", moodRange: [-0.4, 0.29], imagePath: CalmFlower, backgroundColor: '#e6e6ff' },
    { name: "Low Flower", moodRange: [-1.0, -0.41], imagePath: SadFlower, backgroundColor: '#d6ffdb' },
];

/**
 * Generates the flower and its average mood score for a given week's logs.
 */
export const getWeeklyFlowerData = (logs) => {
    if (!logs || logs.length === 0) {
        return { avgScore: 0, flower: { name: "Bud", imagePath: BudFlower, backgroundColor: '#f0f0f0' } };
    }

    let totalScore = 0;
    logs.forEach(log => { totalScore += MOOD_PALETTE[log.emotion]?.score || 0; });

    const avgScore = totalScore / logs.length;
    
    const matchingFlower = FLOWER_MAPPING.find(flower => 
        avgScore >= flower.moodRange[0] && avgScore <= flower.moodRange[1]
    );

    return { avgScore, flower: matchingFlower || FLOWER_MAPPING[2] };
};


/**
 * Processes logs for chart data (monthly/yearly summaries).
 */
export const processLogData = (logs, totalWeeksInPeriod) => {
    if (!logs || logs.length === 0) {
        return { moodBreakdown: [], avgMood: 'N/A', avgMoodPercentage: 0, entriesPerWeek: 0 };
    }

    const moodCounts = {};
    let totalMoodScore = 0;
    
    logs.forEach(log => {
        const moodName = log.emotion || 'Calm';
        const moodScore = MOOD_PALETTE[moodName]?.score || 0;

        moodCounts[moodName] = (moodCounts[moodName] || 0) + 1;
        totalMoodScore += moodScore;
    });

    const totalEntries = logs.length;
    const moodBreakdown = Object.keys(moodCounts).map(mood => ({
        name: mood,
        value: moodCounts[mood],
        color: MOOD_PALETTE[mood]?.color || '#AAAAAA',
    }));

    const averageScore = totalMoodScore / totalEntries;
    let avgMoodLabel = 'N/A';
    if (averageScore > 0.3) avgMoodLabel = 'Good';
    else if (averageScore > -0.3) avgMoodLabel = 'Stable';
    else avgMoodLabel = 'Low';
    
    const positiveEntries = logs.filter(log => (MOOD_PALETTE[log.emotion]?.score || 0) >= 0).length;
    const avgMoodPercentage = Math.round((positiveEntries / totalEntries) * 100);

    const entriesPerWeek = (totalEntries / totalWeeksInPeriod).toFixed(1);

    return { moodBreakdown, avgMood: avgMoodLabel, avgMoodPercentage, entriesPerWeek: parseFloat(entriesPerWeek) };
};