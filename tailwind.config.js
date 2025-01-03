/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          DEFAULT: '#232f3e',     
          orange: '#ff9900',      
          'orange-dark': '#ff6600',
          yellow: '#febd69',      
          'light-gray': '#eaeded',
          'dark-gray': '#333333', 
          blue: '#48a3c6',        
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
