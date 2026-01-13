import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'nb-red': '#fca5a5',
        'nb-red-dark': '#ef4444',
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
