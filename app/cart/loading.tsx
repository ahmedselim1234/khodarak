import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Feedback";

export default function CartLoading() {
  return (
    <>
      <TopNav />
      <main>
        <Container>
          <div className="py-stack-lg flex flex-col gap-stack-md">
            <Skeleton className="h-9 w-40" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </Container>
      </main>
    </>
  );
}
