import BioforgeNav from "@/components/navigation/BioforgeNav";
import Hero from "@/components/sections/Hero";
import BiologicalComplexity from "@/components/sections/BiologicalComplexity";
import BiologicalIntelligence from "@/components/sections/BiologicalIntelligence";
import BioforgeResearch from "@/components/sections/BioforgeResearch";
import BioforgeEngine from "@/components/sections/BioforgeEngine";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen relative bg-background">
      <BioforgeNav />
      <Hero />
      <BiologicalComplexity />
      <BiologicalIntelligence />
      <BioforgeResearch />
      <BioforgeEngine />
    </main>
  );
}
