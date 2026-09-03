// src/components/TransmissionConsole.jsx
// Typewriter terminal showing "Tomorrow You" transmissions

import { useEffect, useRef, useState } from 'react';

const MESSAGES = {
  0: [
    "[SIGNAL NOMINAL]",
    "Tomorrow You is mildly optimistic,",
    "though slightly suspicious of your",
    "decision-making capabilities.",
    "Coffee: Optional. Risk: Acceptable.",
  ],
  1: [
    "[WARNING: MILD TEMPORAL DEBT DETECTED]",
    "Tomorrow You has pre-ordered an extra",
    "espresso and quietly cancelled the",
    "morning gym session. You are forgiven.",
    "Barely.",
  ],
  2: [
    "[CRITICAL: COGNITIVE COLLAPSE IMMINENT]",
    "Tomorrow You is staring blankly at",
    "the shower wall at 7:04 AM wondering",
    "who allowed you access to Netflix.",
    "The meeting is in 53 minutes.",
  ],
  3: [
    "[ERROR: TRANSMISSION LOST]",
    "Tomorrow You has entered full cognitive",
    "bankruptcy. Signal degraded beyond",
    "recovery threshold. Espresso cannot",
    "fix this. Nothing can.",
  ],
};

export default function TransmissionConsole({ txTier, now, accentColor }) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLine, setCurrentLine] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const timeoutRef = useRef(null);
  const prevTierRef = useRef(txTier);

  useEffect(() => {
    // Reset when tier changes
    if (prevTierRef.current !== txTier) {
      prevTierRef.current = txTier;
      setDisplayedLines([]);
      setCurrentLine('');
      setLineIdx(0);
      setCharIdx(0);
      return;
    }
  }, [txTier]);

  useEffect(() => {
    const lines = MESSAGES[txTier] || MESSAGES[0];
    if (lineIdx >= lines.length) return;

    const line = lines[lineIdx];
    if (charIdx < line.length) {
      timeoutRef.current = setTimeout(() => {
        setCurrentLine(line.substring(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, 28);
    } else {
      timeoutRef.current = setTimeout(() => {
        setDisplayedLines(prev => [...prev, line]);
        setCurrentLine('');
        setLineIdx(l => l + 1);
        setCharIdx(0);
      }, 350);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [txTier, lineIdx, charIdx]);

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="terminal-screen">
      <div className="flex gap-3 mb-2" style={{ opacity: 0.5 }}>
        <span className="micro-label" style={{ color: accentColor }}>◉ REC</span>
        <span className="micro-label">UPLINK: SECURE-Q7</span>
        <span className="micro-label" style={{ marginLeft: 'auto' }}>{timeStr}</span>
      </div>

      {displayedLines.map((l, i) => (
        <div key={i} style={{ color: i === 0 ? accentColor : 'rgba(226,232,240,0.7)', fontWeight: i === 0 ? 700 : 400 }}>
          {l}
        </div>
      ))}

      {lineIdx < (MESSAGES[txTier] || []).length && (
        <div className="terminal-cursor" style={{ color: lineIdx === 0 ? accentColor : 'rgba(226,232,240,0.7)', fontWeight: lineIdx === 0 ? 700 : 400 }}>
          {currentLine}
        </div>
      )}
    </div>
  );
}
