import type { Config } from "tailwindcss";

/*
 * Design system — "Fresh & Organic", vibrant tuning.
 *
 * Warm cream ground, bright leaf-green primary, hot-tomato secondary, mango
 * accent. The identity is unchanged from the original palette; the values are
 * simply pushed for saturation and brightness.
 *
 * Token NAMES are unchanged from the Material-3 set the ~130 component files
 * already reference — only their values move. That is what lets every page
 * repaint from this one file. New tokens (accent ramp, `*-bright` decoratives,
 * glow shadows, keyframes) are additive.
 *
 * Light palette only, by decision — there are no `dark:` variants in the repo.
 *
 * ── FILL-ONLY TOKENS ────────────────────────────────────────────────────────
 * `accent`, `accent-bright`, `primary-bright` and `secondary-bright` exist for
 * gradient stops, glow shadows and blurred decorative blobs. They are NOT
 * text-contrast safe on light surfaces (`accent` #FFB020 vs white is 1.83 —
 * below even the 3:1 non-text threshold), so `text-accent`, `border-accent`,
 * `text-*-bright` and putting text on a `bg-*-bright` are all banned. Use
 * `on-accent-container` #6B3F00 when you need a text-safe amber (8.99 on white).
 *
 * Every foreground/background pair below was checked against WCAG AA (4.5:1
 * text, 3:1 UI). Two pre-existing failures were fixed in the process: `warning`
 * with white text was 3.64, and `outline` was 3.16 against the cream page.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // — Primary: bright leaf green ——————————————————————
        // #11803D rather than a punchier #12833F: the latter is only 4.40
        // against `surface-container`, and `text-primary` sits on container
        // fills in Plans, HowItWorks and filled Cards. This clears 5.03 on
        // white, 4.86 on `background`, 4.57 on `surface-container`.
        primary: "#11803D",
        "on-primary": "#FFFFFF",
        // Containers are the LIGHT tier in a light theme — callers like
        // `bg-primary-container/10` depend on that.
        "primary-container": "#CDF2DB",
        "on-primary-container": "#0A421F",
        "primary-fixed": "#CDF2DB",
        "primary-fixed-dim": "#6FD79A",
        "on-primary-fixed": "#06301A",
        "on-primary-fixed-variant": "#0E6B34",
        "inverse-primary": "#6FE0A0",
        "surface-tint": "#11803D",
        "primary-bright": "#19A652", // fill only

        // — Secondary: hot tomato ———————————————————————————
        // The vivid #F5602F the direction calls for gives only 3.46 with white
        // text, so the *text-bearing* token is the deeper #C93C10 (5.08 both
        // ways) and the vivid tone lives on as `secondary-bright`, which never
        // carries text.
        secondary: "#C93C10",
        "on-secondary": "#FFFFFF",
        "secondary-container": "#FFE0D2",
        "on-secondary-container": "#7E2A0A",
        "secondary-fixed": "#FFE0D2",
        "secondary-fixed-dim": "#FF9E78",
        "on-secondary-fixed": "#4A1405",
        "on-secondary-fixed-variant": "#A32F09",
        "secondary-bright": "#F5602F", // fill only

        // — Accent: mango ———————————————————————————————————
        // New ramp. See the FILL-ONLY note at the top of this file: `accent`
        // itself is 1.83 on white and must never be a foreground.
        accent: "#FFB020",
        "on-accent": "#3D2600",
        "accent-container": "#FFF4D6",
        "on-accent-container": "#6B3F00",
        "accent-bright": "#FFC94D", // fill only

        // — Tertiary: warm grey-green ———————————————————————
        tertiary: "#5A6157",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#EFEBDE",
        "on-tertiary-container": "#3A3F37",
        "tertiary-fixed": "#EFEBDE",
        "tertiary-fixed-dim": "#C8C6BC",
        "on-tertiary-fixed": "#23261F",
        "on-tertiary-fixed-variant": "#474C43",

        // — Surfaces: warm cream ramp ———————————————————————
        // `background` (cream) and `surface` (white) are deliberately different;
        // when they were the same value, cards were invisible against the page.
        background: "#FDFBF5",
        "on-background": "#1A1D1A",
        surface: "#FFFFFF",
        "on-surface": "#1A1D1A",
        "surface-bright": "#FFFFFF",
        "surface-dim": "#F2ECDD",
        "surface-variant": "#F7F4EC",
        "on-surface-variant": "#5A6157",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#FDFBF5",
        "surface-container": "#F7F4EC",
        "surface-container-high": "#F2ECDD",
        "surface-container-highest": "#EAE2CE",
        // Deep green rather than neutral charcoal — the footer and admin rail
        // now read as part of the brand instead of a generic dark band.
        "inverse-surface": "#14301F",
        "inverse-on-surface": "#EAF5EE",

        // — Lines ——————————————————————————————————————————
        // `outline` is a real UI border (Input, Field), so it must clear 3:1 on
        // every ground. The old #858C81 was 3.16 against the cream page.
        outline: "#767D72",
        "outline-variant": "#E6E1D2", // decorative hairline only

        // — Status ——————————————————————————————————————————
        error: "#CC2E1E",
        "on-error": "#FFFFFF",
        "error-container": "#FFE1DC",
        "on-error-container": "#8C231A",
        success: "#0E7A3B",
        "on-success": "#FFFFFF",
        "success-container": "#CDF2DB",
        "on-success-container": "#0A421F",
        // #B7791F carried white text at 3.64 — an AA failure. #9A6300 is 5.05.
        warning: "#9A6300",
        "on-warning": "#FFFFFF",
        "warning-container": "#FFF4D6",
        "on-warning-container": "#6B3F00",
        info: "#1F6FB2",
        "on-info": "#FFFFFF",
        "info-container": "#DCEBF7",
        "on-info-container": "#173F63",
      },

      fontFamily: {
        // The real default. `--font-arabic` is IBM Plex Sans Arabic, loaded in
        // app/layout.tsx with the `arabic` subset — the previous font was
        // latin-only, so every Arabic glyph in the app fell back to the OS face.
        sans: [
          "var(--font-arabic)",
          "system-ui",
          "Segoe UI",
          "Tahoma",
          "sans-serif",
        ],
        // Legacy aliases. These six used to each map to a (nonexistent) family
        // and are written throughout the codebase as `font-X text-X` pairs.
        // Pointed at the same stack so they're harmless no-ops; remove once the
        // `font-*` half of those pairs has been stripped from the components.
        "display-lg": ["var(--font-arabic)", "system-ui", "sans-serif"],
        "display-lg-mobile": ["var(--font-arabic)", "system-ui", "sans-serif"],
        "headline-md": ["var(--font-arabic)", "system-ui", "sans-serif"],
        "body-lg": ["var(--font-arabic)", "system-ui", "sans-serif"],
        "body-md": ["var(--font-arabic)", "system-ui", "sans-serif"],
        "label-sm": ["var(--font-arabic)", "system-ui", "sans-serif"],
      },

      fontSize: {
        // Existing names, retuned to the compact scale.
        // Arabic needs a looser line-height than Latin for its descenders and
        // diacritics — hence 1.7 on body rather than the usual 1.5.
        "display-lg": [
          "44px",
          { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "display-lg-mobile": [
          "34px",
          { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" },
        ],
        "headline-md": [
          "24px",
          { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "body-lg": ["18px", { lineHeight: "1.65", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.7", fontWeight: "400" }],
        "label-sm": ["14px", { lineHeight: "1.4", fontWeight: "600" }],

        // Added tiers. The old scale jumped 24 → 32 with nothing between, and
        // had no size below 14px, so there was no way to build hierarchy.
        h1: ["30px", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        h3: ["19px", { lineHeight: "1.4", fontWeight: "600" }],
        small: ["14px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["12.5px", { lineHeight: "1.5", fontWeight: "500" }],
        overline: [
          "11.5px",
          { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "600" },
        ],
      },

      spacing: {
        // Existing names kept — they appear as py-stack-lg, gap-gutter, etc.
        "stack-xs": "4px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "32px",
        "stack-xl": "48px",
        "stack-2xl": "64px",
        "stack-3xl": "96px",
        gutter: "24px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        "container-max": "1280px",
        "container-narrow": "720px",
        "container-wide": "1440px",
      },

      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        full: "9999px",
        // The signature shape — kept at 20px, used on every card and button.
        organic: "20px",
      },

      boxShadow: {
        // Green-tinted rather than neutral grey, so shadows read as warm
        // ambient light against the cream ground instead of dirty haze.
        // Retuned to the brighter primary (17,128,61) and deepened slightly.
        xs: "0 1px 2px rgba(20,48,31,0.05)",
        sm: "0 1px 3px rgba(20,48,31,0.07), 0 1px 2px rgba(20,48,31,0.05)",
        md: "0 4px 14px rgba(17,128,61,0.10), 0 1px 3px rgba(20,48,31,0.06)",
        lg: "0 14px 32px rgba(17,128,61,0.13), 0 4px 10px rgba(20,48,31,0.05)",
        xl: "0 28px 56px rgba(17,128,61,0.16), 0 10px 20px rgba(20,48,31,0.05)",
        focus: "0 0 0 3px rgba(17,128,61,0.22)",

        // Saturated hover glows. Reserved for brand-colored surfaces and the
        // primary call to action — a glow under a plain white card just looks
        // like a colour cast.
        "glow-primary": "0 8px 28px -6px rgba(17,128,61,0.45)",
        "glow-secondary": "0 8px 28px -6px rgba(245,96,47,0.45)",
        "glow-accent": "0 8px 28px -6px rgba(255,176,32,0.50)",
        none: "none",
      },

      transitionTimingFunction: {
        "ease-out-quart": "cubic-bezier(0.22, 1, 0.36, 1)",
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      transitionDuration: {
        fast: "150ms",
        DEFAULT: "200ms",
        slow: "300ms",
      },

      /*
       * Motion vocabulary.
       *
       * Two rules hold across every entry below:
       *
       * 1. Only `opacity` and `transform` are animated (plus `background-position`
       *    and `box-shadow` on the ambient loops). Nothing touches height, margin
       *    or layout, so none of this can contribute to CLS.
       *
       * 2. Inline-axis motion goes through `--start-x` / `--end-x`, defined in
       *    app/globals.css. CSS transforms have no logical axis, so a raw
       *    `translateX(20px)` would slide the wrong way under `dir="rtl"` — which
       *    is every page in this app. Never write a physical translate-x in a
       *    keyframe.
       */
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translate3d(0, 16px, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96) translate3d(0, 8px, 0)" },
          to: { opacity: "1", transform: "scale(1) translate3d(0, 0, 0)" },
        },
        "overlay-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        // Enters from the inline-start edge — the right-hand side in RTL.
        "slide-in-start": {
          from: {
            opacity: "0",
            transform: "translate3d(calc(var(--start-x) * 20px), 0, 0)",
          },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "slide-in-end": {
          from: {
            opacity: "0",
            transform: "translate3d(calc(var(--end-x) * 20px), 0, 0)",
          },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "70%": { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" },
        },
        // The track is rendered twice, so a 50% shift loops seamlessly.
        marquee: {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(calc(var(--end-x) * -50%), 0, 0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(17,128,61,0.45)" },
          "70%": { boxShadow: "0 0 0 10px rgba(17,128,61,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(17,128,61,0)" },
        },
      },

      animation: {
        // `both` fill-mode on every entry animation is load-bearing, not
        // cosmetic. The prefers-reduced-motion block in globals.css forces
        // `animation-duration: 0.01ms`; `both` is what makes the element settle
        // on its FINAL keyframe. Without it, a revealed element would snap back
        // to the `opacity: 0` base state and disappear permanently.
        "fade-up": "fade-up 520ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 400ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "overlay-in": "overlay-in 180ms linear both",
        "slide-in-start": "slide-in-start 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-in-end": "slide-in-end 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
        pop: "pop 320ms cubic-bezier(0.22, 1, 0.36, 1)",

        // Ambient loops. These have no meaningful end state, so the
        // reduced-motion block switches them off outright rather than
        // fast-forwarding them.
        "gradient-pan": "gradient-pan 14s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
      },

      maxWidth: {
        "container-narrow": "720px",
        "container-max": "1280px",
        "container-wide": "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
