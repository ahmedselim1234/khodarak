"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

// Mobile-only nav trigger + dropdown panel. Replaces the old horizontally
// scrollable link strip, which clipped the last link mid-word at narrow
// widths (320–360px) with no visual cue that it was scrollable.
export function MobileNavMenu({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-2 text-primary transition-colors duration-fast hover:bg-primary-container md:hidden"
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        aria-expanded={open}
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-inverse-surface/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-16 z-40 border-b border-outline-variant bg-surface shadow-lg md:hidden">
            <nav className="flex flex-col gap-1 px-margin-mobile py-stack-md">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-body-md font-medium text-on-surface-variant transition-colors duration-fast hover:bg-primary-container hover:text-on-primary-container"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
