/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      /* ── Brand palette ─────────────────────────────────── */
      colors: {
        /* bright accent blue – now identical to Tailwind’s blue‑600  (#2563eb) */
        primary: "#2563eb",
        /* darker hover/active shade                         (#1e40af) */
        primaryDark: "#1e40af",

        /* blue‑black backgrounds  ▸ navbar, footer  */
        bgDark: "#0e1629",
        bgDarker: "#0a0d12",
      },
      /* Google‑Font “Poppins” (already imported in index.css) */
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
