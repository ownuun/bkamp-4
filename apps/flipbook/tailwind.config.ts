import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'nb-purple': '#c4b5fd',
        'nb-purple-dark': '#8b5cf6',
      },
      boxShadow: {
        'nb': '4px 4px 0px 0px rgba(0,0,0,1)',
        'nb-hover': '6px 6px 0px 0px rgba(0,0,0,1)',
      },
    },
  },
  plugins: [],
};
export default config;
