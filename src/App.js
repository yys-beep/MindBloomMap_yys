// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages/Components
import MainPage from './pages/MainPage';
import ProfilePage from "./pages/ProfilePage";
import Volcano from './components/Volcano/Volcano'; 
import Community from './components/Community/Community';
import SelfCare from './components/SelfCare/SelfCare';
import MoodGarden from './components/MoodGarden/MoodGarden';

// Import Navigation Buttons
import NavigationButtons from './components/NavigationButtons';

function App() {
  return (
    <Router>
      {/* Place NavigationButtons outside Routes so it shows on all pages, optional */}
      <NavigationButtons />

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/volcano" element={<Volcano />} />
        <Route path="/community" element={<Community />} />
        <Route path="/self-care" element={<SelfCare />} />
        <Route path="/mood-garden" element={<MoodGarden />} />
        <Route path="/profile" element={<ProfilePage />} /> {/* Added profile route */}
        {/* Add other routes like Login/Register here */}
      </Routes>
    </Router>
  );
}

export default App;
