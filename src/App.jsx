// src/App.jsx — ONE MORE™: Sleep Regret Prediction Engine
// Full orchestrator — React + Tailwind + Canvas + Web Audio API

import { useEffect, useRef, useState, useCallback } from 'react';
import { Activity, AlertTriangle, Cpu, Radio, Zap, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import StarfieldCanvas from './components/StarfieldCanvas';
import RegretGraph from './components/RegretGraph';
import OdometerDisplay from './components/OdometerDisplay';
import RadialGauge from './components/RadialGauge';
import TransmissionConsole from './components/TransmissionConsole';
import { useRegretEngine } from './hooks/useRegretEngine';
import { playClick, playWarpChime, playAlertHum } from './hooks/useAudio';

const RUNTIME_PRESETS = [
  { label: 'Anime', value: 24 },
  { label: 'Sitcom', value: 30 },
  { label: 'Drama', value: 45 },
  { label: 'Prestige', value: 58 },
  { label: 'Scorsese', value: 180 },
];

const EPISODE_PRESETS = [1, 2, 3, 5];

const STAKES_OPTIONS = [
  { label: 'Casual', sublabel: 'Weekend / Freelancer', icon: '🌙', value: 0 },
  { label: 'Normal', sublabel: 'Standard Workday', icon: '💼', value: 1 },
  { label: 'Critical', sublabel: 'Exam · Pitch · 8 AM CEO', icon: '☢️', value: 2 },
];

const CLIFFHANGER_OPTIONS = [
  { label: 'None', value: 0 },
  { label: 'Mild', value: 1 },
  { label: 'Catastrophic', sublabel: 'Season Finale', value: 2 },
];

function pad2(n) { return String(n).padStart(2, '0'); }
function nowAsTimeString(d) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }

export default function App() {
  const [episodes, setEpisodes] = useState(2);
  const [runtime, setRuntime] = useState(45);
  const [wakeUpTime, setWakeUpTime] = useState('07:30');
  const [stakes, setStakes] = useState(1);
  const [cliffhanger, setCliffhanger] = useState(0);
  const [now, setNow] = useState(new Date());
  const [warpActive, setWarpActive] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [strobe, setStrobe] = useState(false);
  const [remForfeited, setRemForfeited] = useState(41209);

  // Tick live clock every second
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Tick global REM forfeited counter (satirical)
  useEffect(() => {
    const t = setInterval(() => {
      setRemForfeited(v => +(v + 0.003).toFixed(3));
    }, 200);
    return () => clearInterval(t);
  }, []);

  const { finalRegret, sleepHours, accentColor, txTier, totalBingeMinutes } = useRegretEngine({
    episodes, runtime, wakeUpTime, stakes, cliffhanger, now,
  });

  // Alert hum when regret > 85
  const prevRegretRef = useRef(finalRegret);
  useEffect(() => {
    if (prevRegretRef.current <= 85 && finalRegret > 85) {
      playAlertHum();
    }
    prevRegretRef.current = finalRegret;
  }, [finalRegret]);

  const triggerWarp = useCallback(() => {
    setWarpActive(true);
    setTimeout(() => setWarpActive(false), 1400);
  }, []);

  const handleTerribleDecision = useCallback(() => {
    playWarpChime();
    setEpisodes(e => e + 1);
    setShaking(true);
    setStrobe(true);
    triggerWarp();
    setTimeout(() => setShaking(false), 450);
    setTimeout(() => setStrobe(false), 700);
  }, [triggerWarp]);

  // Slider pct for CSS gradient
  const runtimePct = ((runtime - 10) / (170)) * 100;

  // Finish time string
  const finishDate = new Date(now.getTime() + totalBingeMinutes * 60000);
  const finishStr = finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const sleepStr = sleepHours.toFixed(1);

  // Rim color for neon card glow
  const rimColor = accentColor + '50';
  const rimGlow = accentColor + '18';

  return (
    <div className={`relative min-h-screen w-full ${shaking ? 'shaking' : ''}`} style={{ zIndex: 1 }}>
      {/* Deep space canvas */}
      <StarfieldCanvas warpActive={warpActive} />

      {/* Strobe overlay */}
      {strobe && <div className="warp-strobe" />}

      {/* Content layer */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 py-4 lg:px-8 lg:py-6 max-w-[1400px] mx-auto">

        {/* ─── HEADER ─── */}
        <header className="glass-card mb-5 px-5 py-3 flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <Activity size={22} color={accentColor} style={{ filter: `drop-shadow(0 0 6px ${accentColor})` }} />
              <span className="led-blink absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
            </div>
            <div>
              <div className="font-mono text-base font-bold tracking-tight" style={{ color: accentColor }}>
                ONE MORE™
              </div>
              <div className="micro-label" style={{ color: accentColor, opacity: 0.6 }}>
                // SLEEP TRAJECTORY RADAR
              </div>
            </div>
          </div>

          {/* Diagnostic pills */}
          <div className="flex flex-wrap items-center gap-2 text-center">
            <span className="px-2 py-1 rounded border text-xs font-mono"
              style={{ borderColor: `${accentColor}40`, color: accentColor, background: `${accentColor}08` }}>
              ORBITAL DECAY: ACCELERATING
            </span>
            <span className="px-2 py-1 rounded border text-xs font-mono"
              style={{ borderColor: 'rgba(245,166,35,0.4)', color: '#F5A623', background: 'rgba(245,166,35,0.06)' }}>
              REM FORFEITED: {remForfeited.toFixed(3)} HRS
            </span>
            <span className="px-2 py-1 rounded border text-xs font-mono"
              style={{ borderColor: 'rgba(255,42,84,0.3)', color: '#FF2A54', background: 'rgba(255,42,84,0.06)' }}>
              REGRET INDEX: {finalRegret.toFixed(1)}%
            </span>
          </div>

          {/* Tagline */}
          <div className="micro-label text-right hidden lg:block" style={{ maxWidth: 200, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
            "WE DON'T PREVENT BAD DECISIONS.<br />WE QUANTIFY THEM."
          </div>
        </header>

        {/* ─── MAIN GRID ─── */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ═══ LEFT COLUMN — CONTROL DECK (5 col) ═══ */}
          <section className="lg:col-span-5 flex flex-col gap-4">
            <div
              className="glass-card neon-rim p-5 flex flex-col gap-5"
              style={{ '--rim-color': rimColor, '--rim-glow': rimGlow }}
            >
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Cpu size={14} color={accentColor} />
                <span className="micro-label" style={{ color: accentColor }}>Control Deck · Input Parameters</span>
              </div>

              {/* ── Episode Count ── */}
              <div>
                <label className="micro-label block mb-2">Episode Count</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setEpisodes(e => Math.max(1, e - 1)); playClick(); }}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition"
                  ><ChevronDown size={18} /></button>
                  <div className="flex-1 text-center font-mono font-bold text-3xl" style={{ color: accentColor }}>
                    {episodes}
                  </div>
                  <button
                    onClick={() => { setEpisodes(e => e + 1); playClick(); }}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition"
                  ><ChevronUp size={18} /></button>
                </div>
                {/* Quick presets */}
                <div className="flex gap-2 mt-3">
                  {EPISODE_PRESETS.map(p => (
                    <button key={p}
                      onClick={() => { setEpisodes(p); playClick(); }}
                      className="flex-1 py-1.5 rounded text-xs font-mono border transition"
                      style={{
                        borderColor: episodes === p ? accentColor : 'rgba(255,255,255,0.1)',
                        color: episodes === p ? accentColor : 'rgba(255,255,255,0.4)',
                        background: episodes === p ? `${accentColor}12` : 'transparent',
                      }}
                    >{p}</button>
                  ))}
                  <button
                    onClick={() => { setEpisodes(99); playClick(); playAlertHum(); }}
                    className="flex-1 py-1.5 rounded text-xs font-mono border transition"
                    style={{
                      borderColor: episodes >= 10 ? '#FF2A54' : 'rgba(255,255,255,0.1)',
                      color: episodes >= 10 ? '#FF2A54' : 'rgba(255,255,255,0.4)',
                      background: episodes >= 10 ? 'rgba(255,42,84,0.1)' : 'transparent',
                    }}
                  >☠ GOD HELP ME</button>
                </div>
              </div>

              {/* ── Episode Runtime ── */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="micro-label">Episode Runtime</label>
                  <span className="font-mono text-sm font-bold" style={{ color: accentColor }}>{runtime}m</span>
                </div>
                <input
                  type="range" min="10" max="180" step="1" value={runtime}
                  onChange={(e) => { setRuntime(Number(e.target.value)); }}
                  className="slider-neon w-full mb-3"
                  style={{ '--pct': `${runtimePct.toFixed(1)}%` }}
                />
                <div className="flex flex-wrap gap-1.5">
                  {RUNTIME_PRESETS.map(p => (
                    <button key={p.value}
                      onClick={() => { setRuntime(p.value); playClick(); }}
                      className="px-2 py-1 rounded text-xs font-mono border transition"
                      style={{
                        borderColor: runtime === p.value ? accentColor : 'rgba(255,255,255,0.1)',
                        color: runtime === p.value ? accentColor : 'rgba(255,255,255,0.35)',
                        background: runtime === p.value ? `${accentColor}10` : 'transparent',
                      }}
                    >{p.label} · {p.value}m</button>
                  ))}
                </div>
              </div>

              {/* ── Time Anchors ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="micro-label block mb-2">
                    <Clock size={10} className="inline mr-1" />Temporal Anchor (NOW)
                  </label>
                  <div className="font-mono text-lg font-bold text-center py-2.5 rounded-lg border border-white/10 bg-black/30">
                    {nowAsTimeString(now)}
                    <span className="text-xs opacity-40 ml-1">:{pad2(now.getSeconds())}</span>
                  </div>
                </div>
                <div>
                  <label className="micro-label block mb-2">
                    <AlertTriangle size={10} className="inline mr-1" />Alarm Ring Time
                  </label>
                  <input
                    type="time" value={wakeUpTime}
                    onChange={(e) => { setWakeUpTime(e.target.value); playClick(); }}
                  />
                </div>
              </div>

              {/* ── Tomorrow Stakes ── */}
              <div>
                <label className="micro-label block mb-2">Next Day Stakes</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {STAKES_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => { setStakes(opt.value); playClick(); }}
                      className="flex flex-col items-center p-2.5 rounded-lg border transition text-center"
                      style={{
                        borderColor: stakes === opt.value ? accentColor : 'rgba(255,255,255,0.08)',
                        background: stakes === opt.value ? `${accentColor}10` : 'rgba(255,255,255,0.02)',
                        boxShadow: stakes === opt.value ? `0 0 12px ${accentColor}20` : 'none',
                      }}
                    >
                      <span className="text-xl mb-1">{opt.icon}</span>
                      <span className="font-mono text-xs font-bold" style={{ color: stakes === opt.value ? accentColor : 'rgba(255,255,255,0.6)' }}>
                        {opt.label}
                      </span>
                      <span className="micro-label mt-0.5" style={{ fontSize: '7px' }}>{opt.sublabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Cliffhanger ── */}
              <div>
                <label className="micro-label block mb-2">Cliffhanger Intensity</label>
                <div className="flex rounded-lg border border-white/10 overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.25)' }}>
                  {CLIFFHANGER_OPTIONS.map((opt, i) => (
                    <button key={opt.value}
                      onClick={() => { setCliffhanger(opt.value); playClick(); if (opt.value === 2) playAlertHum(); }}
                      className={`seg-btn flex-1 flex flex-col gap-0.5 ${cliffhanger === opt.value ? 'active' : ''}`}
                      style={cliffhanger === opt.value ? {
                        color: opt.value === 2 ? '#FF2A54' : accentColor,
                        background: opt.value === 2 ? 'rgba(255,42,84,0.1)' : `${accentColor}10`,
                      } : {}}
                    >
                      <span>{opt.label}</span>
                      {opt.sublabel && <span style={{ fontSize: '7px', opacity: 0.7 }}>{opt.sublabel}</span>}
                    </button>
                  ))}
                </div>
                {cliffhanger === 2 && (
                  <p className="micro-label mt-1.5 flex items-center gap-1" style={{ color: '#FF2A54' }}>
                    <AlertTriangle size={9} /> WARNING: CATASTROPHIC NARRATIVE HOOK DETECTED
                  </p>
                )}
              </div>
            </div>

            {/* Projected stats mini-bar */}
            <div className="glass-card px-4 py-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Binge Duration', value: `${totalBingeMinutes}m`, color: accentColor },
                { label: 'Finish Time', value: finishStr, color: '#F5A623' },
                { label: 'Sleep Projected', value: `${sleepStr}h`, color: sleepHours < 5 ? '#FF2A54' : sleepHours < 7 ? '#F5A623' : '#00F5D4' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="micro-label mb-1">{label}</div>
                  <div className="font-mono font-bold text-base" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ RIGHT COLUMN — MISSION CONTROL (7 col) ═══ */}
          <section className="lg:col-span-7 flex flex-col gap-4">

            {/* ── Hero Regret Score ── */}
            <div className="glass-card p-5 flex flex-col items-center"
              style={{ borderColor: `${accentColor}25`, boxShadow: `0 0 40px ${accentColor}08` }}>
              <div className="flex items-center gap-2 mb-1 self-stretch border-b border-white/5 pb-3">
                <Radio size={13} color={accentColor} />
                <span className="micro-label" style={{ color: accentColor }}>Regret Score Matrix · Live Feed</span>
                <span className="ml-auto font-mono text-xs px-2 py-0.5 rounded"
                  style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}>
                  LIVE
                </span>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <RadialGauge value={finalRegret} accentColor={accentColor} />
                <div className="absolute flex flex-col items-center">
                  <OdometerDisplay value={finalRegret} accentColor={accentColor} />
                  <div className="micro-label mt-2 tracking-widest" style={{ color: accentColor }}>
                    PROJECTED REMORSE FACTOR
                  </div>
                  <div className="micro-label mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {finalRegret < 50 ? '● NOMINAL' : finalRegret < 75 ? '▲ ELEVATED' : '⚠ CRITICAL'}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bezier Graph ── */}
            <div className="glass-card p-5">
              <RegretGraph episodes={episodes} finalRegret={finalRegret} />
            </div>

            {/* ── Transmission Console ── */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={13} color={accentColor} />
                <span className="micro-label" style={{ color: accentColor }}>
                  Tomorrow You · Encrypted Com-Link
                </span>
                <span className="ml-auto micro-label flex items-center gap-1" style={{ color: accentColor, opacity: 0.6 }}>
                  <span className="w-1.5 h-1.5 rounded-full led-blink" style={{ backgroundColor: accentColor, display: 'inline-block' }}></span>
                  DECRYPTING
                </span>
              </div>
              <TransmissionConsole txTier={txTier} now={now} accentColor={accentColor} />
            </div>

            {/* ── CTA ── */}
            <button
              onClick={handleTerribleDecision}
              className="cta-btn w-full py-5 rounded-xl text-base"
            >
              <div className="scanline-overlay" />
              <div className="pulse-ring-outer rounded-xl" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap size={18} className="shrink-0" />
                MAKE A TERRIBLE DECISION: WATCH ONE MORE
              </span>
            </button>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-4 text-center micro-label" style={{ color: 'rgba(255,255,255,0.15)' }}>
          ONE MORE™ v2.0.1 · SLEEP TRAJECTORY RADAR · All data is satirical and mathematically rigorous · No actual astronauts were harmed
        </footer>
      </div>
    </div>
  );
}
