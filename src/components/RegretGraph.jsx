// src/components/RegretGraph.jsx
// Smooth Bezier SVG graph — Dopamine vs Cumulative Regret

import { useMemo, useState } from 'react';

const W = 480;
const H = 200;
const PAD = { t: 20, r: 20, b: 30, l: 40 };
const GW = W - PAD.l - PAD.r;
const GH = H - PAD.t - PAD.b;
const MAX_EP = 10;

function dopamineAt(ep) {
  // Logarithmic decay: starts at 95%, falls to ~18% at ep=10
  return 95 - 77 * (Math.log(ep) / Math.log(MAX_EP));
}

function regretAt(ep, finalRegret, totalEpisodes) {
  // Exponential arc anchored to current calculation
  const maxRegret = finalRegret;
  const ratio = ep / Math.max(totalEpisodes, 1);
  return Math.min(99, maxRegret * Math.pow(ratio, 0.7));
}

function toSvgX(ep) {
  return PAD.l + ((ep - 1) / (MAX_EP - 1)) * GW;
}
function toSvgY(pct) {
  return PAD.t + GH - (pct / 100) * GH;
}

// Build a smooth cubic bezier path through points
function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev[0] + curr[0]) / 2;
    d += ` C ${cpX} ${prev[1]} ${cpX} ${curr[1]} ${curr[0]} ${curr[1]}`;
  }
  return d;
}

export default function RegretGraph({ episodes, finalRegret }) {
  const [scrubX, setScrubX] = useState(null);

  const { dopaminePath, regretPath, crossover, scrubData } = useMemo(() => {
    const dopPts = [];
    const regPts = [];

    for (let ep = 1; ep <= MAX_EP; ep++) {
      const d = dopamineAt(ep);
      const r = regretAt(ep, finalRegret, episodes);
      dopPts.push([toSvgX(ep), toSvgY(d)]);
      regPts.push([toSvgX(ep), toSvgY(r)]);
    }

    // Find crossover: first ep where regret > dopamine
    let crossoverX = null, crossoverY = null;
    for (let ep = 1; ep <= MAX_EP; ep++) {
      const d = dopamineAt(ep);
      const r = regretAt(ep, finalRegret, episodes);
      if (r >= d) {
        crossoverX = toSvgX(ep);
        crossoverY = toSvgY(d);
        break;
      }
    }

    // Scrub data
    let sData = null;
    if (scrubX !== null) {
      const relEp = ((scrubX - PAD.l) / GW) * (MAX_EP - 1) + 1;
      const ep = Math.max(1, Math.min(MAX_EP, relEp));
      const sleepEst = Math.max(0, 8 - (ep * finalRegret / 100) * 0.8);
      sData = { x: scrubX, ep: ep.toFixed(1), sleep: sleepEst.toFixed(1) };
    }

    return {
      dopaminePath: smoothPath(dopPts),
      regretPath: smoothPath(regPts),
      crossover: crossoverX ? { x: crossoverX, y: crossoverY } : null,
      scrubData: sData,
    };
  }, [episodes, finalRegret, scrubX]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="micro-label">Crossover Point™ Analysis</span>
        <div className="flex gap-3 items-center">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-cyan-400"></span>
            <span className="micro-label" style={{ color: '#00F5D4' }}>Dopamine Yield</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-red-500"></span>
            <span className="micro-label" style={{ color: '#FF2A54' }}>Cumulative Regret</span>
          </span>
        </div>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: 'visible', cursor: 'crosshair', transition: 'all 0.5s' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const rawX = ((e.clientX - rect.left) / rect.width) * W;
          setScrubX(Math.max(PAD.l, Math.min(W - PAD.r, rawX)));
        }}
        onMouseLeave={() => setScrubX(null)}
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => (
          <g key={pct}>
            <line
              x1={PAD.l} y1={toSvgY(pct)} x2={W - PAD.r} y2={toSvgY(pct)}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            />
            <text x={PAD.l - 5} y={toSvgY(pct) + 4} textAnchor="end"
              fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="'Space Mono', monospace">
              {pct}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {[1, 3, 5, 7, 10].map(ep => (
          <text key={ep} x={toSvgX(ep)} y={H - 5} textAnchor="middle"
            fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="'Space Mono', monospace">
            {ep}
          </text>
        ))}

        {/* Dopamine area fill */}
        <path
          d={dopaminePath + ` L ${W - PAD.r} ${PAD.t + GH} L ${PAD.l} ${PAD.t + GH} Z`}
          fill="url(#dopGrad)" opacity="0.12"
          style={{ transition: 'd 0.5s' }}
        />

        {/* Regret area fill */}
        <path
          d={regretPath + ` L ${W - PAD.r} ${PAD.t + GH} L ${PAD.l} ${PAD.t + GH} Z`}
          fill="url(#regGrad)" opacity="0.14"
          style={{ transition: 'd 0.5s' }}
        />

        {/* Curve paths */}
        <path d={dopaminePath} fill="none" stroke="#00F5D4" strokeWidth="2.5"
          strokeLinecap="round" style={{ transition: 'd 0.5s' }} />
        <path d={regretPath} fill="none" stroke="#FF2A54" strokeWidth="2.5"
          strokeLinecap="round" style={{ transition: 'd 0.5s' }} />

        {/* Crossover marker */}
        {crossover && (
          <g className="crossover-pulse">
            <line x1={crossover.x} y1={PAD.t} x2={crossover.x} y2={PAD.t + GH}
              stroke="rgba(245,166,35,0.3)" strokeDasharray="4 3" strokeWidth="1" />
            <circle cx={crossover.x} cy={crossover.y} r="6" fill="#F5A623" opacity="0.9" />
            <circle className="ring" cx={crossover.x} cy={crossover.y} r="6" fill="none" stroke="#F5A623" strokeWidth="2" />
            <text x={crossover.x + 8} y={crossover.y - 10} fill="#F5A623"
              fontSize="8" fontFamily="'Space Mono', monospace" fontWeight="700">
              POINT OF NO RETURN
            </text>
          </g>
        )}

        {/* Scrub line */}
        {scrubX && (
          <g>
            <line x1={scrubX} y1={PAD.t} x2={scrubX} y2={PAD.t + GH}
              stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 3" />
            <rect x={scrubX + 4} y={PAD.t} width={80} height={30} rx="4"
              fill="rgba(14,17,30,0.9)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x={scrubX + 8} y={PAD.t + 11} fill="#fff" fontSize="8" fontFamily="'Space Mono', monospace">
              EP: ~{scrubData?.ep}
            </text>
            <text x={scrubX + 8} y={PAD.t + 23} fill="#00F5D4" fontSize="8" fontFamily="'Space Mono', monospace">
              ~{scrubData?.sleep}h sleep
            </text>
          </g>
        )}

        <defs>
          <linearGradient id="dopGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00F5D4" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="regGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF2A54" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
