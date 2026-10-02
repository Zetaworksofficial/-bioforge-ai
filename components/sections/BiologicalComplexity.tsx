"use client";

import React, { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DisplayText } from "@/components/ui/DisplayText";
import { BiologicalNetwork } from "@/components/visuals/BiologicalNetwork";

export default function BiologicalComplexity() {
  const sectionRef = useRef<HTMLElement>(null);
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
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress: 0 when top of section enters viewport from bottom
      // 1 when bottom of section hits the bottom of the viewport
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

  // Header fades in early
  const headerOpacity = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, progress * 4));
  
  // Network fades out late (after 0.8) to resolve into the final statement
  const networkFadeOut = Math.min(1, Math.max(0, (progress - 0.75) * 4));
  const networkContainerOpacity = prefersReducedMotion ? 1 : 1 - (networkFadeOut * 0.85); // Fade to 15% opacity

  // Final statement fades in very late
  const footerOpacity = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, (progress - 0.75) * 4));

  return (
    <section 
      id="about"
      ref={sectionRef}
      className="relative w-full bg-background py-16 md:py-24 overflow-hidden border-t border-soft-graphite/50"
    >
      <Container>
        {/* Top: technical label and large statement */}
        <div className="max-w-4xl relative z-20">
          <div 
            style={{ 
              opacity: headerOpacity,
              transform: prefersReducedMotion ? 'none' : `translateY(${(1 - headerOpacity) * 20}px)`
            }}
          >
            <SectionLabel className="text-muted-white">BIOLOGICAL COMPLEXITY</SectionLabel>
            
            <h2 className="mt-6 font-sans font-bold text-[clamp(2.5rem,5vw,4.5rem)] tracking-tight text-off-white leading-[1.05]">
              Biology is one of the world's most <span className="text-muted-white">complex information systems.</span>
            </h2>
          </div>
        </div>

        {/* Middle: biological concepts network */}
        <div 
          className="mt-8 md:mt-12 mb-8 md:mb-12 w-full relative z-10"
          style={{ opacity: networkContainerOpacity }}
        >
          {/* 
            BiologicalNetwork uses the absolute progress to progressively
            draw the nodes and lines, making it feel like it's emerging 
            as the user scrolls down.
          */}
          <BiologicalNetwork progress={progress} isVisible={progress > 0} />
        </div>

        {/* End: concluding statement */}
        <div className="flex justify-start md:justify-end relative z-20 mt-12">
          <div 
            className="max-w-4xl md:text-right"
            style={{ 
              opacity: footerOpacity,
              transform: prefersReducedMotion ? 'none' : `translateY(${(1 - footerOpacity) * 30}px)`
            }}
          >
            <DisplayText as="h3" className="text-[clamp(3rem,7vw,6.5rem)]">
              INTELLIGENCE CAN <br className="hidden md:block" />
              <span className="text-muted-white">CONNECT IT.</span>
            </DisplayText>
          </div>
        </div>
      </Container>
    </section>
  );
}
