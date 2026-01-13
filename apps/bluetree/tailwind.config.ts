import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        hand: ['Schoolbell', 'cursive'],
      },
      colors: {
        primary: '#3b82f6',
        'primary-light': '#93c5fd',
        'primary-dark': '#1e3a5f',
        warm: {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fbd9bf',
        },
      },
    },
  },
  plugins: [],
};
export default config;
