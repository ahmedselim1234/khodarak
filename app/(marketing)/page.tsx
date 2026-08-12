import { TopNav } from "@/components/ui/TopNav";
import { Footer } from "@/components/ui/Footer";
import { Hero } from "@/components/marketing/Hero";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { CategoryShowcase } from "@/components/marketing/CategoryShowcase";
import { FeaturedProducts } from "@/components/marketing/FeaturedProducts";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { WhyKhodarak } from "@/components/marketing/WhyKhodarak";
import { Plans } from "@/components/marketing/Plans";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { queryHomeProducts } from "@/lib/products/queryHomeProducts";

// The home page used to be four static marketing blocks with no product
// anywhere on it — a visitor arriving from an ad had to take it on faith that
// a catalog existed. The catalog read goes through the cached anonymous
// client (lib/supabase/publicCatalog.ts), so adding it costs one query per
// revalidation window, not one per visitor.
export default async function HomePage() {
  const products = await queryHomeProducts(8);

  return (
    <>
      <TopNav />
      <main>
        <Hero showcase={products} />
        <TrustStrip />
        <CategoryShowcase products={products} />
        <FeaturedProducts products={products} />
        <HowItWorks />
        <WhyKhodarak />
        <Plans />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
