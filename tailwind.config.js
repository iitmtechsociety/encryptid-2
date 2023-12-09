/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  daisyui: {
    base: true,
    styled: true,
    themes: [{
      cyberpunk: {
        ...require('daisyui/src/theming/themes')['cyberpunk'],
       "base-100": "#171212"
      }
    }],
  },
  plugins: [require("daisyui")],
}

