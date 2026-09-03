// src/components/RegretGraph.jsx — Smooth Bezier SVG graph with crossover + scrubber

import { useMemo, useState } from 'react';

const W = 460, H = 180;
const PAD = { t: 24, r: 16, b: 28, l: 36 };
const GW = W - PAD.l - PAD.r;
const GH = H - PAD.t - PAD.b;
const MAX_EP = 10;

const toX = (ep)  => PAD.l + ((ep - 1) / (MAX_EP - 1)) * GW;
const toY = (pct) => PAD.t + GH - (Math.max(0, Math.min(100, pct)) / 100) * GH;

// Dopamine: starts 95, decays logarithmically
const dopAt = (ep) => Math.max(5, 95 - 77 * (Math.log(ep) / Math.log(MAX_EP)));

// Regret: exponential rise anchored to finalRegret at `episodes`
const regAt = (ep, finalRegret, totalEp) => {
  const ratio = ep / Math.max(totalEp, 1);
  return Math.min(99.5, finalRegret * Math.pow(ratio, 0.65));
};

// Build smooth cubic bezier path through [x,y] array
function smoothBezier(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx2, cy2] = pts[i];
    const cpX = (px + cx2) / 2;
    d += ` C ${cpX.toFixed(1)} ${py.toFixed(1)}, ${cpX.toFixed(1)} ${cy2.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}`;
  }
  return d;
}

// Fraction of GW where regret overtakes dopamine
function findCrossoverFrac(finalRegret, totalEp) {
  for (let ep = 1; ep <= MAX_EP; ep += 0.1) {
    if (regAt(ep, finalRegret, totalEp) >= dopAt(ep)) {
      return (ep - 1) / (MAX_EP - 1);
    }
  }
  return null;
}

export default function RegretGraph({ episodes, finalRegret }) {
  const [hoverX, setHoverX] = useState(null);

  const { dopPath, regPath, crossover, areaReg, areaDop } = useMemo(() => {
    const dPts = [], rPts = [];
    for (let ep = 1; ep <= MAX_EP; ep++) {
      dPts.push([toX(ep), toY(dopAt(ep))]);
      rPts.push([toX(ep), toY(regAt(ep, finalRegret, episodes))]);
    }
    const dp = smoothBezier(dPts);
    const rp = smoothBezier(rPts);

    const frac = findCrossoverFrac(finalRegret, episodes);
    const co   = frac !== null ? {
      x: PAD.l + frac * GW,
      y: toY(dopAt(1 + frac * (MAX_EP - 1))),
    } : null;

    // Area fill paths
    const floor = `L ${PAD.l + GW} ${PAD.t + GH} L ${PAD.l} ${PAD.t + GH} Z`;
    return { dopPath: dp, regPath: rp, crossover: co,
      areaDop: dp + floor, areaReg: rp + floor };
  }, [episodes, finalRegret]);

  // Scrub tooltip data
  const scrub = useMemo(() => {
    if (hoverX === null) return null;
    const frac = (hoverX - PAD.l) / GW;
    if (frac < 0 || frac > 1) return null;
    const ep = 1 + frac * (MAX_EP - 1);
    const d  = dopAt(ep);
    const r  = regAt(ep, finalRegret, episodes);
    const sleepApprox = Math.max(0, 8 - (r / 100) * 6).toFixed(1);
    return { x: hoverX, ep: ep.toFixed(1), d: d.toFixed(0), r: r.toFixed(0), sleep: sleepApprox };
  }, [hoverX, episodes, finalRegret]);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
          Crossover Point™ · Dopamine vs Regret
        </span>
        <div className="flex gap-3">
          {[['#00F5D4','Dopamine Yield'],['#FF2A54','Cumulative Regret']].map(([c,l]) => (
            <span key={l} className="flex items-center gap-1">
              <span style={{ width: 14, height: 2, background: c, display: 'inline-block', borderRadius: 1 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: c, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</span>
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ cursor: 'crosshair', overflow: 'visible' }}
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoverX(((e.clientX - rect.left) / rect.width) * W);
        }}
        onMouseLeave={() => setHoverX(null)}
      >
        <defs>
          <linearGradient id="dGrd" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#00F5D4" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="rGrd" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF2A54" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#FF2A54" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Grid */}
        {[0,25,50,75,100].map(p => (
          <g key={p}>
            <line x1={PAD.l} y1={toY(p)} x2={W-PAD.r} y2={toY(p)} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            <text x={PAD.l-4} y={toY(p)+4} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="'Space Mono',monospace">{p}</text>
          </g>
        ))}
        {[1,2,3,4,5,6,7,8,9,10].map(ep => (
          <text key={ep} x={toX(ep)} y={H-4} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="'Space Mono',monospace">{ep}</text>
        ))}

        {/* Area fills */}
        <path d={areaDop} fill="url(#dGrd)" style={{ transition: 'd 0.5s ease' }}/>
        <path d={areaReg} fill="url(#rGrd)" style={{ transition: 'd 0.5s ease' }}/>

        {/* Curves */}
        <path d={dopPath} fill="none" stroke="#00F5D4" strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'd 0.5s ease', filter: 'drop-shadow(0 0 4px #00F5D4aa)' }}/>
        <path d={regPath} fill="none" stroke="#FF2A54" strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'd 0.5s ease', filter: 'drop-shadow(0 0 4px #FF2A54aa)' }}/>

        {/* Current episode marker */}
        <line x1={toX(Math.min(episodes,MAX_EP))} y1={PAD.t} x2={toX(Math.min(episodes,MAX_EP))} y2={PAD.t+GH}
          stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3"/>

        {/* Crossover */}
        {crossover && (
          <g>
            <line x1={crossover.x} y1={PAD.t} x2={crossover.x} y2={PAD.t+GH} stroke="rgba(245,166,35,0.3)" strokeDasharray="4 3" strokeWidth="1"/>
            <circle cx={crossover.x} cy={crossover.y} r="5.5" fill="#F5A623" style={{ filter: 'drop-shadow(0 0 6px #F5A623)' }}/>
            <circle cx={crossover.x} cy={crossover.y} r="5.5" fill="none" stroke="#F5A623" strokeWidth="2"
              style={{ animation: 'crossPulse 1.4s ease-out infinite', transformOrigin: `${crossover.x}px ${crossover.y}px` }}/>
            <text x={crossover.x+8} y={crossover.y-9} fill="#F5A623" fontSize="7.5" fontFamily="'Space Mono',monospace" fontWeight="700">POINT OF NO RETURN</text>
            <style>{`@keyframes crossPulse{0%{transform:scale(1);opacity:1}100%{transform:scale(2.6);opacity:0}}`}</style>
          </g>
        )}

        {/* Scrubber */}
        {scrub && (
          <g>
            <line x1={scrub.x} y1={PAD.t} x2={scrub.x} y2={PAD.t+GH} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3"/>
            <rect x={Math.min(scrub.x+6, W-95)} y={PAD.t} width={88} height={44} rx="5"
              fill="rgba(14,17,30,0.95)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            <text x={Math.min(scrub.x+10, W-91)} y={PAD.t+14} fill="rgba(255,255,255,0.7)" fontSize="8" fontFamily="'Space Mono',monospace">Ep ~{scrub.ep}</text>
            <text x={Math.min(scrub.x+10, W-91)} y={PAD.t+26} fill="#00F5D4" fontSize="8" fontFamily="'Space Mono',monospace">Dop: {scrub.d}%</text>
            <text x={Math.min(scrub.x+10, W-91)} y={PAD.t+38} fill="#FF2A54" fontSize="8" fontFamily="'Space Mono',monospace">Reg: {scrub.r}% · ~{scrub.sleep}h</text>
          </g>
        )}
      </svg>
    </div>
  );
}
