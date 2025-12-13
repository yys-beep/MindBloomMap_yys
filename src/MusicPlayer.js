import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import mainBg from './assets/images/main_background.png';

const MusicPlayer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const audioRef = useRef(null);

    const autoplay = location?.state?.autoplay;

    useEffect(() => {
        if (autoplay && audioRef.current) {
            const p = audioRef.current.play();
            if (p && p.then) p.catch(() => {});
        }
    }, [autoplay]);

    return (
        <div className="main-page-container">
            <img src={mainBg} alt="background" className="background-layer" />

            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    background: 'rgba(255,255,255,0.92)',
                    padding: 20,
                    borderRadius: 12,
                    width: 340,
                    textAlign: 'center'
                }}>
                    <h2>Music Player</h2>
                    <div style={{ margin: '8px 0 12px' }}>
                        <audio ref={audioRef} controls style={{ width: '100%' }}>
                            <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
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

export default MusicPlayer;