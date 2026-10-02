"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DisplayText } from "@/components/ui/DisplayText";
import { MetaText } from "@/components/ui/MetaText";

// 100% deterministic PRNG for hydration safety
// Uses a MurmurHash3-style integer mixer to guarantee uncorrelated float outputs from sequential seeds
const prng = (seed: number) => {
  let h = seed ^ 0x5deece66d;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

interface SpecimenNode {
  id: number;
  x: number;
  y: number;
  r: number;
  layer: number; // 0: background, 1: midground, 2: foreground for parallax
  connections: number[];
}

export default function BioforgeResearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // Relative to center [-1, 1]
  const [rawMousePos, setRawMousePos] = useState({ x: 0, y: 0 }); // Absolute px within container
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate raw pixels for the lens cursor
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    
    // Calculate normalized [-1, 1] for parallax math
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const normalizedX = (rawX - centerX) / centerX;
    const normalizedY = (rawY - centerY) / centerY;

    setRawMousePos({ x: rawX, y: rawY });
    setMousePos({ x: normalizedX, y: normalizedY });
  };

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  // Generate deterministic biological structure using fixed coordinate system
  const nodes = useMemo(() => {
    const arr: SpecimenNode[] = [];
    const numNodes = 150;
    
    // We will use a 1200x800 coordinate system
    for (let i = 0; i < numNodes; i++) {
      const x = Number((prng(i * 10) * 1200).toFixed(1)); 
      const y = Number((prng(i * 20) * 800).toFixed(1)); 
      const layer = Math.floor(prng(i * 30) * 3); // 0, 1, or 2
      const r = layer === 2 ? 6 : layer === 1 ? 4 : 2; // Much more visible radius
      
      arr.push({ id: i, x, y, r, layer, connections: [] });
    }
    
    // Connect nodes
    for (let i = 0; i < numNodes; i++) {
      const n1 = arr[i];
      for (let j = i + 1; j < numNodes; j++) {
        const n2 = arr[j];
        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
        
        // Within 150px
        if (dist < 150 && Math.abs(n1.layer - n2.layer) <= 1 && prng(i * j) > 0.4) {
          n1.connections.push(j);
        }
      }
      n1.connections = n1.connections.slice(0, 4);
    }
    return arr;
  }, []);

  // Parallax multipliers per layer
  const parallaxX = prefersReducedMotion ? 0 : (isHovered ? mousePos.x : 0);
  const parallaxY = prefersReducedMotion ? 0 : (isHovered ? mousePos.y : 0);
  
  const layerMultipliers = [
    { x: -10, y: -10 },   // Background moves opposite
    { x: 20, y: 20 },   // Midground moves slightly with cursor
    { x: 50, y: 50 },   // Foreground moves most with cursor
  ];

  return (
    <section id="research" className="relative w-full bg-background py-16 md:py-32 overflow-hidden border-t border-soft-graphite/50">
      <Container>
        <div className="mb-12 md:mb-20">
          <SectionLabel className="mb-6 text-muted-white">RESEARCH / BIOLOGICAL ARTIFACTS</SectionLabel>
          <DisplayText as="h2" className="text-4xl md:text-5xl lg:text-6xl text-off-white">
            WHAT THE ENGINE<br />
            <span className="text-muted-white">CAN REVEAL.</span>
          </DisplayText>
        </div>

        {/* The Research Artifact Specimen */}
        <div 
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          className="relative w-full h-[500px] md:h-[600px] bg-[#0A0C0D] border border-soft-graphite/40 rounded-sm overflow-hidden group cursor-none"
        >
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'radial-gradient(var(--color-muted-white) 1px, transparent 1px)',
            backgroundSize: '40px 40px' 
          }} />

          {/* Biological Visualization Layers */}
          <div className="absolute inset-[-10%] w-[120%] h-[120%] pointer-events-none">
            <svg 
              viewBox="0 0 1200 800" 
              className="w-full h-full overflow-visible pointer-events-none"
              preserveAspectRatio="xMidYMid slice"
            >
              
              {/* Draw Connections */}
              {nodes.map(n => 
                n.connections.map(targetId => {
                  const target = nodes[targetId];
                  // Use the average layer for parallax movement of the line
                  const avgLayer = Math.round((n.layer + target.layer) / 2);
                  const mx = layerMultipliers[avgLayer].x * parallaxX;
                  const my = layerMultipliers[avgLayer].y * parallaxY;
                  
                  return (
                    <g 
                      key={`conn-${n.id}-${targetId}`}
                      style={{ 
                        transform: `translate(${mx}px, ${my}px)`,
                        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      <line
                        x1={n.x} y1={n.y}
                        x2={target.x} y2={target.y}
                        stroke={avgLayer === 2 ? "var(--color-bio-cyan)" : "var(--color-muted-white)"}
                        strokeWidth={avgLayer === 2 ? 1.5 : 0.5}
                        style={{ opacity: avgLayer === 2 ? 0.5 : 0.2 }}
                      />
                    </g>
                  );
                })
              )}

              {/* Draw Nodes */}
              {nodes.map(n => {
                const mx = layerMultipliers[n.layer].x * parallaxX;
                const my = layerMultipliers[n.layer].y * parallaxY;
                const fill = n.layer === 2 ? "var(--color-bio-cyan)" : "var(--color-muted-white)";
                const opacity = n.layer === 2 ? 0.9 : (n.layer === 1 ? 0.6 : 0.3);

                return (
                  <g
                    key={`node-${n.id}`}
                    style={{ 
                      transform: `translate(${mx}px, ${my}px)`,
                      transition: isHovered ? 'transform 0.1s ease-out' : 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <circle cx={n.x} cy={n.y} r={n.r} fill={fill} style={{ opacity }} />
                    {/* Add a subtle glow ring to the foreground nodes */}
                    {n.layer === 2 && (
                       <circle cx={n.x} cy={n.y} r={n.r * 3} fill="none" stroke="var(--color-bio-cyan)" strokeWidth="1" opacity="0.3" />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Optical Instrument Lens / Cursor */}
          <div 
            className="absolute top-0 left-0 pointer-events-none z-50 flex items-center justify-center transition-opacity duration-300"
            style={{ 
              transform: `translate(${rawMousePos.x - 60}px, ${rawMousePos.y - 60}px)`,
              opacity: isHovered ? 1 : 0,
              width: '120px',
              height: '120px'
            }}
          >
            {/* Outer Lens Ring */}
            <div className="absolute inset-0 rounded-full border border-bio-cyan/40 bg-bio-cyan/5 backdrop-blur-[1px]" />
            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-bio-cyan/30" />
            <div className="absolute h-full w-[1px] bg-bio-cyan/30" />
            {/* Center Focus Point */}
            <div className="absolute w-[4px] h-[4px] rounded-full bg-bio-cyan" />
            {/* Technical tick marks */}
            <div className="absolute top-0 w-[2px] h-[6px] bg-bio-cyan/60" />
            <div className="absolute bottom-0 w-[2px] h-[6px] bg-bio-cyan/60" />
            <div className="absolute left-0 h-[2px] w-[6px] bg-bio-cyan/60" />
            <div className="absolute right-0 h-[2px] w-[6px] bg-bio-cyan/60" />
          </div>

          {/* Overlay Editorial Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 pointer-events-none flex flex-col md:flex-row md:items-end justify-between gap-8 bg-gradient-to-t from-background via-background/80 to-transparent">
            <div className="max-w-md">
              <h3 className="font-sans font-bold text-2xl md:text-3xl text-off-white mb-3">
                PROTEIN INTELLIGENCE
              </h3>
              <p className="font-sans text-muted-white leading-relaxed">
                Understanding structure, function, and relationships across biological systems.
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-1">
              <MetaText className="text-bio-cyan">BIOFORGE LAB</MetaText>
              <MetaText>RESEARCH SYSTEM / 2026</MetaText>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
