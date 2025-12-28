import React, { useState } from 'react';
import { Garden } from './components/Garden';
import { Diary } from './components/Diary';
import { FlowerHouse } from './components/FlowerHouse';
import { MoodMap } from './components/MoodMap';
import { Navigation } from './components/Navigation';
import { Intro } from './components/Intro';
import { ViewType } from './types';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('garden');
  const [highlightDiary, setHighlightDiary] = useState(false);

  const handleInteraction = () => {
    if (highlightDiary) setHighlightDiary(false);
  };

  const navigateTo = (view: ViewType) => {
    if (view === 'diary') setHighlightDiary(false);
    setCurrentView(view);
  };

  const handleQuit = () => {
    // @ts-ignore
    if (window.ReactNativeWebView) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'QUIT' }));
    } else {
      alert("Exiting MindBloom Garden..."); 
    }
  };

  if (showIntro) return <Intro onComplete={() => setShowIntro(false)} />;

  if (currentView === 'house') return <FlowerHouse onBack={() => setCurrentView('garden')} />;
  if (currentView === 'map') return <MoodMap onBack={() => setCurrentView('garden')} />;

  const getBackgroundStyle = () => {
    if (currentView === 'garden') {
      return { background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)' };
    }
    // High-quality texture for Diary
    const DIARY_BG = "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80";
    return {
      backgroundImage: `url('${DIARY_BG}')`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    };
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden transition-all duration-700 ease-in-out" 
      style={getBackgroundStyle()} 
      onClick={handleInteraction}
    >
      <Navigation 
        onNavigate={navigateTo} 
        onQuit={handleQuit} 
        highlightDiary={highlightDiary} 
        currentView={currentView} 
      />
      {currentView === 'garden' ? (
        <Garden onHighlightDiary={setHighlightDiary} />
      ) : (
        <Diary onBack={() => setCurrentView('garden')} />
      )}
    </div>
  );
};

export default App;