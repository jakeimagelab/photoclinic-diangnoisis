import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // v4 라이트 톤 — photoclinic.kr 실제 브랜드 컬러
        base: "#E5F0EE",
        elev: "#FFFFFF",
        primary: "#1A1A1A",
        secondary: "#3a3a3a",
        muted: "#6B7572",

        orange: "#E6622A",
        "orange-2": "#E85D2C",
        "orange-soft": "#EB8F22",
        "orange-bg": "rgba(230,98,42,0.08)",
        "orange-line": "rgba(230,98,42,0.30)",

        green: "#0F5254",
        "green-2": "#155855",
        "green-soft": "#569082",
        "green-bg": "rgba(15,82,84,0.08)",
        "green-line": "rgba(15,82,84,0.32)",

        "line-soft": "rgba(15,82,84,0.14)",
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "-apple-system", "sans-serif"],
      },
      letterSpacing: {
        wider2: "0.18em",
      },
    },
  },
  plugins: [],
};
export default config;
