import type { Metadata } from "next";
import { TopNav } from "@/components/ui/TopNav";
import { Footer } from "@/components/ui/Footer";
import { Container } from "@/components/ui/Container";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "صندوقي | خضارك",
  description: "راجع محتويات صندوقك، عدّل الكميات، ثم أكمل اشتراكك.",
};

// /cart — the cart's own page, split out of the subscription builder. The
// builder still owns frequency/date/address; this page owns only "what is in
// the box", so a visitor can review and edit it without being dropped into a
// multi-step wizard. Open to guests too — the guest cart lives in
// localStorage and is merged on sign-in (FR-015).
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
