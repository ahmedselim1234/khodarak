import Link from "next/link";

function buildHref(searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/browse?${query}` : "/browse";
}

// Server Component — plain <Link>s, no client JS needed (research.md §2).
export function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="mt-stack-lg flex justify-center items-center gap-2" dir="rtl">
      {hasPrev ? (
        <Link
          href={buildHref(searchParams, currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface text-primary hover:bg-primary hover:text-on-primary transition-all border border-outline-variant"
          aria-label="الصفحة السابقة"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      ) : (
        <span className="w-10 h-10 flex items-center justify-center rounded-lg text-outline/40 border border-outline-variant/30">
          <span className="material-symbols-outlined">chevron_right</span>
        </span>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={buildHref(searchParams, page)}
          className={
            page === currentPage
              ? "w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold shadow-md"
              : "w-10 h-10 flex items-center justify-center rounded-lg bg-surface text-primary hover:bg-primary hover:text-on-primary transition-all border border-outline-variant"
          }
        >
          {page}
        </Link>
      ))}

      {hasNext ? (
        <Link
          href={buildHref(searchParams, currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface text-primary hover:bg-primary hover:text-on-primary transition-all border border-outline-variant"
          aria-label="الصفحة التالية"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </Link>
      ) : (
        <span className="w-10 h-10 flex items-center justify-center rounded-lg text-outline/40 border border-outline-variant/30">
          <span className="material-symbols-outlined">chevron_left</span>
        </span>
      )}
    </div>
  );
}
