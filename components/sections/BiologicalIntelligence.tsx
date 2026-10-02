"use client";

import React, { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { IntelligencePipeline } from "@/components/visuals/IntelligencePipeline";

export default function BiologicalIntelligence() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalScroll = rect.height;
      const currentScroll = windowHeight - rect.top;
      
      let p = currentScroll / totalScroll;
      p = Math.max(0, Math.min(1, p));
      
      setProgress(p);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section 
      id="research"
      ref={sectionRef}
      className="relative w-full bg-graphite py-12 md:py-16 overflow-hidden border-t border-soft-graphite/50 flex items-center"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center">
          
          {/* Content Left */}
          <div className="lg:col-span-5 relative z-20 py-12 lg:pr-12">
            <SectionLabel className="mb-6 text-muted-white">BIOLOGICAL INTELLIGENCE</SectionLabel>
            
            <h2 className="font-sans font-bold text-[clamp(2.5rem,5vw,4.5rem)] tracking-tight text-off-white leading-[1.05] mb-8">
              We build <br />
              intelligence <br />
              <span className="text-muted-white">for biology.</span>
            </h2>
            
            <p className="font-sans text-lg md:text-xl text-muted-white font-medium max-w-md leading-relaxed">
              BioForge connects biological knowledge, relationships, evidence, and reasoning into systems designed to explore the living world.
            </p>
          </div>
          
          {/* Visual System Right */}
          <div className="lg:col-span-7 relative z-10 w-full flex justify-center lg:justify-end">
            <IntelligencePipeline progress={progress} isVisible={progress > 0} />
          </div>
          
        </div>
      </Container>
    </section>
  );
}
