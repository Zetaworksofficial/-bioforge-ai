"use client";

import React, { useEffect, useState, useMemo } from "react";

// 100% deterministic LCG PRNG for hydration safety
const prng = (seed: number) => {
  let state = (seed ^ 0x5deece66d) & 0x7fffffff;
  state = (state * 48271) % 2147483647;
  return state / 2147483647;
};

interface NodeData {
  id: number;
  dataX: number;
  dataY: number;
  trackX: number;
  trackY: number;
  isReasoningPath: boolean;
  connections: number[];
}

export function EngineCore({ stageIndex }: { stageIndex: number }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const nodes = useMemo(() => {
    const arr: NodeData[] = [];
    const numNodes = 350; 
    
    for (let i = 0; i < numNodes; i++) {
      // DATA stage: completely scattered across the 1600x900 viewport
      const dataX = Number((50 + prng(i + 1) * 1500).toFixed(1));
      const dataY = Number((50 + prng(i + 100) * 800).toFixed(1));
      
      let trackX, trackY;
      let isReasoningPath = false;

      if (i < 7) {
        // ONE distinct, clean reasoning path curving inward to the center
        isReasoningPath = true;
        const radius = 640 - (i * 90); // 640, 550, 460... down to ~100
        const angle = Math.PI - 0.2 - (i * 0.18); // Left side, curving up slightly
        trackX = Number((1050 + Math.cos(angle) * radius).toFixed(1));
        trackY = Number((450 + Math.sin(angle) * radius).toFixed(1));
      } else {
        // UNDERSTANDING stage: mapped to concentric semantic rings
        const trackLevel = i % 5; 
        const trackRadius = 80 + (trackLevel * 140); 
        const angle = prng(i + 200) * Math.PI * 2;
        
        trackX = Number((1050 + Math.cos(angle) * trackRadius).toFixed(1));
        trackY = Number((450 + Math.sin(angle) * trackRadius).toFixed(1));
      }

      arr.push({ id: i, dataX, dataY, trackX, trackY, isReasoningPath, connections: [] });
    }
    
    // Generate relationships
    for (let i = 0; i < numNodes; i++) {
      const n1 = arr[i];

      if (n1.isReasoningPath) {
        if (i < 6) n1.connections.push(i + 1); // Strictly sequential
        continue;
      }

      for (let j = i + 1; j < numNodes; j++) {
        const n2 = arr[j];
        if (n2.isReasoningPath) continue; // Keep background noise away from the focal path
        
        const dist = Math.hypot(n1.trackX - n2.trackX, n1.trackY - n2.trackY);
        // Connect if close, but far fewer connections than before
        if (dist < 120 && prng(i * j) > 0.75) {
          n1.connections.push(j);
        }
      }
      n1.connections = n1.connections.slice(0, 2); // Extremely limited clustering to prevent wire-tangles
    }
    return arr;
  }, []);

  const t = prefersReducedMotion 
    ? "none" 
    : "transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 1s ease-out, stroke 1s ease-out, stroke-width 1s ease-out, fill 1s ease-out";

  return (
    <svg viewBox="0 0 1600 900" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      
      {/* TRACK RINGS */}
      {[80, 220, 360, 500, 640].map((r, i) => (
        <circle 
          key={`guide-${r}`} 
          cx="1050" cy="450" r={r} 
          fill="none" 
          stroke="var(--color-muted-white)" 
          strokeWidth="0.5" 
          strokeDasharray="4 8"
          style={{ 
            opacity: stageIndex >= 1 ? 0.15 + (i * 0.05) : 0.03, 
            transition: t 
          }} 
        />
      ))}
      
      {/* CONNECTIONS (RELATIONSHIPS & REASONING) */}
      {nodes.map(n => 
        n.connections.map(targetId => {
          const target = nodes[targetId];
          const isReasoningConn = n.isReasoningPath && target.isReasoningPath;
          
          let opacity = 0;
          let stroke = "var(--color-muted-white)";
          let width = "0.5";
          
          if (stageIndex === 2) {
             opacity = isReasoningConn ? 0.2 : 0.15;
          }
          if (stageIndex >= 3) {
             if (isReasoningConn) {
               opacity = 0.9;
               stroke = "var(--color-bio-cyan)";
               width = "2";
             } else {
               opacity = 0.03; // Background fades away almost entirely
             }
          }
          if (stageIndex === 4) {
             opacity = isReasoningConn ? 0.3 : 0.01;
          }

          // Generate a smooth curve for spatial separation
          const cx = (n.trackX + target.trackX) / 2 - (n.trackY - target.trackY) * 0.15;
          const cy = (n.trackY + target.trackY) / 2 + (n.trackX - target.trackX) * 0.15;
          const d = `M ${n.trackX} ${n.trackY} Q ${cx} ${cy} ${target.trackX} ${target.trackY}`;

          return (
            <path
              key={`conn-${n.id}-${targetId}`}
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth={width}
              style={{ opacity, transition: t }}
            />
          )
        })
      )}

      {/* DISCOVERY FINAL PATH */}
      {nodes[6] && (
        <path
          d={`M ${nodes[6].trackX} ${nodes[6].trackY} L 1050 450`}
          stroke="var(--color-bio-cyan)"
          strokeWidth="2"
          style={{ 
            opacity: stageIndex === 4 ? 0.9 : 0, 
            transition: t 
          }}
        />
      )}

      {/* NODES */}
      {nodes.map(n => {
        const x = stageIndex === 0 ? n.dataX : n.trackX;
        const y = stageIndex === 0 ? n.dataY : n.trackY;
        
        let fill = "var(--color-muted-white)";
        let opacity = stageIndex === 0 ? 0.8 : 0.6;
        let r = stageIndex === 0 ? "3" : "1.5"; // Smaller background nodes
        
        if (stageIndex >= 3) {
          if (n.isReasoningPath) {
            fill = "var(--color-bio-cyan)";
            opacity = 1;
            r = "4";
          } else {
            opacity = 0.1;
          }
        }

        return (
          <g 
            key={`node-${n.id}`} 
            style={{ 
              transform: `translate(${x}px, ${y}px)`, 
              transition: t 
            }}
          >
            <circle cx="0" cy="0" r={r} fill={fill} style={{ opacity, transition: t }} />
          </g>
        )
      })}
      
      {/* DISCOVERY CORE */}
      <g style={{ 
         transform: 'translate(1050px, 450px)',
         opacity: stageIndex === 4 ? 1 : 0,
         transition: t
      }}>
         <circle r="60" fill="var(--background)" stroke="var(--color-bio-cyan)" strokeWidth="1.5" />
         <circle r="30" fill="none" stroke="var(--color-bio-cyan)" strokeWidth="1" strokeDasharray="3 6" opacity="0.8" />
         <circle r="6" fill="var(--color-off-white)" />
      </g>
    </svg>
  );
}
