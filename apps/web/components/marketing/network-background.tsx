'use client';

import { useEffect, useRef } from 'react';

// Animated canvas background: drifting nodes connected by sonar-green lines,
// with periodic "link snap" events in coral to reinforce the brand metaphor.
export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0;
    const N = innerWidth < 700 ? 42 : 80;

    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: Node[] = [];

    function resize() {
      if (!cv) return;
      W = cv.width = innerWidth * devicePixelRatio;
      H = cv.height = innerHeight * devicePixelRatio;
      cv.style.width = innerWidth + 'px';
      cv.style.height = innerHeight + 'px';
    }

    function build() {
      nodes = Array.from({ length: N }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
        r: (1.1 + Math.random() * 1.6) * devicePixelRatio,
      }));
    }

    resize();
    build();
    window.addEventListener('resize', resize);

    const mouse = { x: -9999, y: -9999 };
    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX * devicePixelRatio;
      mouse.y = e.clientY * devicePixelRatio;
    });

    type Snap = { a: Node; b: Node; t: number };
    let snaps: Snap[] = [];

    const snapInterval = setInterval(() => {
      if (reduced || nodes.length < 2) return;
      const a = nodes[Math.floor(Math.random() * nodes.length)]!;
      let b: Node | null = null, best = 1e12;
      for (const n of nodes) {
        if (n === a) continue;
        const d = (n.x - a.x) ** 2 + (n.y - a.y) ** 2;
        if (d < best) { best = d; b = n; }
      }
      if (b) snaps.push({ a, b, t: 0 });
    }, 2600);

    const MAXD = 150 * devicePixelRatio;
    let raf: number;

    function frame() {
      ctx!.clearRect(0, 0, W, H);

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
        if (d < 260 * devicePixelRatio && d > 1) { n.x += dx / d * 0.18; n.y += dy / d * 0.18; }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]!, b = nodes[j]!;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < MAXD) {
            const o = (1 - d / MAXD) * 0.32;
            ctx!.strokeStyle = `rgba(43,217,194,${o})`;
            ctx!.lineWidth = devicePixelRatio * 0.7;
            ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
          }
        }
      }

      snaps = snaps.filter((s) => s.t < 1);
      for (const s of snaps) {
        s.t += 0.012;
        const mid = { x: (s.a.x + s.b.x) / 2, y: (s.a.y + s.b.y) / 2 };
        const gap = s.t * 26 * devicePixelRatio;
        const ang = Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x);
        ctx!.strokeStyle = `rgba(255,92,69,${1 - s.t})`;
        ctx!.lineWidth = devicePixelRatio * 1.4;
        ctx!.shadowColor = 'rgba(255,92,69,.9)'; ctx!.shadowBlur = 14 * (1 - s.t) * devicePixelRatio;
        ctx!.beginPath(); ctx!.moveTo(s.a.x, s.a.y);
        ctx!.lineTo(mid.x - Math.cos(ang) * gap, mid.y - Math.sin(ang) * gap); ctx!.stroke();
        ctx!.beginPath(); ctx!.moveTo(mid.x + Math.cos(ang) * gap, mid.y + Math.sin(ang) * gap);
        ctx!.lineTo(s.b.x, s.b.y); ctx!.stroke();
        ctx!.shadowBlur = 0;
        ctx!.fillStyle = `rgba(255,92,69,${1 - s.t})`;
        ctx!.beginPath(); ctx!.arc(s.a.x, s.a.y, 3.4 * devicePixelRatio, 0, 7); ctx!.fill();
        ctx!.beginPath(); ctx!.arc(s.b.x, s.b.y, 3.4 * devicePixelRatio, 0, 7); ctx!.fill();
      }

      for (const n of nodes) {
        ctx!.fillStyle = 'rgba(159,180,200,.75)';
        ctx!.beginPath(); ctx!.arc(n.x, n.y, n.r, 0, 7); ctx!.fill();
      }

      if (!reduced) raf = requestAnimationFrame(frame);
    }

    frame();

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(snapInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 block"
    />
  );
}
