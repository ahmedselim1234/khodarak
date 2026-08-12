import type { Config } from "tailwindcss";

/*
 * Design system — "Fresh & Organic".
 *
 * Warm cream ground, deep leaf-green primary, ripe-tomato accent. Replaces the
 * palette originally ported from design/home.html, which paired a forest green
 * with a cool blue surface (#f4faff) and set `surface` equal to `background`,
 * so nothing on the page ever had depth.
 *
 * Token NAMES are unchanged from the Material-3 set the ~73 component files
 * already reference — only their values move. That is what lets every page
 * repaint from this one file. New tokens (shadow scale, extra type tiers,
 * semantic status colors) are additive.
 *
 * Light palette only, by decision — there are no `dark:` variants in the repo.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // — Primary: deep leaf green ————————————————————————
        primary: "#1F5D3A",
        "on-primary": "#FFFFFF",
        // NOTE: `primary-container` used to be #1b5e20 — a *dark* green, which
        // inverts the Material-3 contract (containers are the light tier in a
        // light theme). Callers like `bg-primary-container/10` assumed light.
        "primary-container": "#D6E8DD",
        "on-primary-container": "#0F3D25",
        "primary-fixed": "#D6E8DD",
        "primary-fixed-dim": "#7FB894",
        "on-primary-fixed": "#0F3D25",
        "on-primary-fixed-variant": "#1F5D3A",
        "inverse-primary": "#7FB894",
        "surface-tint": "#2A7248",

        // — Secondary: ripe tomato ——————————————————————————
        // Darkened from the swatch #E8623A to clear 4.5:1 on white.
        secondary: "#C24E27",
        "on-secondary": "#FFFFFF",
        "secondary-container": "#FBE2D8",
        "on-secondary-container": "#8A3316",
        "secondary-fixed": "#FBE2D8",
        "secondary-fixed-dim": "#F2A183",
        "on-secondary-fixed": "#4A1A0A",
        "on-secondary-fixed-variant": "#8A3316",

        // — Tertiary: warm grey-green ———————————————————————
        tertiary: "#5A6157",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#EDEAE0",
        "on-tertiary-container": "#3A3F37",
        "tertiary-fixed": "#EDEAE0",
        "tertiary-fixed-dim": "#C8C6BC",
        "on-tertiary-fixed": "#23261F",
        "on-tertiary-fixed-variant": "#474C43",

        // — Surfaces: warm cream ramp ———————————————————————
        // `background` (cream) and `surface` (white) are deliberately different
        // now; when they were both #f4faff, cards were invisible against the page.
        background: "#FBF9F4",
        "on-background": "#1A1D1A",
        surface: "#FFFFFF",
        "on-surface": "#1A1D1A",
        "surface-bright": "#FFFFFF",
        "surface-dim": "#F0EBDF",
        "surface-variant": "#F5F1E8",
        "on-surface-variant": "#5A6157",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#FBF9F4",
        "surface-container": "#F5F1E8",
        "surface-container-high": "#F0EBDF",
        "surface-container-highest": "#E9E3D5",
        "inverse-surface": "#23261F",
        "inverse-on-surface": "#F5F1E8",

        // — Lines ——————————————————————————————————————————
        outline: "#858C81",
        "outline-variant": "#E4E1D8",

        // — Status ——————————————————————————————————————————
        // Only `error` existed before, so status pills and the health badge
        // each invented their own colors inline.
        error: "#C0392B",
        "on-error": "#FFFFFF",
        "error-container": "#FBE4E1",
        "on-error-container": "#8C231A",
        success: "#2A7248",
        "on-success": "#FFFFFF",
        "success-container": "#D6E8DD",
        "on-success-container": "#0F3D25",
        warning: "#B7791F",
        "on-warning": "#FFFFFF",
        "warning-container": "#FDF3DC",
        "on-warning-container": "#7A4E10",
        info: "#2C5F8A",
        "on-info": "#FFFFFF",
        "info-container": "#DDEAF4",
        "on-info-container": "#1B3D59",
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
        xs: "0 1px 2px rgba(26,29,26,0.04)",
        sm: "0 1px 3px rgba(26,29,26,0.06), 0 1px 2px rgba(26,29,26,0.04)",
        md: "0 4px 12px rgba(31,93,58,0.07), 0 1px 3px rgba(26,29,26,0.05)",
        lg: "0 12px 28px rgba(31,93,58,0.09), 0 4px 8px rgba(26,29,26,0.04)",
        xl: "0 24px 48px rgba(31,93,58,0.11), 0 8px 16px rgba(26,29,26,0.04)",
        focus: "0 0 0 3px rgba(31,93,58,0.18)",
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
