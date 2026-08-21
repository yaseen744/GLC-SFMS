/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef1f8",
          100: "#dde3f2",
          200: "#b9c6e3",
          300: "#8ea3d0",
          400: "#5f78b3",
          500: "#3d5a96",
          600: "#2b4372",
          700: "#1f3257",
          800: "#16233e",
          900: "#0d1526",
        },
        gold: {
          50: "#fdf8ec",
          100: "#f8ecc9",
          200: "#f0d68d",
          300: "#e5bd5c",
          400: "#d2a23a",
          500: "#b5872a",
          600: "#8f6a20",
          700: "#6d5119",
          800: "#4a3711",
          900: "#2c210a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["\"Playfair Display\"", "serif"],
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(20px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-15px, 15px) scale(0.95)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        slideInRight: {
          "0%": { opacity: 0, transform: "translateX(24px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        slideOutLeft: {
          "0%": { opacity: 1, transform: "translateX(0)" },
          "100%": { opacity: 0, transform: "translateX(-24px)" },
        },
        checkPop: {
          "0%": { opacity: 0, transform: "scale(0.4)" },
          "60%": { opacity: 1, transform: "scale(1.15)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        ringPulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(16,185,129,0.35)" },
          "100%": { boxShadow: "0 0 0 14px rgba(16,185,129,0)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(14px,-10px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease-out both",
        fadeInUp: "fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
        scaleIn: "scaleIn 0.25s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.6s infinite linear",
        blob: "blob 9s infinite ease-in-out",
        floatSlow: "floatSlow 4s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out",
        slideInRight: "slideInRight 0.35s cubic-bezier(0.22,1,0.36,1) both",
        slideOutLeft: "slideOutLeft 0.25s cubic-bezier(0.22,1,0.36,1) both",
        checkPop: "checkPop 0.5s cubic-bezier(0.22,1,0.36,1) both",
        ringPulse: "ringPulse 1.6s ease-out infinite",
        drift: "drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
