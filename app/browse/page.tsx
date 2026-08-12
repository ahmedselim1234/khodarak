import { TopNav } from "@/components/ui/TopNav";
import { Footer } from "@/components/ui/Footer";
import { Container } from "@/components/ui/Container";
import { CategoryTabs } from "@/components/catalog/CategoryTabs";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { SortBar } from "@/components/catalog/SortBar";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Pagination } from "@/components/catalog/Pagination";
import { parseCatalogSearchParams, queryProducts } from "@/lib/products/queryProducts";
import type { CatalogSearchParams } from "@/lib/products/queryProducts";

// /browse — Server Component driven by searchParams (contracts/catalog-browse.md).
// No client-side product fetching; CategoryTabs/FilterSidebar/SortBar only
// push new URLs (research.md §2).
export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const rawParams = await searchParams;
  const query = parseCatalogSearchParams(rawParams);
  const { products, totalCount, totalPages } = await queryProducts(query);

  return (
    <>
      <TopNav />
      <main>
        <Container>
          <div className="py-stack-lg">
            <h1 className="mb-stack-md text-display-lg-mobile text-on-background md:text-display-lg">
              المنتجات
            </h1>
            <CategoryTabs activeCategory={query.category} />
            <div className="flex flex-col md:flex-row-reverse gap-gutter mt-stack-lg">
              <FilterSidebar />
              <section className="flex-grow">
                <SortBar totalCount={totalCount} />
                <ProductGrid products={products} />
                <Pagination
                  currentPage={query.page}
                  totalPages={totalPages}
                  searchParams={rawParams as Record<string, string | undefined>}
                />
              </section>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
