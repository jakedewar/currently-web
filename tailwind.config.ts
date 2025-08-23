import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "float": "float 120s ease-in-out infinite",
        "sail": "sail 180s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "float": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "25%": { transform: "translateY(-10px) translateX(5px)" },
          "50%": { transform: "translateY(-5px) translateX(10px)" },
          "75%": { transform: "translateY(-15px) translateX(5px)" },
        },
        "sail": {
          "0%": { transform: "translateX(-20px) translateY(0px) rotate(-2deg)" },
          "10%": { transform: "translateX(10vw) translateY(-2px) rotate(-1deg)" },
          "20%": { transform: "translateX(20vw) translateY(-4px) rotate(0deg)" },
          "30%": { transform: "translateX(30vw) translateY(-1px) rotate(1deg)" },
          "40%": { transform: "translateX(40vw) translateY(-3px) rotate(2deg)" },
          "50%": { transform: "translateX(50vw) translateY(0px) rotate(1deg)" },
          "60%": { transform: "translateX(60vw) translateY(-2px) rotate(0deg)" },
          "70%": { transform: "translateX(70vw) translateY(-5px) rotate(-1deg)" },
          "80%": { transform: "translateX(80vw) translateY(-1px) rotate(-2deg)" },
          "90%": { transform: "translateX(90vw) translateY(-3px) rotate(-1deg)" },
          "100%": { transform: "translateX(calc(100vw + 20px)) translateY(0px) rotate(-2deg)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
