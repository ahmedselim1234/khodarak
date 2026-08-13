import type { Metadata } from "next";
import { TopNav } from "@/components/ui/TopNav";
import { Footer } from "@/components/ui/Footer";
import { Container } from "@/components/ui/Container";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "صندوقي | خضارك",
  description: "راجع محتويات صندوقك، عدّل الكميات، ثم أكمل اشتراكك.",
};


export default function CartPage() {
  return (
    <>
      <TopNav />
      <main>
        <Container>
          <div className="py-stack-lg">
            <CartView />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
