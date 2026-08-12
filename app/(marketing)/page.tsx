import { TopNav } from "@/components/ui/TopNav";
import { Footer } from "@/components/ui/Footer";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Plans } from "@/components/marketing/Plans";
import { Testimonials } from "@/components/marketing/Testimonials";

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main>
        <Hero />
        <HowItWorks />
        <Plans />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
