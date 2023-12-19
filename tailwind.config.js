/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  daisyui: {
    // base: true,
    // styled: true,
    themes: [ "forest", "dim", "sunset", "night", "dracula",  ],
  },
  plugins: [require("daisyui")],
}

