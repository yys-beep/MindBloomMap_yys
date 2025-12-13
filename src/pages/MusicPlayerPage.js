import React from 'react';
import { useNavigate } from 'react-router-dom';
import mainBg from '../assets/images/main_background.png';

const MusicPlayerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="main-page-container">
      <img src={mainBg} alt="background" className="background-layer" />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          padding: 20,
          borderRadius: 12,
          width: 320,
          textAlign: 'center'
        }}>
          <h2>Music Player</h2>
          <div style={{ margin: '8px 0 12px' }}>
            <audio controls style={{ width: '100%' }}>
              <track kind="captions" />
              Your browser does not support the audio element.
            </audio>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button style={{ padding: '8px 12px' }} onClick={() => navigate('/self-care')}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerPage;
