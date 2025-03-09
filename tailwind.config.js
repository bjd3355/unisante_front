/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'uni-green': '#E6F3E6',
        'uni-green-dark': '#4CAF50',
        'uni-orange': '#FF9800',
        'uni-blue': '#2196F3',
      },
    },
  },
  plugins: [],
};