// src/App.jsx — ONE MORE™ v3 — Hypercar Cockpit / Mission Control

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, ChevronDown, ChevronUp,
  Clock, Cpu, Radio, Zap,
} from 'lucide-react';
import StarfieldCanvas from './components/StarfieldCanvas';
import TachometerGauge from './components/TachometerGauge';
import RegretGraph from './components/RegretGraph';
import TransmissionConsole from './components/TransmissionConsole';
import { useRegretEngine } from './hooks/useRegretEngine';
import { playClick, playWarpChime, playAlertHum } from './hooks/useAudio';

// ─── helpers ─────────────────────────────────────────────────────────────────
const pad2 = (n) => String(n).padStart(2, '0');
const nowHHMM = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const RUNTIME_PRESETS = [
  { label: 'Anime',    v: 24  },
  { label: 'Sitcom',   v: 30  },
  { label: 'Drama',    v: 45  },
  { label: 'Prestige', v: 58  },
  { label: 'Feature',  v: 90  },
];

const STAKES_OPTS = [
  { label: 'Casual',   sub: 'Weekend / Freelancer',        icon: '🌙', v: 0 },
  { label: 'Normal',   sub: 'Standard Workday',            icon: '💼', v: 1 },
  { label: 'Critical', sub: 'Exam · Pitch · 8 AM CEO',     icon: '☢️', v: 2 },
];

const CLIFF_OPTS = [
  { label: 'None',          v: 0 },
  { label: 'Mild',          v: 1 },
  { label: 'Catastrophic',  sub: 'Season Finale', v: 2 },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function App() {
  const [episodes,    setEpisodes]    = useState(2);
  const [runtime,     setRuntime]     = useState(45);
  const [wakeUpTime,  setWakeUpTime]  = useState('07:30');
  const [stakes,      setStakes]      = useState(1);
  const [cliffhanger, setCliffhanger] = useState(0);
  const [now,         setNow]         = useState(new Date());
  const [warpActive,  setWarpActive]  = useState(false);
  const [shaking,     setShaking]     = useState(false);
  const [strobe,      setStrobe]      = useState(false);
  const [remLiquidated, setRemLiquidated] = useState(41209.0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setRemLiquidated(v => +(v + 0.004).toFixed(3)), 200);
    return () => clearInterval(t);
  }, []);

  const {
    finalRegret, sleepHours, sleepNeg, daysOffset,
    finishTime, bingeMinutes, accentColor, statusLabel, txTier,
  } = useRegretEngine({ episodes, runtime, wakeUpTime, stakes, cliffhanger, now });

  // Alert hum on crossing 85%
  const prevRegRef = useRef(finalRegret);
  useEffect(() => {
    if (prevRegRef.current <= 85 && finalRegret > 85) playAlertHum();
    prevRegRef.current = finalRegret;
  }, [finalRegret]);

  const triggerWarp = useCallback(() => {
    setWarpActive(true);
    setTimeout(() => setWarpActive(false), 1400);
  }, []);

  const handleCTA = useCallback(() => {
    playWarpChime();
    setEpisodes(e => e + 1);
    setShaking(true);
    setStrobe(true);
    triggerWarp();
    setTimeout(() => setShaking(false), 450);
    setTimeout(() => setStrobe(false), 700);
  }, [triggerWarp]);

  const finishStr = finishTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const sleepLabel = sleepNeg
    ? `−${Math.abs(sleepHours).toFixed(1)}h (NEGATIVE)`
    : `${sleepHours.toFixed(1)}h`;
  const sleepColor = sleepNeg ? '#FF2A54' : sleepHours < 5 ? '#FF6B35' : sleepHours < 7 ? '#F5A623' : '#00F5D4';
  const runtimePct  = ((runtime - 10) / 170) * 100;

  return (
    <div
      className={shaking ? 'shaking' : ''}
      style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}
    >
      {/* Canvas background */}
      <StarfieldCanvas warpActive={warpActive} />

      {/* Strobe flash */}
      {strobe && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(255,42,84,0.12) 0%, transparent 70%)',
          animation: 'regStb 0.12s ease-in-out 5',
        }}>
          <style>{`@keyframes regStb{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        </div>
      )}

      {/* ── Mobile floating HUD ─────────────────────────────────────────────── */}
      <div className="lg:hidden" style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(7,8,11,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${accentColor}30`,
        padding: '0.6rem 1rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: accentColor }}>ONE MORE™</div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 900, color: accentColor, lineHeight: 1 }}>
            {finalRegret.toFixed(3)}%
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            {statusLabel}
          </div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accentColor,
          boxShadow: `0 0 8px ${accentColor}`, animation: 'blink-led 1.8s ease-in-out infinite' }} />
      </div>

      {/* ── Page content ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: 1440, margin: '0 auto',
        padding: '1.25rem 1.5rem',
        display: 'flex', flexDirection: 'column',
        height: '100vh', boxSizing: 'border-box',
      }}>

        {/* ── HEADER ── */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
          background: 'rgba(14,17,30,0.55)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          padding: '0.7rem 1.2rem',
          marginBottom: '1rem',
          flexShrink: 0,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={20} color={accentColor} style={{ filter: `drop-shadow(0 0 5px ${accentColor})` }} />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: accentColor, letterSpacing: '-0.02em' }}>
                ONE MORE™
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, letterSpacing: '0.16em', color: `${accentColor}80`, textTransform: 'uppercase' }}>
                // SLEEP TRAJECTORY RADAR
              </div>
            </div>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: accentColor,
              boxShadow: `0 0 8px ${accentColor}`, animation: 'blink-led 1.8s ease-in-out infinite', marginLeft: 4 }} />
          </div>

          {/* Status pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 8 }}>
            {[
              { label: 'ORBITAL DECAY: ACCELERATING',       color: accentColor },
              { label: `REM LIQUIDATED: ${remLiquidated.toFixed(3)} HRS`, color: '#F5A623' },
              { label: `REGRET INDEX: ${finalRegret.toFixed(1)}%`,       color: finalRegret > 75 ? '#FF2A54' : '#F5A623' },
            ].map(({ label, color }) => (
              <span key={label} style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                padding: '2px 8px', borderRadius: 5,
                border: `1px solid ${color}40`,
                color, background: `${color}0c`,
              }}>{label}</span>
            ))}
          </div>

          <div style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)', fontSize: 8,
            color: 'rgba(255,255,255,0.28)', textAlign: 'right',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            lineHeight: 1.5, display: 'none',
          }} className="hidden lg:block">
            "We don't prevent bad decisions.<br/>We quantify them."
          </div>
        </header>

        {/* ── TWO-COLUMN COCKPIT ── */}
        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem',
          minHeight: 0,
        }} className="lg-cockpit-grid">

          {/* ═══ LEFT — MISSION INPUTS ═════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }} className="left-panel">

            {/* Episode count */}
            <Card accentColor={accentColor} label="Episode Count" icon={<Cpu size={12} color={accentColor} />}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StepBtn onClick={() => { setEpisodes(e => Math.max(1, e - 1)); playClick(); }}><ChevronDown size={16} /></StepBtn>
                <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 34, fontWeight: 900, color: accentColor, lineHeight: 1 }}>
                  {episodes}
                </div>
                <StepBtn onClick={() => { setEpisodes(e => e + 1); playClick(); }}><ChevronUp size={16} /></StepBtn>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                {[1, 2, 3, 5].map(p => (
                  <PresetBtn key={p} active={episodes === p} color={accentColor}
                    onClick={() => { setEpisodes(p); playClick(); }}>{p}</PresetBtn>
                ))}
                <PresetBtn
                  active={episodes >= 10}
                  color="#FF2A54"
                  onClick={() => { setEpisodes(99); playClick(); playAlertHum(); }}
                  style={{ flex: 1.5 }}
                >☠ GOD HELP ME</PresetBtn>
              </div>
            </Card>

            {/* Runtime */}
            <Card accentColor={accentColor} label={`Runtime — ${runtime}m`}>
              <input
                type="range" min={10} max={180} step={1} value={runtime}
                onChange={e => setRuntime(+e.target.value)}
                className="slider-neon"
                style={{ '--pct': `${runtimePct.toFixed(1)}%`, width: '100%', marginBottom: 10 }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {RUNTIME_PRESETS.map(p => (
                  <PresetBtn key={p.v} active={runtime === p.v} color={accentColor}
                    onClick={() => { setRuntime(p.v); playClick(); }}>
                    {p.label} · {p.v}m
                  </PresetBtn>
                ))}
              </div>
            </Card>

            {/* Time anchors */}
            <Card accentColor={accentColor} label="Temporal Anchors" icon={<Clock size={12} color={accentColor} />}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={microLabel}>Now</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
                    textAlign: 'center', padding: '8px',
                    background: 'rgba(0,0,0,0.3)', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    {nowHHMM(now)}
                    <span style={{ opacity: 0.35, fontSize: 11, marginLeft: 2 }}>:{pad2(now.getSeconds())}</span>
                  </div>
                </div>
                <div>
                  <div style={microLabel}>Alarm</div>
                  <input type="time" value={wakeUpTime}
                    onChange={e => { setWakeUpTime(e.target.value); playClick(); }} />
                </div>
              </div>
            </Card>

            {/* Stakes */}
            <Card accentColor={accentColor} label="Tomorrow Stakes">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {STAKES_OPTS.map(o => (
                  <button key={o.v}
                    onClick={() => { setStakes(o.v); playClick(); }}
                    style={{
                      background: stakes === o.v ? `${accentColor}12` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${stakes === o.v ? accentColor : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10, padding: '10px 6px',
                      cursor: 'pointer', transition: 'all .18s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      boxShadow: stakes === o.v ? `0 0 14px ${accentColor}20` : 'none',
                    }}>
                    <span style={{ fontSize: 18 }}>{o.icon}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                      color: stakes === o.v ? accentColor : 'rgba(255,255,255,0.55)' }}>{o.label}</span>
                    <span style={{ ...microLabel, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>{o.sub}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Cliffhanger */}
            <Card accentColor={accentColor} label="Cliffhanger Intensity" icon={<AlertTriangle size={12} color={cliffhanger === 2 ? '#FF2A54' : accentColor} />}>
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
                {CLIFF_OPTS.map((o, i) => (
                  <button key={o.v}
                    onClick={() => { setCliffhanger(o.v); playClick(); if (o.v === 2) playAlertHum(); }}
                    style={{
                      flex: 1, padding: '10px 4px',
                      background: cliffhanger === o.v
                        ? (o.v === 2 ? 'rgba(255,42,84,0.12)' : `${accentColor}10`)
                        : 'transparent',
                      border: 'none',
                      borderRight: i < CLIFF_OPTS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                      cursor: 'pointer', transition: 'all .18s',
                      fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: cliffhanger === o.v
                        ? (o.v === 2 ? '#FF2A54' : accentColor)
                        : 'rgba(255,255,255,0.35)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    }}>
                    <span>{o.label}</span>
                    {o.sub && <span style={{ fontSize: 7, opacity: 0.6 }}>{o.sub}</span>}
                  </button>
                ))}
              </div>
              {cliffhanger === 2 && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#FF2A54', marginTop: 6,
                  display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={9} /> WARNING: CATASTROPHIC NARRATIVE HOOK DETECTED
                </p>
              )}
            </Card>

            {/* Stat strip */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              gap: 6,
            }}>
              {[
                { label: 'Binge',   value: `${bingeMinutes}m`,  color: accentColor },
                { label: 'Finish',  value: finishStr,            color: '#F5A623' },
                { label: 'Sleep',   value: sleepLabel,           color: sleepColor },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  background: 'rgba(14,17,30,0.55)', backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
                  padding: '10px 8px', textAlign: 'center',
                }}>
                  <div style={microLabel}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Multi-day warning */}
            {(daysOffset > 0 || sleepNeg) && (
              <div style={{
                background: 'rgba(255,42,84,0.1)', border: '1px solid rgba(255,42,84,0.35)',
                borderRadius: 8, padding: '8px 12px',
                fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FF2A54',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <AlertTriangle size={11} />
                {sleepNeg
                  ? `SLEEP DEBT: ${Math.abs(sleepHours).toFixed(1)}h IN DEFICIT — YOU WILL NOT SLEEP.`
                  : `DAY+${daysOffset} BLEED — BINGE CROSSES MIDNIGHT BOUNDARY.`}
              </div>
            )}
          </div>

          {/* ═══ RIGHT — TELEMETRY HUD ══════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden' }} className="right-panel">

            {/* Tachometer hero */}
            <div style={{
              background: 'rgba(14,17,30,0.6)', backdropFilter: 'blur(24px)',
              border: `1px solid ${accentColor}25`,
              borderRadius: 16,
              padding: '1rem 1.25rem 0.5rem',
              boxShadow: `0 0 40px ${accentColor}0a`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              flexShrink: 0,
            }}>
              {/* Panel header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '0.5rem', marginBottom: '0.5rem',
                width: '100%',
              }}>
                <Radio size={12} color={accentColor} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: `${accentColor}99`, textTransform: 'uppercase' }}>
                  Regret Tachometer · Live Telemetry
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px', borderRadius: 4,
                  background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}>LIVE</span>
              </div>

              <TachometerGauge regret={finalRegret} accentColor={accentColor} statusLabel={statusLabel} />

              {/* Big decimal readout under needle */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 38, fontWeight: 900, color: accentColor, letterSpacing: '-0.04em', lineHeight: 1, marginTop: '-0.5rem' }}>
                {finalRegret.toFixed(3)}<span style={{ fontSize: 20, opacity: 0.5 }}>%</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginTop: 4, marginBottom: 4 }}>
                {finalRegret >= 88 ? 'REDLINE STATE: CRITICAL COGNITIVE BLOWOUT' : `REGRET STATUS: ${statusLabel}`}
              </div>
            </div>

            {/* Graph */}
            <div style={{
              background: 'rgba(14,17,30,0.55)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
              padding: '1rem 1.25rem',
              flex: 1, minHeight: 0,
            }}>
              <RegretGraph episodes={episodes} finalRegret={finalRegret} />
            </div>

            {/* Transmission */}
            <div style={{
              background: 'rgba(14,17,30,0.55)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
              padding: '0.85rem 1.1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Zap size={12} color={accentColor} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: `${accentColor}99`, textTransform: 'uppercase' }}>
                  Tomorrow You · Encrypted Com-Link
                </span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: 'var(--font-mono)', fontSize: 8, color: `${accentColor}80` }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accentColor,
                    display: 'inline-block', animation: 'blink-led 1.8s ease-in-out infinite' }} />
                  DECRYPTING
                </span>
              </div>
              <TransmissionConsole txTier={txTier} accentColor={accentColor} now={now} />
            </div>

            {/* CTA */}
            <button
              onClick={handleCTA}
              style={{
                width: '100%', padding: '1.1rem 1rem',
                background: 'linear-gradient(135deg, rgba(255,42,84,0.14), rgba(122,0,22,0.18))',
                border: `1px solid #FF2A54`,
                borderRadius: 12, cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                color: '#FF2A54', letterSpacing: '0.06em', textTransform: 'uppercase',
                position: 'relative', overflow: 'hidden',
                transition: 'all .22s', flexShrink: 0,
                boxShadow: '0 0 0 0 rgba(255,42,84,0)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,42,84,0.3), rgba(122,0,22,0.36))';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255,42,84,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,42,84,0.14), rgba(122,0,22,0.18))';
                e.currentTarget.style.color = '#FF2A54';
                e.currentTarget.style.boxShadow = '0 0 0 0 rgba(255,42,84,0)';
              }}
            >
              {/* Scanlines */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.025) 2px,rgba(255,255,255,0.025) 4px)',
                pointerEvents: 'none',
              }}/>
              {/* Pulse ring */}
              <div style={{
                position: 'absolute', inset: -2, border: '2px solid #FF2A54',
                borderRadius: 13, pointerEvents: 'none',
                animation: 'ctaPulse 2s ease-in-out infinite',
              }}/>
              <style>{`@keyframes ctaPulse{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.7;transform:scale(1.01)}}`}</style>
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Zap size={16} />
                MAKE A TERRIBLE DECISION: WATCH ONE MORE
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', marginTop: '0.5rem', flexShrink: 0,
          fontFamily: 'var(--font-mono)', fontSize: 8.5,
          color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em',
        }}>
          ONE MORE™ v3.0 · SLEEP TRAJECTORY RADAR · All data is satirical and mathematically rigorous
        </div>
      </div>

      <style>{`
        @keyframes blink-led{0%,90%,100%{opacity:1}95%{opacity:.1}}
        .shaking{animation:screen-shake .4s cubic-bezier(.36,.07,.19,.97) both}
        @keyframes screen-shake{
          0%,100%{transform:translate(0,0)}
          10%,30%,50%,70%,90%{transform:translate(-5px,-2px) rotate(-.4deg)}
          20%,40%,60%,80%{transform:translate(5px,2px) rotate(.4deg)}
        }
        @media(min-width:1024px){
          .lg-cockpit-grid{grid-template-columns:5fr 7fr !important}
          .left-panel{overflow-y:auto;padding-right:4px}
          .right-panel{overflow:hidden}
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
const microLabel = {
  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4,
};

function Card({ children, accentColor, label, icon }) {
  return (
    <div style={{
      background: 'rgba(14,17,30,0.55)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '0.9rem 1.1rem',
      boxShadow: `0 0 0 1px rgba(0,0,0,0), inset 0 1px 0 rgba(255,255,255,0.03)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
        borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>
        {icon}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: `${accentColor}80` }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function StepBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 38, height: 38, borderRadius: 8,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#fff', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      transition: 'background .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    >{children}</button>
  );
}

function PresetBtn({ children, active, color = '#00F5D4', onClick, style: extraStyle }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '5px 4px', borderRadius: 6,
      background: active ? `${color}12` : 'transparent',
      border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
      color: active ? color : 'rgba(255,255,255,0.4)',
      fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer',
      transition: 'all .16s', ...extraStyle,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = active ? color : 'rgba(255,255,255,0.1)'}
    >{children}</button>
  );
}