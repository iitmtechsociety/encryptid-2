/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  daisyui: {
    base: true,
    styled: true,
    themes: ["light", "dark", "cyberpunk", "dim"],
  },
  plugins: [require("daisyui")],
}

