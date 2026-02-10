/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        uta: {
          blue: "#0064B1",     // UTA-ish blue
          orange: "#F58025",   // UTA-ish orange
          navy: "#0B2341",
          ice: "#F3F8FF",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2, 8, 23, 0.10)",
        glow: "0 10px 35px rgba(0, 100, 177, 0.20)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};