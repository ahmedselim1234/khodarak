"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

type RevealAnimation =
  | "fade-up"
  | "fade-in"
  | "slide-in-start"
  | "slide-in-end"
  | "scale-in";

const animationClass: Record<RevealAnimation, string> = {
  "fade-up": "animate-fade-up",
  "fade-in": "animate-fade-in",
  "slide-in-start": "animate-slide-in-start",
  "slide-in-end": "animate-slide-in-end",
  "scale-in": "animate-scale-in",
};

/**
 * Scroll-triggered entrance wrapper.
 *
 * Deliberately a *wrapper* rather than a hook or HOC: `children` arrives as an
 * already-rendered ReactNode from whatever Server Component composed it, so
 * wrapping a server-rendered section does NOT pull that section into the client
 * bundle. Only this file ships to the browser.
 *
 * Every failure mode ends with the content VISIBLE, via four independent
 * guarantees:
 *
 *   1. JavaScript disabled  — `.js` is never added to <html> (see the inline
 *      script in app/layout.tsx), so the `opacity: 0` rule in globals.css is
 *      scoped out and nothing ever hides.
 *   2. prefers-reduced-motion — checked on mount below, revealing immediately
 *      without constructing an observer at all. The CSS carries a matching
 *      `[data-reveal] { opacity: 1 !important }` safety net.
 *   3. No IntersectionObserver — feature-detected, reveals immediately.
 *   4. Observer never fires (element inside a hidden scroll container, browser
 *      quirk) — the failsafe timeout reveals it regardless.
 *
 * The `animate-*` classes all carry `animation-fill-mode: both`, which is what
 * lets the global reduced-motion duration override land them on their final
 * keyframe instead of snapping back to the hidden base state.
 */
export function Reveal({
  as: Tag = "div",
  animation = "fade-up",
  delay = 0,
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  once = true,
  className = "",
  children,
}: {
  as?: ElementType;
  animation?: RevealAnimation;
  /**
   * Stagger, in ms. Applied as an inline `animationDelay` rather than a Tailwind
   * class so arbitrary values need no safelist and generate no extra CSS.
   *
   * Keep this modest. The element stays invisible for the whole delay, so a
   * long one reads as a slow render rather than as choreography — cap a group
   * at roughly 6 steps.
   */
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  /** Set false to re-hide and replay when the element leaves the viewport. */
  once?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      // Deferred by a tick rather than set synchronously here: a synchronous
      // setState in an effect body triggers a cascading render (and trips
      // react-hooks/set-state-in-effect). The visual result is identical, and
      // under reduced motion the CSS guard has already forced visibility.
      const immediate = window.setTimeout(() => setShown(true), 0);
      return () => window.clearTimeout(immediate);
    }

    // The failsafe must distinguish "the observer is broken" from "this element
    // is legitimately still below the fold". A blanket timeout cannot: it fires
    // for every off-screen section too, revealing the whole page after a second
    // and leaving nothing to animate by the time the user scrolls there.
    //
    // IntersectionObserver delivers an initial callback for every observed
    // element shortly after observe(), intersecting or not. So the first
    // callback of any kind proves the observer is alive, and that is what
    // cancels the timeout.
    let failsafe: number | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (failsafe !== undefined) {
          window.clearTimeout(failsafe);
          failsafe = undefined;
        }

        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    failsafe = window.setTimeout(() => {
      setShown(true);
      observer.disconnect();
    }, 1200);

    return () => {
      if (failsafe !== undefined) window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, [once, threshold, rootMargin]);

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? "shown" : "pending"}
      className={`${shown ? animationClass[animation] : ""} ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
