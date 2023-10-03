/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  safelist: [
    {
      pattern: /bg-.*/,
      variants: ["before"],
    },
    {
      pattern: /(h-|min-h-|max-h-).*/,
    },
    {
      pattern: /border-.*/,
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: "#eaeaea",
        secondary: "#4d4d4d",
        success: "#2E8B57",
        success2: "#7aff0a",
        warning: "#eab308",
        info: "#14b8a6",
        debug: "#6b21a8",
        error: "#f44336",
      },
      height: {
        msm: "45vh",
        sm: "50vh",
        base: "65vh",
        lg: "75vh",
        xl: "85vh",
        xxl: "90vh",
      },
      minHeight: {
        msm: "45vh",
        sm: "50vh",
        base: "60vh",
        lg: "70vh",
        xl: "80vh",
        xxl: "90vh",
      },
      textColor: {
        initial: "#000",
        default: "#fff",
        primary: "#696969",
        secondary: "#999",
        third: "#666",
        fourth: "#1a1a1a",
        fifth: "#333",
        hoverPrimary: "#483a3a",
        hoverSecondary: "#999",
        paperRead: "#08c",
        hoverPaperRead: "#0055aa",
      },
      fontSize: {
        sm: "0.625rem", // 小号字体大小
        base: "1rem", // 基本字体大小
        lg: "1.125rem", // 大号字体大小
        xl: "1.8rem", // 超大号字体大小
        title: "2rem",
        subTitle: "1.2rem",
        about: "14px",
      },
      padding: {
        default: "1.2rem",
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        bold: 600,
        primary: 700,
      },
      fontFamily: {
        default: ["Roboto", "sans-serif"],
        about: ["lucia", "sans-serif"],
      },
      backgroundColor: {
        default: "#4d4d4d",
        primary: "#3b82f6",
        primaryActive: "#b9cbe788",
        secondary: "#aeaeae",
        select: "#88acdb",
        hoverSelect: "#4d637f33",
        unSelect: "#4d4d4d",
        hoverUnSelect: "#4d4d4daa",
        tagsShow: "#ffffff33",
        paper: "#fff",
        dark: "#343437fa",
        light: "#fff",
        blockQuote: "#f6f6f6",
        hrLine: "#ddd",
      },
      transitionDuration: {
        800: "800ms",
        1200: "1200ms",
        2000: "2000ms",
      },
      backgroundImage: {},
      borderColor: {
        default: "#ddd",
        primary: "#fff",
        secondary: "#4d4d4d",
        fifth: "#d3d3d3",
        blockQuote: "#657b83",
      },
    },
  },
  plugins: [],
};
