// src/components/StarfieldCanvas.jsx
// Deep-space parallax starfield with cursor repulsion & warp effect

import { useEffect, useRef } from 'react';

const STAR_COUNT = 260;
const LAYERS = 3;
const BASE_SPEEDS = [0.08, 0.2, 0.45];

function initStars(W, H) {
  return Array.from({ length: STAR_COUNT }, (_, i) => {
    const layer = i % LAYERS;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: (layer + 1) * 0.6 + Math.random() * 0.8,
      layer,
      speed: BASE_SPEEDS[layer],
      twinkleOffset: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.008 + Math.random() * 0.012,
      vx: 0,
      vy: 0,
    };
  });
}

export default function StarfieldCanvas({ warpActive }) {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const warpRef = useRef(0); // 0..1 warp intensity
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      starsRef.current = initStars(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    let animId;

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      frameRef.current = t;
      const W = canvas.width;
      const H = canvas.height;

      // Warp decay
      if (warpRef.current > 0) {
        warpRef.current = Math.max(0, warpRef.current - 0.018);
      }

      // Background gradient (nebula)
      const bg = ctx.createRadialGradient(W / 2, H / 2, H * 0.05, W / 2, H / 2, H * 0.85);
      bg.addColorStop(0, '#0a0620');
      bg.addColorStop(0.45, '#050814');
      bg.addColorStop(1, '#030305');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Subtle nebula aurora blobs
      const nebulaPositions = [
        { x: W * 0.2, y: H * 0.3, r: H * 0.35, color: 'rgba(26,11,46,0.35)' },
        { x: W * 0.8, y: H * 0.7, r: H * 0.3, color: 'rgba(10,3,30,0.4)' },
        { x: W * 0.5, y: H * 0.5, r: H * 0.5, color: 'rgba(5,8,20,0.5)' },
      ];
      nebulaPositions.forEach(({ x, y, r, color }) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.2, r * 0.8, Math.sin(t * 0.00015) * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw stars
      const warp = warpRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      starsRef.current.forEach((s) => {
        // Cursor repulsion
        const dx = s.x - mx;
        const dy = s.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repulseRadius = 120;
        if (dist < repulseRadius && dist > 0) {
          const force = (1 - dist / repulseRadius) * 0.6;
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        }
        s.vx *= 0.88;
        s.vy *= 0.88;

        // Move
        const effectiveSpeed = s.speed * (1 + warp * 22);
        s.x += s.vx;
        s.y -= effectiveSpeed;
        if (s.y < -5) {
          s.y = H + 5;
          s.x = Math.random() * W;
          s.vx = 0; s.vy = 0;
        }

        // Twinkle
        const alpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset));
        const layerAlpha = [0.45, 0.65, 0.9][s.layer];

        if (warp > 0.05) {
          // Warp lines
          const len = s.speed * warp * 500;
          const grd = ctx.createLinearGradient(s.x, s.y, s.x, s.y + len);
          grd.addColorStop(0, `rgba(255,255,255,${layerAlpha * alpha * warp})`);
          grd.addColorStop(1, 'transparent');
          ctx.strokeStyle = grd;
          ctx.lineWidth = s.r * 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x, s.y + len);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${layerAlpha * alpha})`;
          ctx.fill();
        }
      });
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // Trigger warp
  useEffect(() => {
    if (warpActive) {
      warpRef.current = 1.0;
    }
  }, [warpActive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
