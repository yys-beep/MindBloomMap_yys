// src/pages/MoodGarden.js
import React, { useEffect, useState, useRef } from "react";
import "./MoodGarden.css";
import {
  writeData,
  fetchData,
  addJournal,
  addMoodLog,
} from "../../firebases/firebaseService";
import NavigationButtons from "../NavigationButtons";
import { useNavigate } from "react-router-dom";


// assets
import potImg from "../../assets/images/pot.png";
import redflower from "../../assets/images/redflower.png";
import purpleflower from "../../assets/images/purpleflower.png";
import blueflower from "../../assets/images/blueflower.png";
import yellowflower from "../../assets/images/yellowflower.png";
import pinkflower from "../../assets/images/pinkflower.png";
import whiteflower from "../../assets/images/whiteflower.png";
import Plants from "../../assets/images/plant_stem.png"; // stem image
import fertilizerIcon from "../../assets/images/fertilizer_icon.png";
import wateringIcon from "../../assets/images/watering_icon.png";
import journalIcon from "../../assets/images/journal_icon.png";
import flowerHouseIcon from "../../assets/images/flowerhouse_icon.png";

/* ---------- Config / Points ---------- */
const MOOD_POINTS = { happy: 100, calm: 70, anxious: 50, angry: 40, sad: 20 };
const MAX_DAILY_GROWTH = 100;
const MAX_JOURNAL_POINTS = 30;
const MAX_WATERING_COUNT = 10;
const MAX_FLOWERS_PER_WEEK = 7;


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
function todayDateKey(date = new Date()) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const FLOWER_IMAGES = [
  redflower,
  purpleflower,
  blueflower,
  yellowflower,
  pinkflower,
  whiteflower,
];

export default function MoodGarden({ navigateToFlowerHouse }) {
  const [uid] = useState("guest"); // swap with auth uid if available
const navigate = useNavigate();
  const [weekKey, setWeekKey] = useState(getMondayDateKey());
  const [todayKey, setTodayKey] = useState(todayDateKey());

  const [seedChosen, setSeedChosen] = useState(false);
  const [selectedSeedIndex, setSelectedSeedIndex] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [flowersBloomed, setFlowersBloomed] = useState(0);
  const [hasBloomedToday, setHasBloomedToday] = useState(false);

  const [moodSubmittedDate, setMoodSubmittedDate] = useState(null);
  const [journalWordsToday, setJournalWordsToday] = useState(0);
  const [wateringCountToday, setWateringCountToday] = useState(0);

  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  // NEW: track which flower index just bloomed so we animate only it
  const [lastBloomedIndex, setLastBloomedIndex] = useState(null);
  const [waterDroplets, setWaterDroplets] = useState([]);

  const docPath = `GardenProgress/${uid}/${weekKey}`;

  function showToast(msg, ms = 2000) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), ms);
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchData(docPath);
        if (mounted) {
          if (data) {
            setSeedChosen(!!data.seedChosen);
            setSelectedSeedIndex(data.selectedSeedIndex ?? 0);
            setDailyProgress(data.dailyProgress ?? 0);
            setFlowersBloomed(data.flowersBloomed ?? 0);
            setHasBloomedToday(
              data.hasBloomedTodayDate === todayKey ? !!data.hasBloomedToday : false
            );
            setMoodSubmittedDate(data.moodSubmittedDate ?? null);
            setJournalWordsToday(data.journalWordsToday ?? 0);
            setWateringCountToday(data.wateringCountToday ?? 0);
          } else {
            setSeedChosen(false);
            setSelectedSeedIndex(0);
            setDailyProgress(0);
            setFlowersBloomed(0);
            setHasBloomedToday(false);
            setMoodSubmittedDate(null);
            setJournalWordsToday(0);
            setWateringCountToday(0);
          }
        }
      } catch (err) {
        console.error("Load garden error", err);
        showToast("Unable to load garden (offline).");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    const timer = setInterval(() => {
      const newWeek = getMondayDateKey();
      const newToday = todayDateKey();
      if (newWeek !== weekKey) setWeekKey(newWeek);
      if (newToday !== todayKey) setTodayKey(newToday);
    }, 30 * 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docPath]);

  async function persist(changes = {}) {
    const payload = {
      seedChosen,
      selectedSeedIndex,
      dailyProgress,
      flowersBloomed,
      hasBloomedToday,
      hasBloomedTodayDate: hasBloomedToday ? todayKey : null,
      moodSubmittedDate,
      journalWordsToday,
      wateringCountToday,
      updatedAt: Date.now(),
      ...changes,
    };
    try {
      await writeData(docPath, payload);
    } catch (err) {
      console.warn("persist failed", err);
      localStorage.setItem(`garden_${docPath}`, JSON.stringify(payload));
    }
  }

  function addProgressPoints(points) {
    if (dailyProgress >= MAX_DAILY_GROWTH) {
      showToast("You’ve helped your plant grow as much as it can today 🌱");
      return;
    }
    const allowed = Math.min(MAX_DAILY_GROWTH - dailyProgress, points || 0);
    const newProgress = Math.min(MAX_DAILY_GROWTH, dailyProgress + allowed);
    setDailyProgress(newProgress);

    // if reach 100/100 and not bloomed today:
    if (newProgress >= MAX_DAILY_GROWTH && !hasBloomedToday) {
      if (flowersBloomed < MAX_FLOWERS_PER_WEEK) {
        // compute index of the new flower (0-based)
        setFlowersBloomed((prev) => {
          const newVal = prev + 1;
          const newIndex = newVal - 1;
          setLastBloomedIndex(newIndex);
          // clear bloom marker after animation duration
          setTimeout(() => setLastBloomedIndex(null), 900);
          return newVal;
        });
      }
      setHasBloomedToday(true);
      showToast("A flower has bloomed today 🌸");
    }
    setTimeout(() => persist(), 0);
  }

  function chooseSeed(index = 0) {
    setSeedChosen(true);
    setSelectedSeedIndex(index % FLOWER_IMAGES.length);
    setDailyProgress(0);
    setFlowersBloomed(0);
    setHasBloomedToday(false);
    setMoodSubmittedDate(null);
    setJournalWordsToday(0);
    setWateringCountToday(0);
    persist();
  }

  async function fertilizerChoose(mood) {
    if (moodSubmittedDate === todayKey) {
      showToast("Mood already submitted today.");
      setShowMoodModal(false);
      return;
    }
    const pts = MOOD_POINTS[mood] ?? 0;
    setMoodSubmittedDate(todayKey);
    addProgressPoints(pts);
    setShowMoodModal(false);

    try {
      await addMoodLog(uid, { emotion: mood, date: todayKey, note: "" });
    } catch (err) {
      console.warn("addMoodLog failed", err);
    }
    persist({ moodToday: mood, moodSubmittedDate: todayKey });
  }

  function waterPlant() {
    if (wateringCountToday >= MAX_WATERING_COUNT) {
      showToast("Watering limit reached for today.");
      return;
    }
    const newCount = wateringCountToday + 1;
    setWateringCountToday(newCount);
    addProgressPoints(1);
    persist({ wateringCountToday: newCount });

    // Create multiple water droplets animation (5 droplets per watering)
    const baseId = Date.now();
    const dropletIds = Array.from({ length: 5 }, (_, i) => `${baseId}-${i}`);
    setWaterDroplets(prev => [...prev, ...dropletIds]);
    
    // Remove droplets after animation completes
    setTimeout(() => {
      setWaterDroplets(prev => prev.filter(id => !dropletIds.includes(id)));
    }, 1200);
  }

  async function submitJournal(text) {
    const words = countWords(text);
    const journalPoints = Math.min(MAX_JOURNAL_POINTS, Math.floor(words / 20) * 5);
    const newWords = (journalWordsToday || 0) + words;
    setJournalWordsToday(newWords);
    addProgressPoints(journalPoints);
    setShowJournalModal(false);
    setJournalText("");

    try {
      await addJournal(uid, { content: text, emotionTag: "", date: todayKey });
    } catch (err) {
      console.warn("addJournal failed", err);
    }
    persist({ journalWordsToday: newWords });
  }

  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  useEffect(() => {
    setDailyProgress(0);
    setHasBloomedToday(false);
    setMoodSubmittedDate(null);
    setJournalWordsToday(0);
    setWateringCountToday(0);
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey]);

  useEffect(() => {
    async function archiveAndReset() {
      const now = new Date();
      const prevWeekDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      const prevWeekKey = getMondayDateKey(prevWeekDate);
      const prevPath = `GardenProgress/${uid}/${prevWeekKey}`;
      try {
        const prevData = await fetchData(prevPath);
        if (prevData && (prevData.flowersBloomed || 0) > 0) {
          await writeData(`FlowerHouse/${uid}/${prevWeekKey}`, {
            flowers: prevData.flowersBloomed || 0,
            selectedSeedIndex: prevData.selectedSeedIndex ?? 0,
            savedAt: Date.now(),
          });
        }
      } catch (err) {
        console.warn("Archive previous week failed", err);
      }

      setSeedChosen(false);
      setSelectedSeedIndex(0);
      setDailyProgress(0);
      setFlowersBloomed(0);
      setHasBloomedToday(false);
      setMoodSubmittedDate(null);
      setJournalWordsToday(0);
      setWateringCountToday(0);
      persist();
    }
    archiveAndReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey]);

  const flowerPositions = [
    { left: "50%", bottom: "80%" },
    { left: "40%", bottom: "85%" },
    { left: "60%", bottom: "90%" },
    { left: "50%", bottom: "95%" },
    { left: "40%", bottom: "100%" },
    { left: "55%", bottom: "110%" },
    { left: "60%", bottom: "120%" },
  ];

  return (
    <div className="moodgarden-wrap">
      <NavigationButtons />

      <div className="top-nav-spacer" />

      <div className="top-row">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button className="top-btn" onClick={() => setShowMoodModal(true)}>
            <img src={fertilizerIcon} alt="fertilize" />
            <div>Fertilize</div>
          </button>
          <button className="water-main-btn" onClick={() => waterPlant()}>
            <img src={wateringIcon} alt="water" />
            <div>Water</div>
          </button>
        </div>

        <div className="top-row-spacer" />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button className="top-btn" onClick={() => navigate('/journal')}>
            <img src={journalIcon} alt="journal" />
            <div>Journal</div>
          </button>
          <button
            className="flowerhouse-main-btn"
            onClick={() => navigate('/flower-house')}
          >
            <img src={flowerHouseIcon} alt="flowerhouse" />
            <div>Flower House</div>
          </button>
        </div>
      </div>

      <div className="middle-row">
        <div className="middle-center">
          <div className="garden-center-mini">
            <img src={potImg} alt="Pot" className="pot-image" />
            {seedChosen && <img src={Plants} alt="stem" className="stem-image" />}

            {/* Water droplets animation */}
            {waterDroplets.map((dropletId, index) => (
              <div
                key={dropletId}
                className="water-droplet animate"
                style={{
                  left: `${40 + (index % 5) * 8}%`,
                  top: `${10 + (index % 3) * 5}%`,
                }}
              />
            ))}

            {Array.from({ length: flowersBloomed }).map((_, i) => {
              const src = FLOWER_IMAGES[selectedSeedIndex % FLOWER_IMAGES.length];
              const pos = flowerPositions[i] || flowerPositions[0];
              return (
                <img
                  key={i}
                  src={src}
                  className={`flower-image ${i === lastBloomedIndex ? "bloom" : ""}`}
                  alt={`flower-${i}`}
                  style={{
                    left: pos.left,
                    bottom: pos.bottom,
                    transform: "translateX(-50%)",
                  }}
                />
              );
            })}

            {!seedChosen && (
              <div className="seed-picker-compact">
                <div className="seed-label">Pick a seed</div>
                <div className="seed-list-compact">
                  {FLOWER_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      className="seed-select-compact"
                      onClick={() => chooseSeed(idx)}
                    >
                      <img src={img} alt={`seed-${idx}`} className="seed-thumb-compact" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="progress-bar-outer">
          <div className="progress-fill" style={{ width: `${dailyProgress}%` }} />
        </div>
        <div className="progress-text">{dailyProgress}/100</div>
        <button className="info-btn" onClick={() => setShowInfoModal(true)}>
          ?
        </button>
      </div>

      {showMoodModal && (
        <div className="modal-overlay" onClick={() => setShowMoodModal(false)}>
          <div className="modal-body" onClick={(e) => e.stopPropagation()}>
            <h3>Choose today's mood</h3>
            <div className="mood-grid">
              {Object.keys(MOOD_POINTS).map((mood) => (
                <button key={mood} className="mood-btn" onClick={() => fertilizerChoose(mood)}>
                  <div className="mood-emoji">
                    {mood === "happy" ? "😊" : mood === "calm" ? "😌" : mood === "anxious" ? "😰" : mood === "angry" ? "😠" : "😢"}
                  </div>
                  <div className="mood-label">{mood}</div>
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowMoodModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showJournalModal && (
        <div className="modal-overlay" onClick={() => setShowJournalModal(false)}>
          <div className="modal-body" onClick={(e) => e.stopPropagation()}>
            <h3>Write a journal entry</h3>
            <textarea rows={6} placeholder="Write at least 20 words for small growth..." value={journalText} onChange={(e) => setJournalText(e.target.value)} />
            <div className="word-count">{countWords(journalText)} words (Every 20 words → +5 points, max +30)</div>
            <div className="modal-actions">
              <button onClick={() => submitJournal(journalText)}>Save</button>
              <button onClick={() => setShowJournalModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-body" onClick={(e) => e.stopPropagation()}>
            <h3>How the Mood Garden works</h3>
            <ul>
              <li>Each Monday you choose a seed to start the week's plant.</li>
              <li>Each day you can add points by: mood (once/day), journal words, and watering.</li>
              <li>Daily cap is 100 points. Reach 100 → 1 flower blooms today.</li>
              <li>Maximum 7 flowers per week (one per day).</li>
            </ul>
            <div className="modal-actions">
              <button onClick={() => setShowInfoModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
