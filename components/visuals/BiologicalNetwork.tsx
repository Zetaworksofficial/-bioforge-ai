"use client";

import React, { useEffect, useState, useMemo } from "react";

interface NodeData {
  id: string;
  x: number;
  y: number;
  label?: string;
  type: "primary" | "secondary";
  driftX: number;
  driftY: number;
  duration: number;
}

interface ConnData {
  from: string;
  to: string;
  type: "main" | "sub";
  ctrlX?: number; // bezier control points for organic curves
  ctrlY?: number;
}

// Fixed positions for primary to ensure good layout
const PRIMARY_NODES: Omit<NodeData, "driftX" | "driftY" | "duration">[] = [
  { id: "dna", label: "DNA", x: 150, y: 150, type: "primary" },
  { id: "rna", label: "RNA", x: 380, y: 80, type: "primary" },
  { id: "genes", label: "GENES", x: 220, y: 350, type: "primary" },
  { id: "proteins", label: "PROTEINS", x: 620, y: 160, type: "primary" },
  { id: "molecules", label: "MOLECULES", x: 480, y: 400, type: "primary" },
  { id: "pathways", label: "PATHWAYS", x: 820, y: 280, type: "primary" },
  { id: "cells", label: "CELLS", x: 720, y: 500, type: "primary" },
  { id: "signals", label: "SIGNALS", x: 920, y: 120, type: "primary" },
];

const SECONDARY_POSITIONS = [
  { x: 250, y: 180 }, { x: 300, y: 280 }, { x: 450, y: 200 },
  { x: 550, y: 100 }, { x: 750, y: 200 }, { x: 880, y: 380 },
  { x: 650, y: 320 }, { x: 350, y: 480 }, { x: 180, y: 480 },
  { x: 580, y: 520 }, { x: 100, y: 280 }, { x: 850, y: 500 },
  { x: 400, y: 300 }, { x: 700, y: 80 }, { x: 550, y: 280 },
];

// 100% deterministic LCG pseudo-random number generator to prevent cross-platform Math.sin hydration mismatches
const prng = (seed: number) => {
  let state = (seed ^ 0x5deece66d) & 0x7fffffff;
  state = (state * 48271) % 2147483647;
  return state / 2147483647;
};

export function BiologicalNetwork({ progress, isVisible }: { progress: number; isVisible: boolean }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const nodes = useMemo<NodeData[]>(() => {
    const all = [...PRIMARY_NODES];
    SECONDARY_POSITIONS.forEach((pos, i) => {
      all.push({
        id: `sec-${i}`,
        x: pos.x,
        y: pos.y,
        type: "secondary",
      });
    });

    return all.map((n, i) => ({
      ...n,
      // Deterministic drift values for CSS animation
      driftX: Number(((prng(i + 1) - 0.5) * 30).toFixed(1)),
      driftY: Number(((prng(i + 2) - 0.5) * 30).toFixed(1)),
      duration: Math.floor(prng(i + 3) * 5000 + 10000),
    }));
  }, []);

  const connections = useMemo<ConnData[]>(() => {
    // Manually define organic connections
    const conns: ConnData[] = [
      { from: "dna", to: "rna", type: "main", ctrlX: 250, ctrlY: 80 },
      { from: "dna", to: "genes", type: "main", ctrlX: 150, ctrlY: 250 },
      { from: "rna", to: "proteins", type: "main", ctrlX: 500, ctrlY: 100 },
      { from: "genes", to: "molecules", type: "main", ctrlX: 350, ctrlY: 400 },
      { from: "proteins", to: "pathways", type: "main", ctrlX: 750, ctrlY: 200 },
      { from: "molecules", to: "cells", type: "main", ctrlX: 600, ctrlY: 480 },
      { from: "pathways", to: "cells", type: "main", ctrlX: 800, ctrlY: 400 },
      { from: "cells", to: "signals", type: "main", ctrlX: 850, ctrlY: 300 },
      { from: "rna", to: "signals", type: "main", ctrlX: 650, ctrlY: 50 },
      { from: "proteins", to: "molecules", type: "main", ctrlX: 550, ctrlY: 280 },
    ];

    // Add secondary connections
    nodes.filter(n => n.type === "secondary").forEach((sec, i) => {
      // Connect to 2 nearest neighbors
      const nearest = [...nodes]
        .filter(n => n.id !== sec.id)
        .sort((a, b) => {
          const distA = Math.hypot(a.x - sec.x, a.y - sec.y);
          const distB = Math.hypot(b.x - sec.x, b.y - sec.y);
          return distA - distB;
        })
        .slice(0, 2);
        
      nearest.forEach((near, j) => {
        const seed = i * 10 + j + 1;
        conns.push({
          from: sec.id,
          to: near.id,
          type: "sub",
          ctrlX: Number(((sec.x + near.x) / 2 + (prng(seed) - 0.5) * 50).toFixed(1)),
          ctrlY: Number(((sec.y + near.y) / 2 + (prng(seed + 1) - 0.5) * 50).toFixed(1)),
        });
      });
    });

    return conns;
  }, [nodes]);

  const shouldAnimate = !prefersReducedMotion;
  
  // Progress scaling (0 to 1) for reveals
  // Early (0 - 0.3): Primary nodes
  // Middle (0.3 - 0.6): Main connections + secondary nodes
  // Late (0.6 - 0.9): Secondary connections
  const primaryOpacity = Math.min(1, Math.max(0, progress * 4)); // Fully visible by 0.25
  const mainConnOpacity = Math.min(1, Math.max(0, (progress - 0.2) * 3)); // 0.2 to 0.53
  const secondaryNodeOpacity = Math.min(1, Math.max(0, (progress - 0.4) * 3)); // 0.4 to 0.73
  const subConnOpacity = Math.min(1, Math.max(0, (progress - 0.6) * 3)); // 0.6 to 0.93

  return (
    <div className="w-full relative h-[500px] md:h-[700px] flex items-center justify-center pointer-events-none">
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full max-w-[1100px] overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <style>
            {`
              @keyframes drift {
                0% { transform: translate(0px, 0px); }
                50% { transform: translate(var(--dx), var(--dy)); }
                100% { transform: translate(0px, 0px); }
              }
              .node-anim {
                animation: drift var(--dur) ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        {/* Draw Connections */}
        {connections.map((conn) => {
          const fromNode = nodes.find((n) => n.id === conn.from)!;
          const toNode = nodes.find((n) => n.id === conn.to)!;
          const isMain = conn.type === "main";
          
          const opacity = isMain ? (mainConnOpacity * 0.3) : (subConnOpacity * 0.1);
          
          return (
            <path
              key={`${conn.from}-${conn.to}`}
              d={`M ${fromNode.x} ${fromNode.y} Q ${conn.ctrlX} ${conn.ctrlY} ${toNode.x} ${toNode.y}`}
              stroke={isMain ? "var(--color-bio-cyan)" : "var(--color-off-white)"}
              strokeWidth={isMain ? "1.5" : "0.5"}
              fill="none"
              style={{
                opacity: prefersReducedMotion ? (isMain ? 0.3 : 0.1) : opacity,
                transition: "opacity 0.3s ease-out",
              }}
            />
          );
        })}

        {/* Draw Nodes */}
        {nodes.map((node) => {
          const isPrimary = node.type === "primary";
          const opacity = isPrimary ? primaryOpacity : (secondaryNodeOpacity * 0.6);
          
          // CSS vars for drift
          const animStyle = shouldAnimate ? {
            "--dx": `${node.driftX}px`,
            "--dy": `${node.driftY}px`,
            "--dur": `${node.duration}ms`,
          } as React.CSSProperties : {};

          return (
            <g
              key={node.id}
              className={shouldAnimate ? "node-anim" : ""}
              style={{
                opacity: prefersReducedMotion ? (isPrimary ? 1 : 0.6) : opacity,
                transition: "opacity 0.3s ease-out",
                ...animStyle
              }}
            >
              {isPrimary ? (
                <>
                  <circle cx={node.x} cy={node.y} r="4" fill="var(--color-bio-cyan)" opacity="0.9" />
                  <circle cx={node.x} cy={node.y} r="12" fill="var(--color-bio-cyan)" opacity="0.15" />
                  <text
                    x={node.x + 16}
                    y={node.y + 4}
                    className="font-sans text-sm tracking-widest fill-off-white uppercase font-bold"
                    style={{ textShadow: "0px 2px 10px rgba(5,5,5,0.8)" }}
                  >
                    {node.label}
                  </text>
                </>
              ) : (
                <>
                  <circle cx={node.x} cy={node.y} r="2" fill="var(--color-muted-white)" opacity="0.5" />
                  <circle cx={node.x} cy={node.y} r="6" fill="var(--color-muted-white)" opacity="0.1" />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
