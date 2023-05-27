/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#eaeaea",
        secondary: "#4d4d4d",
      },
      textColor: {
        default: "#fff",
        primary: "#696969",
        secondary: "#999",
        third: "#666",
        fourth: "#1a1a1a",
        fifth: "#333",
        hoverPrimary: "#483a3a",
        hoverSecondary: "#999",
      },
      fontSize: {
        sm: "0.625rem", // 小号字体大小
        base: "1rem", // 基本字体大小
        lg: "1.125rem", // 大号字体大小
        xl: "1.8rem", // 超大号字体大小
        title: "2rem",
        subTitle: "1.2rem",
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        bold: 600,
        primary: 700,
      },
      borderColor: {
        primary: "#d3d3d3",
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
      },
      transitionDuration: {
        800: "800ms",
        1200: "1200ms",
        2000: "2000ms",
      },
      backgroundImage: {},
    },
  },
  plugins: [],
};
