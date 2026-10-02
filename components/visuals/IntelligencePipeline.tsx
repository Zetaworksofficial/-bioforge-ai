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

  const kOpacity = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, (progress - 0.1) * 5));
  const rOpacity = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, (progress - 0.3) * 5));
  const reOpacity = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, (progress - 0.5) * 5));
  const dOpacity = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, (progress - 0.7) * 5));

  // Generate deterministic scattered nodes for Knowledge
  // x: 0 to 250, y: 100 to 500
  const knowledgeNodes = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < 35; i++) {
      const seed = i + 1;
      const x = Number((0 + (prng(seed) * 250)).toFixed(1));
      const y = Number((100 + (prng(seed + 100) * 400)).toFixed(1));
      nodes.push({ id: i, x, y });
    }
    return nodes;
  }, []);

  // Generate relationships between Knowledge nodes and the reasoning structure
  const relationshipLines = useMemo(() => {
    return knowledgeNodes.map((n, i) => {
      // Funneling into structured parallel lines at x=600, y=200 to 400
      const targetY = 200 + ((i % 5) * 50); 
      return {
        id: i,
        x1: n.x,
        y1: n.y,
        x2: 600,
        y2: targetY,
        ctrlX: Number((350 + (i % 3) * 80).toFixed(1)),
        ctrlY: Number((n.y + (i % 2 === 0 ? 80 : -80)).toFixed(1))
      };
    });
  }, [knowledgeNodes]);

  // Generate structured reasoning lines
  // x: 600 to 1100, y: 200 to 400
  const reasoningLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 5; i++) {
      const y = 200 + (i * 50);
      lines.push({ id: i, y });
    }
    return lines;
  }, []);

  return (
    <div className="w-full relative h-[450px] md:h-[650px] lg:h-[800px] flex items-center justify-start pointer-events-none">
      <svg
        viewBox="0 0 1400 600"
        className="w-full h-full overflow-visible transform scale-110 md:scale-125 lg:scale-[1.6] origin-left"
        preserveAspectRatio="xMinYMid meet"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-off-white)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="var(--color-bio-cyan)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-bio-cyan)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="reasoningGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-bio-cyan)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-off-white)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* STAGE 1: KNOWLEDGE */}
        <g style={{ opacity: kOpacity, transition: "opacity 0.4s ease-out" }}>
          <text x="0" y="50" className="font-sans text-sm tracking-[0.25em] fill-muted-white uppercase font-bold">
            Knowledge
          </text>
          {knowledgeNodes.map((n) => (
            <circle key={`kn-${n.id}`} cx={n.x} cy={n.y} r="3" fill="var(--color-muted-white)" opacity="0.6" />
          ))}
        </g>

        {/* STAGE 2: RELATIONSHIPS */}
        <g style={{ opacity: rOpacity, transition: "opacity 0.4s ease-out" }}>
          <text x="400" y="50" className="font-sans text-sm tracking-[0.25em] fill-muted-white uppercase font-bold">
            Relationships
          </text>
          {relationshipLines.map((l) => (
            <path
              key={`rl-${l.id}`}
              d={`M ${l.x1} ${l.y1} Q ${l.ctrlX} ${l.ctrlY} ${l.x2} ${l.y2}`}
              stroke="var(--color-off-white)"
              strokeWidth="1"
              fill="none"
              opacity="0.15"
            />
          ))}
          {/* Intersection nodes at the relationship funnel */}
          {reasoningLines.map(l => (
            <circle key={`rn-start-${l.id}`} cx="600" cy={l.y} r="3" fill="var(--color-bio-cyan)" opacity="0.8" />
          ))}
        </g>

        {/* STAGE 3: REASONING */}
        <g style={{ opacity: reOpacity, transition: "opacity 0.4s ease-out" }}>
          <text x="800" y="50" className="font-sans text-sm tracking-[0.25em] fill-muted-white uppercase font-bold">
            Reasoning
          </text>
          {reasoningLines.map((l) => (
            <line
              key={`rea-${l.id}`}
              x1="600"
              y1={l.y}
              x2="1100"
              y2={l.y}
              stroke="url(#reasoningGrad)"
              strokeWidth="2"
            />
          ))}
          {/* Geometric structuring nodes along the reasoning path */}
          {reasoningLines.map(l => (
            <rect key={`rea-box-${l.id}`} x="850" y={l.y - 4} width="8" height="8" fill="var(--background)" stroke="var(--color-bio-cyan)" strokeWidth="1.5" />
          ))}
        </g>

        {/* STAGE 4: DISCOVERY */}
        <g style={{ opacity: dOpacity, transition: "opacity 0.4s ease-out" }}>
          <text x="1150" y="50" className="font-sans text-sm tracking-[0.25em] fill-off-white uppercase font-bold">
            Discovery
          </text>
          {/* The converging endpoint funneling into the core */}
          <path
            d="M 1100 200 L 1200 260 L 1200 340 L 1100 400"
            stroke="var(--color-off-white)"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          {/* Core discovery node */}
          <circle cx="1200" cy="300" r="36" fill="var(--background)" stroke="var(--color-bio-cyan)" strokeWidth="2" />
          <circle cx="1200" cy="300" r="20" fill="none" stroke="var(--color-bio-cyan)" strokeWidth="1.5" opacity="0.6" strokeDasharray="3 6" />
          <circle cx="1200" cy="300" r="6" fill="var(--color-off-white)" />
          
          {/* Outward signals from discovery */}
          <line x1="1240" y1="300" x2="1350" y2="300" stroke="var(--color-off-white)" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 6" />
          <line x1="1228" y1="272" x2="1320" y2="200" stroke="var(--color-off-white)" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 6" />
          <line x1="1228" y1="328" x2="1320" y2="400" stroke="var(--color-off-white)" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 6" />
        </g>
      </svg>
    </div>
  );
}
