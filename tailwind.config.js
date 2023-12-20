/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    colors: {
      black: "#231f20",
    },
    extend: {},
  },
  daisyui: {
    // base: true,
    // styled: true,
    themes: ["night"],
  },
  plugins: [require("daisyui")],
}

