import React from "react";
import Link from 'next/link';
import { LivingMolecularField } from "@/components/visuals/LivingMolecularField";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MetaText } from "@/components/ui/MetaText";

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden pt-20 pb-24 md:pb-0">
      <LivingMolecularField />
      
      <Container className="relative z-10 w-full mt-12 md:mt-0">
        <div className="max-w-[85rem]">
          <SectionLabel className="mb-6 md:mb-8 text-bio-cyan/80">
            BIOLOGICAL INTELLIGENCE SYSTEMS
          </SectionLabel>

          <h1 className="font-sans font-bold text-[clamp(3rem,8vw,8.5rem)] leading-[0.95] tracking-tighter text-off-white mb-8">
            Intelligence for the<br />
            <span className="text-muted-white">biological frontier.</span>
          </h1>

          <p className="font-sans text-xl md:text-2xl text-off-white font-medium tracking-wide mb-10">
            Understand. Explore. Discover.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Link href="#engine" tabIndex={-1}>
              <Button variant="primary" className="w-full sm:w-auto">ENTER FORGE</Button>
            </Link>
            <Link href="#research" tabIndex={-1}>
              <Button variant="secondary" className="w-full sm:w-auto">EXPLORE RESEARCH</Button>
            </Link>
          </div>
        </div>
      </Container>
      
      {/* Small anchor metadata at the bottom of the viewport */}
      <div className="absolute bottom-8 left-0 right-0 hidden md:block z-10 pointer-events-none">
        <Container className="flex justify-between items-center">
          <MetaText>SYSTEM STATUS: NOMINAL</MetaText>
          <MetaText>BIOFORGE / 01</MetaText>
        </Container>
      </div>
    </section>
  );
}
