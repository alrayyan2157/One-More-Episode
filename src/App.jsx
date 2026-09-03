import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Activity, AlertTriangle, Crosshair, TerminalSquare } from 'lucide-react';
import './App.css';

// Sound synthesis helper
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playBeep = (frequency, type, duration) => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

const triggerClick = () => playBeep(800, 'square', 0.05);
const triggerAlert = () => playBeep(150, 'sawtooth', 0.8);

export default function App() {
  const [episodes, setEpisodes] = useState(1);
  const [runtime, setRuntime] = useState(45);
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [stakes, setStakes] = useState(1);
  const [cliffhanger, setCliffhanger] = useState(1);
  const [now, setNow] = useState(new Date());
  const [shake, setShake] = useState(false);
  const [typewriterKey, setTypewriterKey] = useState(0);

  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const watchMs = episodes * runtime * 60000;
    const finish = new Date(now.getTime() + watchMs);
    const fallAsleepMs = 15 * 60000;
    const sleep = new Date(finish.getTime() + fallAsleepMs);

    const [wakeH, wakeM] = wakeUpTime.split(':').map(Number);
    const wake = new Date(sleep);
    wake.setHours(wakeH, wakeM, 0, 0);
    if (wake <= sleep) wake.setDate(wake.getDate() + 1);

    const sleepMs = wake.getTime() - sleep.getTime();
    const sleepHours = Math.max(0, sleepMs / (1000 * 60 * 60));

    // Regret calculation
    const ideal = 8;
    const deficit = Math.max(0, ideal - sleepHours);
    const baseRegret = (deficit / ideal) * 100;
    
    let regret = baseRegret * stakes * cliffhanger;
    regret = Math.min(99.999, regret);
    
    // Ensure regret naturally ramps up based on episodes
    if (episodes > 1) regret = Math.max(regret, Math.min(99.999, episodes * 15 * stakes * cliffhanger));

    let color = '#00F5D4'; // Safe Cyan
    let status = 'NOMINAL';
    if (regret > 40) { color = '#F5A623'; status = 'DEGRADED'; }
    if (regret > 70) { color = '#FF2A54'; status = 'HAZARDOUS'; }
    if (regret > 90) { color = '#7A0016'; status = 'CRITICAL'; }

    let msg = "Cognitive function projected at 98%. Proceed.";
    if (regret > 30) msg = "Mild temporal displacement detected. Coffee recommended.";
    if (regret > 60) msg = "Warning: Substantial executive function loss imminent.";
    if (regret > 85) msg = "Was this truly worth the permanent cognitive collapse you're feeling right now? Your coffee will not fix this.";

    return { sleepHours, regret, color, status, msg, finishTime: finish };
  }, [episodes, runtime, wakeUpTime, stakes, cliffhanger, now]);

  const handleTerribleDecision = () => {
    triggerAlert();
    setEpisodes(e => e + 1);
    setShake(true);
    setTypewriterKey(k => k + 1);
    setTimeout(() => setShake(false), 400);
  };

  const formattedRegret = stats.regret.toFixed(3);

  // SVG Chart points
  const pointsA = "0,140 20,40 40,30 60,50 100,160 200,175 300,175"; // Dopamine
  const pointsB = "0,170 50,160 100,130 150,80 200,30 300,10"; // Regret

  return (
    <div className={`app-container ${shake ? 'shake-effect' : ''}`} ref={containerRef}>
      
      {/* Global Telemetry Bar */}
      <header className="global-header glass-panel">
        <div className="brand-lockup">
          <Activity size={24} color={stats.color} />
          <div className="brand-title">ONE MORE™</div>
          <div className="led" style={{ backgroundColor: stats.color, boxShadow: `0 0 10px ${stats.color}` }}></div>
          <div className="sys-tag" style={{ color: stats.color, borderColor: stats.color }}>
            [SYS_STATUS: {stats.status}]
          </div>
        </div>
        
        <div className="ticker-container">
          <span style={{ color: stats.color }}>LATENCY: 12ms</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: stats.color }}>QUANTUM DRIFT: 0.004%</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: stats.color }}>TOTAL SLEEP LIQUIDATED: {(stats.regret * 412).toFixed(0)} HRS</span>
        </div>

        <div className="tagline">
          WE DON'T PREVENT BAD DECISIONS.<br/>WE QUANTIFY THEM.
        </div>
      </header>

      <main className="dashboard-grid">
        
        {/* Left Panel */}
        <section className="left-panel">
          <div className="glass-panel">
            <div className="panel-header">
              <span>Input & Telemetry Vector</span>
              <TerminalSquare size={14} />
            </div>

            <div className="control-group">
              <label className="control-label">Episode Count</label>
              <div className="stepper">
                <button onClick={() => { setEpisodes(Math.max(1, episodes - 1)); triggerClick(); }}>-</button>
                <div className="value">{episodes}</div>
                <button onClick={() => { setEpisodes(episodes + 1); triggerClick(); }}>+</button>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">Episode Runtime ({runtime}m)</label>
              <div className="slider-container">
                <input 
                  type="range" min="10" max="180" step="1" 
                  value={runtime} 
                  onChange={(e) => setRuntime(Number(e.target.value))}
                  onMouseUp={triggerClick}
                  onTouchEnd={triggerClick}
                  style={{ '--safe-cyan': stats.color }}
                />
                <div className="presets">
                  {[22, 45, 62, 85].map(preset => (
                    <button 
                      key={preset}
                      className={`preset-btn ${runtime === preset ? 'active' : ''}`}
                      onClick={() => { setRuntime(preset); triggerClick(); }}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="control-group time-inputs">
              <div className="time-input-wrap">
                <label className="control-label">Temporal Anchor (NOW)</label>
                <div className="read-only-time">{now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}</div>
              </div>
              <div className="time-input-wrap">
                <label className="control-label">Target Wake-Up</label>
                <input 
                  type="time" 
                  value={wakeUpTime} 
                  onChange={(e) => { setWakeUpTime(e.target.value); triggerClick(); }} 
                />
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">Tomorrow Stakes Multiplier</label>
              <div className="segment-control">
                <button className={`segment-btn ${stakes === 0.8 ? 'active' : ''}`} onClick={() => { setStakes(0.8); triggerClick(); }}>LOW</button>
                <button className={`segment-btn ${stakes === 1.0 ? 'active' : ''}`} onClick={() => { setStakes(1.0); triggerClick(); }}>MED</button>
                <button className={`segment-btn ${stakes === 1.5 ? 'active' : ''}`} onClick={() => { setStakes(1.5); triggerClick(); }}>CATASTROPHIC</button>
              </div>
            </div>

            <div className="control-group" style={{ marginBottom: 0 }}>
              <label className="control-label">Cliffhanger Coefficient</label>
              <div className="segment-control">
                <button className={`segment-btn ${cliffhanger === 1.0 ? 'active' : ''}`} onClick={() => { setCliffhanger(1.0); triggerClick(); }}>NONE</button>
                <button className={`segment-btn ${cliffhanger === 1.2 ? 'active' : ''}`} onClick={() => { setCliffhanger(1.2); triggerClick(); }}>MILD</button>
                <button className={`segment-btn ${cliffhanger === 1.5 ? 'active' : ''}`} onClick={() => { setCliffhanger(1.5); triggerClick(); }}>SEVERE</button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <section className="right-panel">
          
          <div className="glass-panel hero-display" style={{ borderColor: stats.color, boxShadow: `0 8px 32px 0 ${stats.color}20` }}>
            <div className="panel-header" style={{ width: '100%', position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', boxSizing: 'border-box', borderBottom: `1px solid ${stats.color}40` }}>
              <span style={{ color: stats.color }}>Regret Score Matrix</span>
              <Crosshair size={14} color={stats.color} />
            </div>
            
            <div className="regret-value" style={{ color: stats.color }}>
              {formattedRegret}<span style={{ fontSize: '3rem', opacity: 0.5 }}>%</span>
            </div>
            <div className="regret-label">Projected Remorse Factor</div>
            
            <div className="sleep-stat">
              ESTIMATED SLEEP: <strong style={{ color: '#fff' }}>{stats.sleepHours.toFixed(1)} HRS</strong> | FINISH: <strong style={{ color: '#fff' }}>{stats.finishTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
          </div>

          <div className="glass-panel" style={{ paddingBottom: '0.5rem' }}>
            <div className="panel-header">
              <span>The "Crossover Point™" Analysis</span>
              <AlertTriangle size={14} />
            </div>
            <div className="chart-container">
              <svg className="chart-svg" viewBox="0 0 300 180" preserveAspectRatio="none">
                <polyline points={pointsA} fill="none" stroke="#00F5D4" strokeWidth="2" strokeDasharray="4 2" />
                <polyline points={pointsB} fill="none" stroke={stats.color} strokeWidth="3" />
                
                {/* Crossover Indicator */}
                <line x1="110" y1="0" x2="110" y2="180" stroke="#484F58" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="110" cy="120" r="4" fill="#F5A623" />
                <text x="115" y="15" fill="#8B949E" fontSize="8" fontFamily="monospace">POINT OF NO RETURN</text>
                <text x="250" y="25" fill={stats.color} fontSize="8" fontFamily="monospace">REGRET</text>
                <text x="250" y="165" fill="#00F5D4" fontSize="8" fontFamily="monospace">DOPAMINE</text>
              </svg>
            </div>
          </div>

          <div className="glass-panel comm-link">
            <div className="comm-header">[{now.toLocaleTimeString([], {hour12:false})} TRANSMISSION DECRYPTED]</div>
            <div className="comm-message typewriter" key={typewriterKey}>
              {stats.msg}
            </div>
          </div>

          <button className="cta-button action-terminal" onClick={handleTerribleDecision}>
            <div className="scanline"></div>
            [ ⚡ MAKE A TERRIBLE DECISION: WATCH ONE MORE ]
          </button>

        </section>
      </main>
    </div>
  );
}
