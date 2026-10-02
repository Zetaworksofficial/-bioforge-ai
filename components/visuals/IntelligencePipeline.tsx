"use client";

import React, { useEffect, useState, useMemo } from "react";

// 100% deterministic LCG pseudo-random number generator
const prng = (seed: number) => {
  let state = (seed ^ 0x5deece66d) & 0x7fffffff;
  state = (state * 48271) % 2147483647;
  return state / 2147483647;
};

export function IntelligencePipeline({ progress, isVisible }: { progress: number; isVisible: boolean }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const kOpacity = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, (progress - 0.1) * 4));
  const rOpacity = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, (progress - 0.3) * 4));
  const reOpacity = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, (progress - 0.5) * 4));
  const dOpacity = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, (progress - 0.7) * 4));

  const t = prefersReducedMotion ? "none" : "opacity 0.6s ease-out";

  // Data Generation
  const knowledgeNodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 40; i++) {
      const x = 250 + prng(i) * 300;
      const y = 40 + prng(i + 100) * 120;
      arr.push({ id: i, x, y });
    }
    return arr;
  }, []);

  const relationshipNodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      const x = 300 + prng(i + 200) * 200;
      const y = 250 + prng(i + 300) * 120;
      arr.push({ id: i, x, y });
    }
    return arr;
  }, []);

  const reasoningNodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      // Create a tighter path funneling down
      const x = 380 + (prng(i + 400) * 40 - 20);
      const y = 450 + i * 25;
      arr.push({ id: i, x, y });
    }
    return arr;
  }, []);

  const discoveryNode = { x: 380, y: 720 };

  return (
    <div className="w-full relative h-[600px] lg:h-[800px] flex items-center justify-end pointer-events-none">
      <svg
        viewBox="0 0 600 800"
        className="w-full h-full overflow-visible origin-right"
        preserveAspectRatio="xMaxYMid meet"
      >
        <defs>
          <linearGradient id="pathwayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-bio-cyan)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="var(--color-bio-cyan)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-bio-cyan)" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* GUIDELINES */}
        <line x1="220" y1="0" x2="220" y2="800" stroke="var(--color-soft-graphite)" strokeWidth="1" strokeDasharray="4 6" opacity="0.3" />

        {/* STAGE 1: KNOWLEDGE */}
        <g style={{ opacity: kOpacity, transition: t }}>
          <text x="0" y="80" className="font-sans text-xs tracking-[0.25em] fill-off-white uppercase font-bold">KNOWLEDGE</text>
          <text x="0" y="105" className="font-sans text-[13px] fill-muted-white">multiple biological</text>
          <text x="0" y="125" className="font-sans text-[13px] fill-muted-white">entities / nodes</text>

          {knowledgeNodes.map(n => (
            <circle key={`kn-${n.id}`} cx={n.x} cy={n.y} r="2" fill="var(--color-muted-white)" opacity="0.4" />
          ))}

          {/* Lines drifting down to relationships */}
          {knowledgeNodes.map((n, i) => {
            if (i % 3 !== 0) return null;
            const target = relationshipNodes[i % relationshipNodes.length];
            return (
              <path 
                key={`k-r-${i}`}
                d={`M ${n.x} ${n.y} C ${n.x} ${n.y + 50}, ${target.x} ${target.y - 50}, ${target.x} ${target.y}`}
                stroke="var(--color-off-white)" strokeWidth="0.5" fill="none" opacity="0.1"
              />
            );
          })}
        </g>

        {/* STAGE 2: RELATIONSHIPS */}
        <g style={{ opacity: rOpacity, transition: t }}>
          <text x="0" y="290" className="font-sans text-xs tracking-[0.25em] fill-off-white uppercase font-bold">RELATIONSHIPS</text>
          <text x="0" y="315" className="font-sans text-[13px] fill-muted-white">connections form</text>
          <text x="0" y="335" className="font-sans text-[13px] fill-muted-white">between entities</text>

          {/* Highly interconnected web */}
          {relationshipNodes.map((n, i) => (
            <g key={`rn-${n.id}`}>
              <circle cx={n.x} cy={n.y} r="2.5" fill="var(--color-off-white)" opacity="0.6" />
              {relationshipNodes.map((target, j) => {
                if (i >= j) return null;
                const dist = Math.hypot(n.x - target.x, n.y - target.y);
                if (dist < 60) {
                  return (
                    <line key={`rr-${i}-${j}`} x1={n.x} y1={n.y} x2={target.x} y2={target.y} stroke="var(--color-off-white)" strokeWidth="0.5" opacity="0.2" />
                  );
                }
                return null;
              })}
            </g>
          ))}

          {/* Funnel down to reasoning */}
          {relationshipNodes.map((n, i) => {
            if (i % 2 !== 0) return null;
            const target = reasoningNodes[0];
            return (
              <path 
                key={`r-re-${i}`}
                d={`M ${n.x} ${n.y} C ${n.x} ${n.y + 50}, ${target.x} ${target.y - 40}, ${target.x} ${target.y}`}
                stroke="var(--color-bio-cyan)" strokeWidth="1" fill="none" opacity="0.2"
              />
            );
          })}
        </g>

        {/* STAGE 3: REASONING */}
        <g style={{ opacity: reOpacity, transition: t }}>
          <text x="0" y="500" className="font-sans text-xs tracking-[0.25em] fill-off-white uppercase font-bold">REASONING</text>
          <text x="0" y="525" className="font-sans text-[13px] fill-muted-white">a smaller coherent</text>
          <text x="0" y="545" className="font-sans text-[13px] fill-muted-white">pathway emerges</text>

          {/* Single coherent pathway */}
          {reasoningNodes.map((n, i) => {
            const next = reasoningNodes[i + 1];
            return (
              <g key={`re-${n.id}`}>
                <rect x={n.x - 3} y={n.y - 3} width="6" height="6" fill="var(--background)" stroke="var(--color-bio-cyan)" strokeWidth="1.5" />
                {next && (
                  <line x1={n.x} y1={n.y + 3} x2={next.x} y2={next.y - 3} stroke="var(--color-bio-cyan)" strokeWidth="2" opacity="0.8" />
                )}
              </g>
            );
          })}

          {/* Path down to discovery */}
          <line 
            x1={reasoningNodes[reasoningNodes.length - 1].x} 
            y1={reasoningNodes[reasoningNodes.length - 1].y + 3} 
            x2={discoveryNode.x} 
            y2={discoveryNode.y - 20} 
            stroke="url(#pathwayGrad)" strokeWidth="2" 
          />
        </g>

        {/* STAGE 4: DISCOVERY */}
        <g style={{ opacity: dOpacity, transition: t }}>
          <text x="0" y="710" className="font-sans text-xs tracking-[0.25em] fill-off-white uppercase font-bold text-bio-cyan">DISCOVERY</text>
          <text x="0" y="735" className="font-sans text-[13px] fill-muted-white">one precise</text>
          <text x="0" y="755" className="font-sans text-[13px] fill-muted-white">focal structure</text>

          <circle cx={discoveryNode.x} cy={discoveryNode.y} r="25" fill="var(--background)" stroke="var(--color-bio-cyan)" strokeWidth="2" />
          <circle cx={discoveryNode.x} cy={discoveryNode.y} r="12" fill="none" stroke="var(--color-bio-cyan)" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.8" />
          <circle cx={discoveryNode.x} cy={discoveryNode.y} r="4" fill="var(--color-off-white)" />
          
          {/* Output signals */}
          <line x1={discoveryNode.x + 25} y1={discoveryNode.y} x2={discoveryNode.x + 80} y2={discoveryNode.y} stroke="var(--color-bio-cyan)" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 4" />
          <line x1={discoveryNode.x + 18} y1={discoveryNode.y + 18} x2={discoveryNode.x + 55} y2={discoveryNode.y + 55} stroke="var(--color-bio-cyan)" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 4" />
          <line x1={discoveryNode.x + 18} y1={discoveryNode.y - 18} x2={discoveryNode.x + 55} y2={discoveryNode.y - 55} stroke="var(--color-bio-cyan)" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 4" />
        </g>
      </svg>
    </div>
  );
}
