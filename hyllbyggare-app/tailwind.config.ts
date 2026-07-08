import type { Config } from "tailwindcss";

// Tokens från design.md. Färger som oklch(var(--token) / <alpha-value>) så att
// opacitets-states (bg-primary/90 hover, /80 active) fungerar. Byt värden i globals.css.
const c = (name: string) => `oklch(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: c("background"),
        foreground: c("foreground"),
        card: { DEFAULT: c("card"), foreground: c("card-foreground") },
        popover: { DEFAULT: c("popover"), foreground: c("popover-foreground") },
        primary: { DEFAULT: c("primary"), foreground: c("primary-foreground") },
        secondary: { DEFAULT: c("secondary"), foreground: c("secondary-foreground") },
        muted: { DEFAULT: c("muted"), foreground: c("muted-foreground") },
        accent: { DEFAULT: c("accent"), foreground: c("accent-foreground") },
        destructive: { DEFAULT: c("destructive"), foreground: c("destructive-foreground") },
        sale: { DEFAULT: c("sale"), foreground: c("sale-foreground") },
        border: c("border"),
        input: c("input"),
        ring: c("ring"),
      },
      maxWidth: {
        // Maxbredd för sidinnehåll. Bakgrunder (t.ex. headern) går ut i kanten,
        // men innehållet centreras inom denna bredd.
        content: "1920px",
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0",
        button: "var(--radius-button)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        sans: ["var(--font-body)"],
      },
      letterSpacing: { tight: "-0.02em" },
      transitionTimingFunction: {
        default: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.1)",
      },
      transitionDuration: { fast: "150ms", base: "250ms", slow: "350ms" },
    },
  },
  plugins: [],
};
export default config;
