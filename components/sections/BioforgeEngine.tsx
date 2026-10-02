"use client";

import React, { useEffect, useRef, useState } from "react";
import { EngineCore } from "@/components/visuals/EngineCore";

const STAGES = [
  {
    title: "DATA",
    desc: "Unstructured biological information, raw observation, and sequencing across scales."
  },
  {
    title: "UNDERSTANDING",
    desc: "Mapping raw data into coherent semantic spaces and structural embeddings."
  },
  {
    title: "RELATIONSHIPS",
    desc: "Forming the web of interactions between molecules, pathways, and systems."
  },
  {
    title: "REASONING",
    desc: "Applying intelligence to navigate the graph and simulate biological outcomes."
  },
  {
    title: "DISCOVERY",
    desc: "The emergence of novel insights, validated targets, and frontier knowledge."
  }
];

export default function BioforgeEngine() {
  const containerRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalScroll = rect.height - windowHeight;
      const currentScroll = -rect.top;
      
      if (totalScroll <= 0) return;
      
      let p = currentScroll / totalScroll;
      p = Math.max(0, Math.min(1, p));
      setProgress(p);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stageIndex = Math.min(4, Math.floor(progress * 5));

  return (
    <section id="engine" ref={containerRef} className="relative w-full h-[250vh] bg-background border-t border-soft-graphite/50">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-between p-8 md:p-16 lg:px-24">
        
        {/* Full Viewport Background Visual System */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
           <EngineCore stageIndex={stageIndex} />
        </div>
        
        {/* Top Editorial Layer */}
        <div className="relative z-10 max-w-2xl pt-8 md:pt-12">
           <span className="font-mono text-xs tracking-widest text-muted-white uppercase mb-6 block">
             BioForge Engine
           </span>
           <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-7xl text-off-white mb-6 tracking-tight leading-[1.05]">
             THE ENGINE<br className="hidden md:block" /> OF DISCOVERY.
           </h2>
           <p className="font-sans text-muted-white text-lg md:text-xl max-w-lg leading-relaxed">
             We turn biological information into relationships, relationships into reasoning, and reasoning into new possibilities.
           </p>
        </div>
        
        {/* Bottom Instrument Readout Layer */}
        <div className="relative z-10 max-w-md mt-auto pb-8 md:pb-12 border-l border-bio-cyan pl-6">
           {STAGES.map((stage, i) => {
             const isActive = i === stageIndex;
             let opacity = isActive ? 1 : 0;
             let transform = prefersReducedMotion ? 'none' : (isActive ? 'translateY(0)' : (i < stageIndex ? 'translateY(-10px)' : 'translateY(10px)'));
             
             return (
               <div 
                 key={stage.title}
                 className="absolute bottom-8 md:bottom-12 left-6 right-0 transition-all duration-700 ease-out flex flex-col justify-end"
                 style={{ opacity, transform, pointerEvents: isActive ? 'auto' : 'none' }}
               >
                 <span className="font-mono text-bio-cyan text-sm tracking-[0.2em] mb-3 font-semibold uppercase">
                   0{i + 1} / {stage.title}
                 </span>
                 <p className="text-off-white text-lg md:text-xl font-sans leading-relaxed">
                   {stage.desc}
                 </p>
               </div>
             )
           })}
           {/* Invisible spacer to reserve physical height for the absolutely positioned text */}
           <div className="invisible pointer-events-none">
             <span className="font-mono text-sm tracking-[0.2em] mb-3 block">00 / PLACEHOLDER</span>
             <p className="text-lg md:text-xl font-sans leading-relaxed">
               Three lines of description text to ensure enough height is reserved for the absolutely positioned instrument readouts.
             </p>
           </div>
        </div>

      </div>
    </section>
  )
}
